const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // ห้องแชทที่เกี่ยวข้อง
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, 'กรุณาระบุห้องแชท']
  },
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
  // ข้อมูลสินค้า/บริการ
  productInfo: {
    name: {
      type: String,
      required: [true, 'กรุณาระบุชื่อสินค้า']
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    }
  },
  // ยอดเงิน
  amount: {
    type: Number,
    required: [true, 'กรุณาระบุยอดเงิน'],
    min: [0, 'ยอดเงินต้องมากกว่า 0']
  },
  // สลิปการโอนเงิน
  paymentSlip: {
    url: {
      type: String,
      required: [true, 'กรุณาอัพโหลดสลิปการโอน']
    },
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  // สถานะธุรกรรม
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // หมายเหตุ
  notes: {
    type: String,
    trim: true
  },
  // ประวัติการเปลี่ยนสถานะ
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'refunded']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  // วันที่ยืนยัน
  confirmedAt: Date,
  // วันที่เสร็จสิ้น
  completedAt: Date,
  // ข้อมูลเพิ่มเติม
  metadata: {
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
transactionSchema.index({ chatRoom: 1 });
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
