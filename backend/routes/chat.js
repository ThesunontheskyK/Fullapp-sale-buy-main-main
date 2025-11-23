const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSlip, uploadChatImage } = require('../middleware/upload');
const ChatRoom = require('../models/ChatRoom');
// ChatMessage - ไม่ต้องใช้แล้ว เพราะเก็บข้อความใน ChatRoom.messages
const Transaction = require('../models/Transaction');

// Helper function: สร้าง RoomID ใหม่//
function generateRoomID() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateMessageID() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// @route   POST /api/chat/rooms
// @desc    สร้างห้องแชทใหม่ (ผู้สร้างเพียงคนเดียว คนอื่นเข้าทีหลัง)
// @access  Private
router.post('/rooms', protect, async (req, res, next) => {
  try {
    const { role, roomName } = req.body;

    // ตรวจสอบข้อมูล
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกบทบาท (role)'
      });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'บทบาทต้องเป็น buyer หรือ seller เท่านั้น'
      });
    }

    // สร้าง RoomID ใหม่ (รหัสห้อง 8 หลัก)
    let roomID = generateRoomID();

    // ตรวจสอบว่า RoomID ซ้ำหรือไม่
    while (await ChatRoom.findOne({ RoomID: roomID })) {
      roomID = generateRoomID();
    }

    // สร้าง users object (เฉพาะผู้สร้างก่อน)
    const users = new Map();
    users.set(req.user.id, {
      name: req.user.fullName || req.user.username,
      role: role
    });

    // สร้างห้องแชทใหม่
    const chatRoom = await ChatRoom.create({
      RoomID: roomID,
      users: users,
      messages: new Map(),
      status: 'active',
      roomName: roomName || 'ห้องแชท'
    });

    res.status(201).json({
      success: true,
      message: 'สร้างห้องแชทสำเร็จ',
      data: {
        chatRoom: {
          RoomID: chatRoom.RoomID,
          users: Object.fromEntries(chatRoom.users),
          messages: Object.fromEntries(chatRoom.messages),
          status: chatRoom.status,
          roomName: chatRoom.roomName
        }
      }
    });
  } catch (error) {
    next(error);
  }
});








// @route   POST /api/chat/rooms/:roomCode/join
// @desc    เข้าร่วมห้องแชทด้วยรหัสห้อง (ระบบกำหนด role ให้อัตโนมัติ)
// @access  Private
router.post('/rooms/:roomCode/join', protect, async (req, res, next) => {
  try {
    const { roomCode } = req.params;

    const chatRoom = await ChatRoom.findOne({ RoomID: roomCode });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชทที่ใช้รหัสนี้'
      });
    }

    if (chatRoom.users && chatRoom.users.has(req.user.id)) {

      return res.status(404).json({
        success: false,
        message: 'คุณเป็นสมาชิกห้องนี้อยู่แล้ว'
      });
    }

    // หา role ที่เหลืออยู่
    const existingRoles = Array.from(chatRoom.users.values()).map(user => user.role);
    let assignedRole;

    if (!existingRoles.includes('buyer')) {
      assignedRole = 'buyer';
    } else if (!existingRoles.includes('seller')) {
      assignedRole = 'seller';
    } else {
      // ถ้าครบทั้ง 2 role แล้ว ให้เป็น buyer (หรืออาจจะ reject)
      return res.status(400).json({
        success: false,
        message: 'ห้องนี้มีสมาชิกครบแล้ว (มีทั้ง buyer และ seller)'
      });
    }

    // เพิ่มผู้ใช้เข้าห้อง
    if (!chatRoom.users) {
      chatRoom.users = new Map();
    }

    chatRoom.users.set(req.user.id, {
      name: req.user.fullName || req.user.username,
      role: assignedRole
    });

    await chatRoom.save();

    // สร้างข้อความระบบแจ้งเตือน
    const messageId = generateMessageID();
    const systemMessage = {
      id: messageId,
      type: 'system',
      text: `${req.user.fullName || req.user.username} เข้าร่วมห้องแชทในฐานะ ${assignedRole === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}`,
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (!chatRoom.messages) {
      chatRoom.messages = new Map();
    }
    chatRoom.messages.set(messageId, systemMessage);
    await chatRoom.save();

    res.status(200).json({
      success: true,
      message: 'เข้าร่วมห้องแชทสำเร็จ',
      data: {
        chatRoom: {
          RoomID: chatRoom.RoomID,
          users: Object.fromEntries(chatRoom.users),
          messages: Object.fromEntries(chatRoom.messages),
          status: chatRoom.status,
          roomName: chatRoom.roomName
        },
        assignedRole: assignedRole // ส่ง role ที่ระบบกำหนดให้กลับไป
      }
    });
  } catch (error) {
    next(error);
  }
});





