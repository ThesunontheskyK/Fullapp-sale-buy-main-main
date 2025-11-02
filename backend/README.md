# SavePro Backend API

Backend สำหรับแอปพลิเคชัน SavePro ที่ใช้ Node.js, Express, และ MongoDB

## คุณสมบัติ

- ระบบ Authentication (Login/Register)
- การจัดการ User Profile
- JWT Token-based Authentication
- Password Hashing with bcrypt
- MongoDB Database
- Error Handling Middleware
- CORS Support

## การติดตั้ง

### ข้อกำหนดเบื้องต้น

- Node.js (v14 หรือสูงกว่า)
- MongoDB (Local หรือ MongoDB Atlas)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env` และตั้งค่า environment variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/savepro
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. เริ่มต้น MongoDB Server (ถ้าใช้ local):
```bash
mongod
```

4. รันเซิร์ฟเวอร์:

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register (สมัครสมาชิก)
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "fullName": "Test User",
  "phoneNumber": "0812345678"
}
```

#### Login (เข้าสู่ระบบ)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

#### Get Current User (ดึงข้อมูลผู้ใช้ปัจจุบัน)
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile (อัพเดทข้อมูลส่วนตัว)
```
PUT /api/auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phoneNumber": "0898765432",
  "profileImage": "https://example.com/image.jpg"
}
```

#### Change Password (เปลี่ยนรหัสผ่าน)
```
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

## โครงสร้างโปรเจค

```
backend/
├── config/
│   └── database.js         # การตั้งค่า MongoDB
├── middleware/
│   ├── auth.js            # Middleware สำหรับ authentication
│   └── errorHandler.js    # Middleware สำหรับจัดการ error
├── models/
│   └── User.js            # MongoDB User model
├── routes/
│   └── auth.js            # Authentication routes
├── .env                   # Environment variables
├── .env.example           # ตัวอย่าง environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js              # Main server file
```

## การทดสอบด้วย Postman หรือ Thunder Client

1. เปิด Postman หรือ Thunder Client
2. Import collection หรือทดสอบ endpoints ตามที่ระบุด้านบน
3. สำหรับ Protected routes ให้ใส่ token ใน Authorization header:
   - Type: Bearer Token
   - Token: <JWT token ที่ได้จากการ login>

## Security

- Passwords จะถูก hash ด้วย bcryptjs ก่อนบันทึกลง database
- JWT tokens ใช้สำหรับ authentication
- CORS enabled สำหรับ cross-origin requests
- Error handling ที่ครอบคลุม

## ข้อควรระวัง

- เปลี่ยน `JWT_SECRET` ใน `.env` เป็นค่าที่ปลอดภัยก่อน deploy production
- อย่า commit ไฟล์ `.env` เข้า git
- ตรวจสอบให้แน่ใจว่า MongoDB ทำงานอยู่ก่อนรัน server

## License

ISC
