const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const ChatRoom = require('../models/ChatRoom');

// Helper function: สร้าง Message ID ใหม่
function generateMessageID() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// @route   POST /api/payment/rooms/:roomId/quotation
// @desc    สร้างใบเสนอราคาใหม่ (สำหรับผู้ขาย)
// @access  Private
router.post('/rooms/:roomId/quotation', protect, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { productName, details, images, price } = req.body;

    // Validate ข้อมูล
    if (!productName || !details || !price) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (productName, details, price)'
      });
    }

    // ตรวจสอบว่า room มีอยู่จริง
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชท
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // สร้าง Payment record
    const payment = await Payment.create({
      RoomID: roomId,
      sender_id: req.user.id,
      type: 'quotation',
      quotation: {
        productName,
        details,
        images: images || '',
        price,
        status: false
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

    // สร้างข้อความใน ChatRoom (เก็บ payment ใน messages)
    const messageId = generateMessageID();
    const paymentMessage = {
      id: messageId,
      sender_id: req.user.id,
      type: 'quotation',
      quotation: {
        productName,
        details,
        images: images || '',
        price,
        status: false
      },
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (!chatRoom.messages) {
      chatRoom.messages = new Map();
    }
    chatRoom.messages.set(messageId, paymentMessage);
    await chatRoom.save();

    res.status(201).json({
      success: true,
      message: 'สร้างใบเสนอราคาสำเร็จ',
      data: {
        payment,
        messageId,
        RoomID: roomId
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payment/rooms/:roomId
// @desc    ดึงข้อมูล payment ทั้งหมดในห้อง
// @access  Private
router.get('/rooms/:roomId', protect, async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // ตรวจสอบว่า room มีอยู่จริง
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชท
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // ดึง payments ทั้งหมดในห้อง
    const payments = await Payment.find({ RoomID: roomId })
      .sort({ timestamp: -1 }); // เรียงจากใหม่ไปเก่า

    res.status(200).json({
      success: true,
      data: {
        payments,
        count: payments.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payment/:paymentId
// @desc    ดึงข้อมูล payment เดียว
// @access  Private
router.get('/:paymentId', protect, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูล payment'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: payment.RoomID });
    if (!chatRoom || !chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/payment/rooms/:roomId/quotation/:messageId
// @desc    อัพเดทสถานะใบเสนอราคา (ชำระเงิน/ปฏิเสธ)
// @access  Private
router.put('/rooms/:roomId/quotation/:messageId', protect, async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    const { status } = req.body; // true = ชำระเงินแล้ว, false = ปฏิเสธ

    if (typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะ (status: true/false)'
      });
    }

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชท
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้'
      });
    }

    // หาข้อความที่เป็น quotation
    const message = chatRoom.messages.get(messageId);
    if (!message || message.type !== 'quotation') {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสนอราคา'
      });
    }

    // อัพเดทสถานะใน ChatRoom messages
    message.quotation.status = status;
    chatRoom.messages.set(messageId, message);
    await chatRoom.save();

    // อัพเดทสถานะใน Payment collection (ถ้ามี)
    const payment = await Payment.findOne({
      RoomID: roomId,
      sender_id: message.sender_id,
      timestamp: message.timestamp
    });

    if (payment) {
      payment.quotation.status = status;
      await payment.save();
    }

    // สร้างข้อความระบบแจ้งเตือน
    const systemMessageId = generateMessageID();
    const systemMessage = {
      id: systemMessageId,
      type: 'system',
      text: status
        ? 'ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ'
        : 'ผู้ซื้อปฏิเสธใบเสนอราคา',
      timestamp: Math.floor(Date.now() / 1000)
    };

    chatRoom.messages.set(systemMessageId, systemMessage);
    await chatRoom.save();

    res.status(200).json({
      success: true,
      message: status ? 'ยืนยันการชำระเงินสำเร็จ' : 'ปฏิเสธใบเสนอราคาสำเร็จ',
      data: {
        message,
        systemMessage,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/payment/:paymentId
// @desc    ลบ payment record (admin only หรือ เจ้าของ)
// @access  Private
router.delete('/:paymentId', protect, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูล payment'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของหรือไม่
    if (payment.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ลบข้อมูลนี้'
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'ลบข้อมูล payment สำเร็จ'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
