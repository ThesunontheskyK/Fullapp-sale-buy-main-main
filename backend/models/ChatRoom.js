const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  // ผู้ซื้อ
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'กรุณาระบุผู้ซื้อ']
  },
  // ผู้ขาย
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'กรุณาระบุผู้ขาย']
  },
  // สถานะห้องแชท
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'dispute'],
    default: 'active'
  },
  // ข้อมูลสินค้า/บริการที่ซื้อขาย (ถ้ามี)
  productInfo: {
    name: String,
    description: String,
    price: Number,
    quantity: Number
  },
  // ข้อความล่าสุด (เพื่อแสดงในหน้า list)
  lastMessage: {
    message: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  // จำนวนข้อความที่ยังไม่ได้อ่าน (แยกตาม user)
  unreadCount: {
    buyer: {
      type: Number,
      default: 0 
    },
    seller: {
      type: Number,
      default: 0
    }
  },
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

// Index สำหรับค้นหาห้องแชทของ user
chatRoomSchema.index({ buyer: 1, seller: 1 });
chatRoomSchema.index({ status: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
