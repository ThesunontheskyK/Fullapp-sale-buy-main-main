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
        createRoom: 'POST /api/chat/rooms (Protected)',
        getRooms: 'GET /api/chat/rooms (Protected)',
        getRoom: 'GET /api/chat/rooms/:roomId (Protected)',
        sendMessage: 'POST /api/chat/rooms/:roomId/messages (Protected)',
        sendImage: 'POST /api/chat/rooms/:roomId/messages/upload (Protected)',
        getMessages: 'GET /api/chat/rooms/:roomId/messages (Protected)',
        markAsRead: 'PUT /api/chat/rooms/:roomId/read (Protected)',
        createTransaction: 'POST /api/chat/transactions (Protected)',
        getTransaction: 'GET /api/chat/transactions/:transactionId (Protected)',
        updateTransactionStatus: 'PUT /api/chat/transactions/:transactionId/status (Protected)',
        getRoomTransactions: 'GET /api/chat/rooms/:roomId/transactions (Protected)'
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