// @route   GET /api/chat/rooms
// @desc    ดึงรายการห้องแชททั้งหมดของผู้ใช้
// @access  Private
// @route   GET /api/chat/rooms
router.get('/rooms', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const allRooms = await ChatRoom.find({ status: 'active' })
      .select('RoomID roomName users messages status trackingNumber updatedAt');

    const chatRooms = allRooms.filter(room => {
      return room.users && (room.users.has?.(userId) || room.users[userId]);
    });

    // ⬇️ แก้ตรงนี้!
    const formattedRooms = chatRooms.map(room => ({
      RoomID: room.RoomID,
      roomName: room.roomName,
      users: Object.fromEntries(room.users instanceof Map ? room.users : Object.entries(room.users || {})),
      messages: Object.fromEntries(room.messages instanceof Map ? room.messages : Object.entries(room.messages || {})),
      status: room.status,
      trackingNumber: room.trackingNumber,
      updatedAt: room.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: { chatRooms: formattedRooms }
    });
  } catch (error) {
    next(error);
  }
});







// @route   GET /api/chat/rooms/:roomId
// @desc    ดึงข้อมูลห้องแชท (ใช้ RoomID แทน _id)
// @access  Private
router.get('/rooms/:roomId', protect, async (req, res, next) => {
  try {
    const chatRoom = await ChatRoom.findOne({ RoomID: req.params.roomId });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chatRoom: {
          RoomID: chatRoom.RoomID,
          roomName: chatRoom.roomName,
          users: Object.fromEntries(chatRoom.users || new Map()),
          messages: Object.fromEntries(chatRoom.messages || new Map()),
          status: chatRoom.status,
          trackingNumber: chatRoom.trackingNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
});






// @route   POST /api/chat/rooms/:roomId/messages
// @desc    ส่งข้อความในห้องแชท (ตามโครงสร้าง frontend)
// @access  Private
router.post('/rooms/:roomId/messages', protect, async (req, res, next) => {
  try {
    const { text, type, quotation } = req.body;
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ส่งข้อความในห้องแชทนี้'
      });
    }

    // สร้าง message ID
    const messageId = generateMessageID();

    // สร้างข้อความใหม่ตามโครงสร้าง frontend
    const newMessage = {
      id: messageId,
      sender_id: req.user.id,
      text: text || '',
      timestamp: Math.floor(Date.now() / 1000),
      type: type || 'text'
    };

    // เพิ่ม quotation ถ้ามี
    if (type === 'quotation' && quotation) {
      newMessage.quotation = {
        productName: quotation.productName,
        details: quotation.details,
        images: quotation.images, // CSV format
        price: quotation.price,
        status: quotation.status || false
      };
    }

    // เพิ่มข้อความลงใน messages Map
    if (!chatRoom.messages) {
      chatRoom.messages = new Map();
    }
    chatRoom.messages.set(messageId, newMessage);

    await chatRoom.save();

    // หมายเหตุ: ไม่ต้องบันทึกลง ChatMessage collection แยก
    // เพราะเก็บใน ChatRoom.messages แล้ว (ตรงกับ frontend structure)

    res.status(201).json({
      success: true,
      message: 'ส่งข้อความสำเร็จ',
      data: {
        message: newMessage,
        RoomID: roomId
      }
    });
  } catch (error) {
    next(error);
  }
});











