const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ถ้ายังไม่มี
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// กำหนดที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    // แยก folder ตาม fieldname
    if (file.fieldname === 'slip') {
      uploadPath = 'uploads/slips/';
    } else if (file.fieldname === 'chatImage') {
      uploadPath = 'uploads/chat/';
    }

    createFolderIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// กรองไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
  // อนุญาตเฉพาะไฟล์รูปภาพ
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, jpg, png, gif, webp)'), false);
  }
};

// สร้าง multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ 5MB
  },
  fileFilter: fileFilter
});

// Export middleware สำหรับแต่ละประเภท
module.exports = {
  // อัพโหลดสลิปเดียว
  uploadSlip: upload.single('slip'),

  // อัพโหลดรูปในแชทเดียว
  uploadChatImage: upload.single('chatImage'),

  // อัพโหลดหลายรูป (สูงสุด 5 รูป)
  uploadMultipleImages: upload.array('images', 5),

  // ตัว upload หลักสำหรับใช้งานทั่วไป
  upload
};
