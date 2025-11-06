const mongoose = require('mongoose');

// Schema ตามโครงสร้าง frontend
const chatRoomSchema = new mongoose.Schema({
  // RoomID - ใช้ String แทน ObjectId เพื่อให้ตรงกับ frontend
  RoomID: {
    type: String,
    required: true,
    unique: true
  },

  // roomName - ชื่อห้องแชท/ชื่อธุรกรรม
  roomName: {
    type: String,
    default: 'ห้องแชท'
  },

  // users - เก็บข้อมูล user ทั้งหมดในห้อง เป็น object/map
  // รูปแบบ: { "userId": { name: String, role: String } }
  users: {
    type: Map,
    of: {
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ['buyer', 'seller'],
        required: true
      }
    },
    default: {}
  },

  // messages - เก็บ messages ทั้งหมดเป็น object/map
  // รูปแบบ: { "messageId": { id, sender_id, text, timestamp, type, quotation } }
  messages: {
    type: Map,
    of: {
      id: {
        type: String,
        required: true
      },
      sender_id: String,  // ใช้ sender_id แทน sender ตาม frontend
      text: String,       // ใช้ text แทน message ตาม frontend
      timestamp: {
        type: Number,     // Unix timestamp (seconds) ตาม frontend
        default: () => Math.floor(Date.now() / 1000)
      },
      type: {
        type: String,
        enum: ['text', 'quotation', 'system', 'image'],
        default: 'text'
      },
      // quotation - สำหรับข้อความประเภท quotation
      quotation: {
        productName: String,
        details: String,
        images: String,   // CSV format: "url1,url2,url3"
        price: String,
        status: Boolean   // false = รอการตอบรับ, true = ยอมรับแล้ว
      }
    },
    default: {}
  },

  // เพิ่มฟิลด์เสริมสำหรับการจัดการ (ไม่ส่งไปที่ frontend)
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'dispute'],
    default: 'active'
  },

  trackingNumber: String,  // เลขพัสดุ

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index สำหรับค้นหา
chatRoomSchema.index({ RoomID: 1 });
chatRoomSchema.index({ status: 1 });

// Method สำหรับเพิ่ม user
chatRoomSchema.methods.addUser = function(userId, userName, role) {
  if (!this.users) {
    this.users = new Map();
  }
  this.users.set(userId, { name: userName, role: role });
  return this.save();
};

// Method สำหรับเพิ่มข้อความ
chatRoomSchema.methods.addMessage = function(messageId, messageData) {
  if (!this.messages) {
    this.messages = new Map();
  }
  this.messages.set(messageId, messageData);
  return this.save();
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