// @route   GET /api/chat/rooms/:roomId/messages
// @desc    ดึงข้อความทั้งหมดในห้องแชท
// @access  Private

router.get('/rooms/:roomId/messages', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // แปลง messages Map เป็น Object
    const messages = Object.fromEntries(chatRoom.messages || new Map());

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
});









// @route   DELETE /api/chat/rooms/:roomId/messages/:messageId
// @desc    ลบข้อความในห้องแชท (เฉพาะเจ้าของข้อความ)
// @access  Private
router.delete('/rooms/:roomId/messages/:messageId', protect, async (req, res, next) => {
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

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงห้องแชทนี้'
      });
    }

    // ตรวจสอบว่าข้อความนี้มีอยู่จริง
    const message = chatRoom.messages.get(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อความที่ต้องการลบ'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของข้อความหรือไม่
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ลบข้อความนี้ เฉพาะผู้ส่งเท่านั้นที่สามารถลบได้'
      });
    }

    // ลบข้อความออกจาก Map
    chatRoom.messages.delete(messageId);
    await chatRoom.save();

    res.status(200).json({
      success: true,
      message: 'ลบข้อความสำเร็จ',
      data: {
        messageId,
        RoomID: roomId
      }
    });
  } catch (error) {
    next(error);
  }
});







// @route   PUT /api/chat/rooms/:roomId/complete
// @desc    ยืนยันการได้รับของและเสร็จสิ้นการซื้อขาย
// @access  Private
router.put('/rooms/:roomId/complete', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;

    // ดึงข้อมูลห้องแชท
    const chatRoom = await ChatRoom.findOne({ RoomID: roomId });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องแชท'
      });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของห้องแชทหรือไม่
    if (!chatRoom.users || !chatRoom.users.has(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขห้องแชทนี้'
      });
    }

    // เปลี่ยนสถานะเป็น completed
    chatRoom.status = 'completed';
    await chatRoom.save();

    // สร้างข้อความระบบแจ้งเตือน
    const messageId = generateMessageID();
    const systemMessage = {
      id: messageId,
      type: 'system',
      text: 'ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์',
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (!chatRoom.messages) {
      chatRoom.messages = new Map();
    }
    chatRoom.messages.set(messageId, systemMessage);
    await chatRoom.save();

    res.status(200).json({
      success: true,
      message: 'ยืนยันการได้รับของสำเร็จ',
      data: {
        status: chatRoom.status,
        systemMessage
      }
    });
  } catch (error) {
    next(error);
  }
});








// @route   PUT /api/chat/rooms/:roomId/quotation/:messageId
// @desc    ตอบรับ/ปฏิเสธใบเสนอราคา
// @access  Private
router.put('/rooms/:roomId/quotation/:messageId', protect, async (req, res, next) => {
    try {
        const { roomId, messageId } = req.params;
        const newStatus = true; // ตั้งค่าสถานะเป็น true ตามที่คุณต้องการ

        const updatePath = `messages.${messageId}.quotation.status`;

        const result = await ChatRoom.updateOne(
            { 
                RoomID: roomId,

                [`messages.${messageId}.type`]: 'quotation' 
            },
            {
                $set: { 
                    [updatePath]: newStatus 
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท หรือ ใบเสนอราคาที่ต้องการ' });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ success: true, message: 'สถานะถูกตั้งค่าเป็น true อยู่แล้ว' });
        }

        res.status(200).json({
            success: true,
            message: `สถานะ quotation ID ${messageId} ถูกอัปเดตเป็น true เรียบร้อยแล้ว`,
            data: result
        });

    } catch (error) {
        next(error);
    }
});

// เก็บ Transaction endpoints เดิมไว้ (ยังใช้งานได้)
// ... (Transaction routes จากเดิม)

module.exports = router;
