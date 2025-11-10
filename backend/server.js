const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// เชื่อมต่อ MongoDB
connectDatabase();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static files - สำหรับให้เข้าถึงไฟล์อัพโหลด
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SavePro Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
        updateProfile: 'PUT /api/auth/update-profile (Protected)',
        changePassword: 'PUT /api/auth/change-password (Protected)'
      },
      chat: {
        createRoom: 'POST /api/chat/rooms (Protected) - สร้างห้องแชทใหม่',
        joinRoom: 'POST /api/chat/rooms/:roomCode/join (Protected) - เข้าร่วมห้องด้วยรหัส',
        getRooms: 'GET /api/chat/rooms (Protected) - ดูรายการห้องทั้งหมด',
        getRoom: 'GET /api/chat/rooms/:roomId (Protected) - ดูข้อมูลห้อง',
        sendMessage: 'POST /api/chat/rooms/:roomId/messages (Protected) - ส่งข้อความ',
        sendImage: 'POST /api/chat/rooms/:roomId/messages/upload (Protected) - ส่งรูปภาพ',
        getMessages: 'GET /api/chat/rooms/:roomId/messages (Protected) - ดึงข้อความทั้งหมด',
        updateTracking: 'PUT /api/chat/rooms/:roomId/tracking (Protected) - อัพเดทเลขพัสดุ',
        completeRoom: 'PUT /api/chat/rooms/:roomId/complete (Protected) - ยืนยันการได้รับของ',
        updateQuotation: 'PUT /api/chat/rooms/:roomId/quotation/:messageId (Protected) - อัพเดทใบเสนอราคา'
      },
      socketIO: {
        events: 'Socket.io real-time events available',
        joinRoom: 'join-room - เข้าร่วมห้องแชท',
        sendMessage: 'send-message - ส่งข้อความแบบ real-time',
        receiveMessage: 'receive-message - รับข้อความแบบ real-time',
        leaveRoom: 'leave-room - ออกจากห้องแชท'
      }
    }
  });
});

// Error handler (ต้องอยู่หลังสุด)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   SavePro Backend Server Running      ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV}           ║
╚════════════════════════════════════════╝
  `);
});

// ตั้งค่า Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // เข้าร่วมห้องแชท
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', { socketId: socket.id });
  });

  // ส่งข้อความ
  socket.on('send-message', (data) => {
    const { roomId, message } = data;
    console.log(`Message sent to room ${roomId}:`, message);
    // ส่งข้อความไปยังทุกคนในห้อง (รวมตัวเอง)
    io.to(roomId).emit('receive-message', message);
  });

  // ลบข้อความ
  socket.on('delete-message', (data) => {
    const { roomId, messageId } = data;
    console.log(`Message ${messageId} deleted in room ${roomId}`);
    // แจ้งทุกคนในห้องว่ามีข้อความถูกลบ (รวมตัวเอง)
    io.to(roomId).emit('message-deleted', { messageId, roomId });
  });

  // ออกจากห้องแชท
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('user-left', { socketId: socket.id });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
