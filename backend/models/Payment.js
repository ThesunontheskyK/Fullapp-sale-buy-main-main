const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'กรุณาระบุชื่อสินค้า']
  },
  details: {
    type: String,
    required: [true, 'กรุณาระบุรายละเอียดสินค้า']
  },
  images: {
    type: String, // CSV format หรือ array of URLs
    default: ''
  },
  price: {
    type: String, // เก็บเป็น String เหมือน frontend
    required: [true, 'กรุณาระบุราคา']
  },
  status: {
    type: Boolean,
    default: false // false = รอการชำระเงิน, true = ชำระเงินแล้ว
  }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  RoomID: {
    type: String,
    required: [true, 'กรุณาระบุ RoomID'],
    ref: 'ChatRoom'
  },
  sender_id: {
    type: String,
    required: [true, 'กรุณาระบุผู้ส่ง']
  },
  type: {
    type: String,
    enum: ['quotation', 'payment_slip'],
    required: [true, 'กรุณาระบุประเภท payment']
  },
  quotation: {
    type: QuotationSchema,
    required: function() {
      return this.type === 'quotation';
    }
  },
  timestamp: {
    type: Number,
    default: () => Math.floor(Date.now() / 1000)
  }
}, {
  timestamps: true
});

// Index สำหรับค้นหา payment ด้วย RoomID
PaymentSchema.index({ RoomID: 1, timestamp: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
