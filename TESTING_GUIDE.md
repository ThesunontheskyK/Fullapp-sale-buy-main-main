# คู่มือการทดสอบระบบ Login

## 1. เตรียม Backend Server

### 1.1 ติดตั้ง MongoDB
```bash
# ดาวน์โหลดและติดตั้ง MongoDB จาก https://www.mongodb.com/try/download/community
# หรือใช้ MongoDB Atlas (Cloud)

# สำหรับ Windows: รัน MongoDB
# ตรวจสอบว่า MongoDB รันอยู่ที่ port 27017
```

### 1.2 เริ่ม Backend Server
```bash
cd backend

# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# รัน server
npm run dev
```

ควรเห็น output ประมาณนี้:
```
╔════════════════════════════════════════╗
║   SavePro Backend Server Running      ║
║   Port: 5000                           ║
║   Environment: development             ║
╚════════════════════════════════════════╝
MongoDB Connected: localhost
```

### 1.3 ทดสอบ Backend API
เปิดเบราว์เซอร์ไปที่ `http://localhost:5000/` ควรเห็น:
```json
{
  "message": "SavePro Backend API",
  "version": "1.0.0",
  ...
}
```

---

## 2. ตั้งค่า Frontend

### 2.1 แก้ไข API URL (สำคัญ!)

**สำหรับ Android Emulator:**
- ไฟล์ `frontend/config/api.js` จะใช้ `http://10.0.2.2:5000/api` อัตโนมัติ

**สำหรับ Android Physical Device:**
```javascript
// แก้ไขไฟล์ frontend/config/api.js
const CUSTOM_IP = 'http://YOUR_COMPUTER_IP:5000/api';
// เช่น const CUSTOM_IP = 'http://192.168.1.100:5000/api';
```

**หา IP ของเครื่องคอมพิวเตอร์:**
```bash
# Windows
ipconfig
# ดูที่ IPv4 Address ของ Wireless LAN adapter Wi-Fi หรือ Ethernet

# Mac/Linux
ifconfig
# ดูที่ inet ของ en0 หรือ wlan0
```

**สำหรับ iOS Simulator / Web:**
- ใช้ `http://localhost:5000/api` (ค่า default)

### 2.2 เริ่ม Frontend
```bash
cd frontend

# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# รัน frontend
npm start
```

---

## 3. สร้างบัญชีผู้ใช้ทดสอบ

### 3.1 ใช้ API Register
ใช้ Postman, Thunder Client, หรือ curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456",
    "fullName": "Test User",
    "phoneNumber": "0812345678"
  }'
```

หรือ

### 3.2 ใช้หน้า Register ใน App (ถ้ามี)

---

## 4. ทดสอบ Login

1. เปิด Frontend (ควรเห็นหน้า Login เป็นหน้าแรก)
2. กรอก:
   - Email: `test@example.com`
   - Password: `123456`
3. กดปุ่ม "Sign in"

### ผลลัพธ์ที่คาดหวัง:
- แสดง Alert "เข้าสู่ระบบสำเร็จ"
- นำทางไปหน้า OTP (หรือหน้าถัดไป)

---

## 5. แก้ไขปัญหา Network Error

### ตรวจสอบ Console Log
ดู console log ใน Metro bundler ควรเห็น:
```
API Base URL: http://10.0.2.2:5000/api  (Android Emulator)
API Base URL: http://localhost:5000/api (iOS/Web)
```

### ปัญหาที่พบบ่อย:

#### 1. Backend ไม่ได้รัน
- ตรวจสอบว่า backend server รันอยู่
- เช็ค terminal ที่รัน `npm run dev`

#### 2. MongoDB ไม่ได้รัน
- ตรวจสอบว่า MongoDB รันอยู่
- Windows: เช็คใน Services หรือ Task Manager
- Mac/Linux: `ps aux | grep mongod`

#### 3. URL ไม่ถูกต้อง
- Android Emulator: ใช้ `10.0.2.2` แทน `localhost`
- Physical Device: ใช้ IP address ของเครื่อง
- เครื่องและ device ต้องอยู่ใน Network เดียวกัน

#### 4. Firewall/Antivirus
- เช็คว่า Firewall ไม่ block port 5000
- Windows Defender Firewall อาจต้องอนุญาต Node.js

#### 5. CORS Error
- Backend มี `app.use(cors())` อยู่แล้ว ไม่ควรมีปัญหา
- ถ้ามีปัญหาให้ตรวจสอบ `backend/server.js`

---

## 6. ทดสอบขั้นสูง

### ทดสอบด้วย curl:
```bash
# ทดสอบ Login API โดยตรง
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

ควรได้ response:
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com",
      ...
    }
  }
}
```

---

## 7. Platform-Specific URL Configuration

### Android Emulator
```javascript
// frontend/config/api.js
// URL จะเป็น: http://10.0.2.2:5000/api อัตโนมัติ
```

### Android Physical Device
```javascript
// frontend/config/api.js
const CUSTOM_IP = 'http://192.168.1.100:5000/api'; // ใส่ IP ของคุณ
```

### iOS Simulator
```javascript
// frontend/config/api.js
// URL จะเป็น: http://localhost:5000/api อัตโนมัติ
```

### Web Browser
```javascript
// frontend/config/api.js
// URL จะเป็น: http://localhost:5000/api อัตโนมัติ
```

---

## 8. เช็คลิสต์การทดสอบ

- [ ] MongoDB รันอยู่ที่ port 27017
- [ ] Backend server รันอยู่ที่ port 5000
- [ ] เข้าถึง http://localhost:5000 ได้ (ใน browser)
- [ ] มีบัญชีผู้ใช้ทดสอบในฐานข้อมูล
- [ ] ตั้งค่า API URL ใน config/api.js ให้ตรงกับ platform
- [ ] Frontend รันได้ปกติ
- [ ] Console log แสดง "API Base URL: ..."
- [ ] กรอก email และ password แล้วกด Login
- [ ] ตรวจสอบ error ใน console (ถ้ามี)

---

## 9. ติดต่อ/รายงานปัญหา

หากพบปัญหาให้ดู:
1. Console log ใน Metro bundler
2. Terminal ที่รัน backend server
3. MongoDB logs

ข้อมูลที่ควรรวบรวม:
- Platform (Android/iOS/Web)
- Error message
- API Base URL ที่ใช้
- Backend server status
- MongoDB status
