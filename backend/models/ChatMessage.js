const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  // ห้องแชทที่ข้อความนี้อยู่
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, 'กรุณาระบุห้องแชท']
  },
  // ผู้ส่งข้อความ
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'กรุณาระบุผู้ส่งข้อความ']
  },
  // บทบาทของผู้ส่ง ณ เวลาที่ส่ง
  senderRole: {
    type: String,
    enum: ['buyer', 'seller'],
    required: [true, 'กรุณาระบุบทบาทผู้ส่ง']
  },
  // ประเภทข้อความ
  messageType: {
    type: String,
    enum: ['text', 'image', 'slip', 'system'],
    default: 'text'
  },
  // เนื้อหาข้อความ
  message: {
    type: String,
    trim: true
  },
  // ไฟล์แนบ (สลิป หรือรูปภาพ)
  attachments: [{
    url: {
      type: String,
      required: true
    },
    fileName: String,
    fileType: String, // 'image/png', 'image/jpeg', etc.
    fileSize: Number
  }],
  // สถานะการอ่าน
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // ข้อมูลธุรกรรม (ถ้าข้อความนี้เกี่ยวข้องกับการชำระเงิน)
  transactionInfo: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index สำหรับค้นหาข้อความในห้องแชท
chatMessageSchema.index({ chatRoom: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
