const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // ห้องแชทที่เกี่ยวข้อง
  chatRoom: {
    type: String,  // RoomID from ChatRoom
    required: [true, 'กรุณาระบุห้องแชท']
  },

  // ข้อความใบเสนอราคาที่เกี่ยวข้อง
  quotationMessageId: {
    type: String,
    required: [true, 'กรุณาระบุ message ID ของใบเสนอราคา']
  },

  // ผู้ซื้อ
  buyer: {
    userId: {
      type: String,
      required: [true, 'กรุณาระบุผู้ซื้อ']
    },
    name: String
  },

  // ผู้ขาย
  seller: {
    userId: {
      type: String,
      required: [true, 'กรุณาระบุผู้ขาย']
    },
    name: String
  },

  // ข้อมูลสินค้าจากใบเสนอราคา
  productInfo: {
    productName: {
      type: String,
      required: [true, 'กรุณาระบุชื่อสินค้า']
    },
    details: String,
    images: String  // CSV format: "url1,url2,url3"
  },

  // ราคาจากใบเสนอราคา
  price: {
    type: Number,
    required: [true, 'กรุณาระบุราคา'],
    min: [0, 'ราคาต้องมากกว่า 0']
  },

  // สถานะการชำระเงิน
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // สลิปการโอนเงิน (เพิ่มทีหลังเมื่อลูกค้าอัพโหลด)
  paymentSlip: {
    url: String,
    fileName: String,
    uploadedAt: Date
  },

  // ข้อมูลการชำระเงิน
  paymentInfo: {
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'promptpay', 'credit_card', 'cash', 'other'],
      default: 'bank_transfer'
    },
    bankName: String,
    accountNumber: String,
    transferDate: Date,
    referenceNumber: String
  },

  // วันที่ชำระเงิน
  paidAt: Date,

  // วันที่ยืนยันการชำระเงิน
  confirmedAt: Date,

  // หมายเหตุ
  notes: String,

  // ประวัติการเปลี่ยนสถานะ
  statusHistory: [{
    status: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],

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
paymentSchema.index({ chatRoom: 1 });
paymentSchema.index({ 'buyer.userId': 1 });
paymentSchema.index({ 'seller.userId': 1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });
paymentSchema.index({ quotationMessageId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
