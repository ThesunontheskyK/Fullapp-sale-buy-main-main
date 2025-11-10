const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ChatRoom = require('../models/ChatRoom');
const { protect } = require('../middleware/auth');

// @desc    สร้างรายการชำระเงินจากใบเสนอราคา
// @route   POST /api/payment/create-from-quotation
// @access  Private
router.post('/create-from-quotation', protect, async (req, res) => {
  try {
    const { chatRoomId, quotationMessageId } = req.body;

    if (!chatRoomId || !quotationMessageId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ chatRoomId และ quotationMessageId'
      });
    }

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ดึงข้อความใบเสนอราคา
    const quotationMessage = chatRoom.messages.get(quotationMessageId);
    if (!quotationMessage || quotationMessage.type !== 'quotation') {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสนอราคา'
      });
    }

    // ตรวจสอบว่าใบเสนอราคาถูกยอมรับแล้วหรือไม่
    if (!quotationMessage.quotation || !quotationMessage.quotation.status) {
      return res.status(400).json({
        success: false,
        message: 'ใบเสนอราคายังไม่ได้รับการยอมรับ'
      });
    }

    // ตรวจสอบว่ามี payment สำหรับใบเสนอราคานี้อยู่แล้วหรือไม่
    const existingPayment = await Payment.findOne({
      chatRoom: chatRoomId,
      quotationMessageId: quotationMessageId
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'มีรายการชำระเงินสำหรับใบเสนอราคานี้อยู่แล้ว',
        payment: existingPayment
      });
    }

    // หา buyer และ seller จาก users ในห้องแชท
    const usersMap = chatRoom.users;
    let buyer = null;
    let seller = null;

    for (const [userId, userData] of usersMap) {
      if (userData.role === 'buyer') {
        buyer = { userId, name: userData.name };
      } else if (userData.role === 'seller') {
        seller = { userId, name: userData.name };
      }
    }

    if (!buyer || !seller) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูล buyer หรือ seller ในห้องแชท'
      });
    }

    // แปลงราคาจาก string เป็น number
    const priceValue = parseFloat(quotationMessage.quotation.price);
    if (isNaN(priceValue)) {
      return res.status(400).json({
        success: false,
        message: 'ราคาในใบเสนอราคาไม่ถูกต้อง'
      });
    }

    // สร้างรายการชำระเงิน
    const payment = await Payment.create({
      chatRoom: chatRoomId,
      quotationMessageId: quotationMessageId,
      buyer: buyer,
      seller: seller,
      productInfo: {
        productName: quotationMessage.quotation.productName,
        details: quotationMessage.quotation.details,
        images: quotationMessage.quotation.images
      },
      price: priceValue,
      paymentStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        updatedAt: new Date(),
        note: 'สร้างรายการชำระเงินจากใบเสนอราคา'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'สร้างรายการชำระเงินสำเร็จ',
      payment: payment
    });

  } catch (error) {
    console.error('Error creating payment from quotation:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน',
      error: error.message
    });
  }
});

// @desc    ดึงข้อมูลรายการชำระเงินจาก chatRoom
// @route   GET /api/payment/room/:roomId
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const payments = await Payment.find({ chatRoom: roomId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
});

// @desc    ดึงข้อมูลรายการชำระเงินจาก payment ID
// @route   GET /api/payment/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบรายการชำระเงิน'
      });
    }

    res.json({
      success: true,
      payment: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
});

// @desc    ดึงข้อมูลรายการชำระเงินของผู้ใช้ (ทั้ง buyer และ seller)
// @route   GET /api/payment/my-payments
// @access  Private
router.get('/my-payments', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const payments = await Payment.find({
      $or: [
        { 'buyer.userId': userId },
        { 'seller.userId': userId }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
});

// @desc    ดึงข้อมูลรายละเอียดใบเสนอราคาจาก chatRoom และ messageId
// @route   GET /api/payment/quotation/:roomId/:messageId
// @access  Private
router.get('/quotation/:roomId/:messageId', protect, async (req, res) => {
  try {
    const { roomId, messageId } = req.params;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ดึงข้อความใบเสนอราคา
    const quotationMessage = chatRoom.messages.get(messageId);
    if (!quotationMessage || quotationMessage.type !== 'quotation') {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบเสนอราคา'
      });
    }

    // หา buyer และ seller จาก users ในห้องแชท
    const usersMap = chatRoom.users;
    let buyer = null;
    let seller = null;

    for (const [userId, userData] of usersMap) {
      if (userData.role === 'buyer') {
        buyer = { userId, name: userData.name };
      } else if (userData.role === 'seller') {
        seller = { userId, name: userData.name };
      }
    }

    // ตรวจสอบว่ามี payment อยู่แล้วหรือไม่
    const existingPayment = await Payment.findOne({
      chatRoom: roomId,
      quotationMessageId: messageId
    });

    res.json({
      success: true,
      quotation: {
        messageId: messageId,
        chatRoom: roomId,
        roomName: chatRoom.roomName,
        productName: quotationMessage.quotation?.productName,
        details: quotationMessage.quotation?.details,
        images: quotationMessage.quotation?.images,
        price: quotationMessage.quotation?.price,
        status: quotationMessage.quotation?.status,
        timestamp: quotationMessage.timestamp,
        buyer: buyer,
        seller: seller,
        hasPayment: !!existingPayment,
        paymentId: existingPayment?._id
      }
    });

  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
});

module.exports = router;
