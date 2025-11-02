# Chat API Documentation

## ภาพรวมระบบ

ระบบแชทสำหรับซื้อขายสินค้า/บริการ ที่มีคุณสมบัติ:
- เก็บประวัติการแชท
- กำหนดบทบาท (Role) ผู้ซื้อ (Buyer) และผู้ขาย (Seller)
- อัพโหลดสลิปการโอนเงิน
- บันทึกข้อมูลธุรกรรมการซื้อขาย

## Models

### 1. ChatRoom
```javascript
{
  buyer: ObjectId,          // ผู้ซื้อ
  seller: ObjectId,         // ผู้ขาย
  status: String,           // 'active', 'completed', 'cancelled', 'dispute'
  productInfo: {            // ข้อมูลสินค้า (ถ้ามี)
    name: String,
    description: String,
    price: Number,
    quantity: Number
  },
  lastMessage: {            // ข้อความล่าสุด
    message: String,
    sender: ObjectId,
    timestamp: Date
  },
  unreadCount: {            // จำนวนข้อความที่ยังไม่ได้อ่าน
    buyer: Number,
    seller: Number
  }
}
```

### 2. ChatMessage
```javascript
{
  chatRoom: ObjectId,       // ห้องแชท
  sender: ObjectId,         // ผู้ส่ง
  senderRole: String,       // 'buyer' หรือ 'seller'
  messageType: String,      // 'text', 'image', 'slip', 'system'
  message: String,          // เนื้อหาข้อความ
  attachments: [{           // ไฟล์แนบ
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  isRead: Boolean,          // สถานะการอ่าน
  readAt: Date,
  transactionInfo: {        // ข้อมูลธุรกรรม (ถ้ามี)
    amount: Number,
    status: String
  }
}
```

### 3. Transaction
```javascript
{
  chatRoom: ObjectId,       // ห้องแชทที่เกี่ยวข้อง
  buyer: ObjectId,          // ผู้ซื้อ
  seller: ObjectId,         // ผู้ขาย
  productInfo: {            // ข้อมูลสินค้า
    name: String,
    description: String,
    quantity: Number
  },
  amount: Number,           // ยอดเงิน
  paymentSlip: {            // สลิปการโอน
    url: String,
    fileName: String,
    uploadedAt: Date
  },
  status: String,           // 'pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'refunded'
  notes: String,
  statusHistory: [{         // ประวัติการเปลี่ยนสถานะ
    status: String,
    updatedBy: ObjectId,
    updatedAt: Date,
    reason: String
  }],
  metadata: {               // ข้อมูลเพิ่มเติม
    paymentMethod: String,  // 'bank_transfer', 'promptpay', 'credit_card', 'cash', 'other'
    bankName: String,
    accountNumber: String,
    transferDate: Date,
    referenceNumber: String
  }
}
```

---

## API Endpoints

### 1. สร้างห้องแชทใหม่
```
POST /api/chat/rooms
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "otherUserId": "user_id",
  "role": "buyer",  // 'buyer' หรือ 'seller'
  "productInfo": {  // ไม่บังคับ
    "name": "สินค้าตัวอย่าง",
    "description": "รายละเอียด",
    "price": 1000,
    "quantity": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "สร้างห้องแชทสำเร็จ",
  "data": {
    "chatRoom": { ... }
  }
}
```

---

### 2. ดึงรายการห้องแชททั้งหมด
```
GET /api/chat/rooms
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatRooms": [
      {
        "_id": "...",
        "buyer": { ... },
        "seller": { ... },
        "status": "active",
        "lastMessage": { ... },
        "unreadCount": { ... }
      }
    ]
  }
}
```

---

### 3. ดึงข้อมูลห้องแชทเฉพาะ
```
GET /api/chat/rooms/:roomId
```

**Headers:**
```
Authorization: Bearer {token}
```

---

### 4. ส่งข้อความในห้องแชท
```
POST /api/chat/rooms/:roomId/messages
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "ข้อความที่ต้องการส่ง",
  "messageType": "text"  // ไม่บังคับ
}
```

**Response:**
```json
{
  "success": true,
  "message": "ส่งข้อความสำเร็จ",
  "data": {
    "chatMessage": { ... }
  }
}
```

---

### 5. ส่งรูปภาพในห้องแชท
```
POST /api/chat/rooms/:roomId/messages/upload
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `chatImage`: File (รูปภาพ)
- `message`: String (ไม่บังคับ)

**Response:**
```json
{
  "success": true,
  "message": "ส่งรูปภาพสำเร็จ",
  "data": {
    "chatMessage": { ... }
  }
}
```

---

### 6. ดึงข้อความทั้งหมดในห้องแชท
```
GET /api/chat/rooms/:roomId/messages?page=1&limit=50
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: หน้าที่ต้องการ (default: 1)
- `limit`: จำนวนข้อความต่อหน้า (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "totalPages": 5,
    "currentPage": 1,
    "totalMessages": 234
  }
}
```

---

### 7. อ่านข้อความทั้งหมดในห้องแชท
```
PUT /api/chat/rooms/:roomId/read
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "อ่านข้อความทั้งหมดแล้ว"
}
```

---

### 8. สร้างธุรกรรมและอัพโหลดสลิป
```
POST /api/chat/transactions
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `chatRoomId`: String (required)
- `productName`: String (required)
- `productDescription`: String
- `quantity`: Number
- `amount`: Number (required)
- `slip`: File (required - รูปสลิป)
- `notes`: String
- `paymentMethod`: String ('bank_transfer', 'promptpay', etc.)
- `bankName`: String
- `accountNumber`: String
- `transferDate`: Date
- `referenceNumber`: String

**Response:**
```json
{
  "success": true,
  "message": "สร้างธุรกรรมสำเร็จ",
  "data": {
    "transaction": { ... },
    "chatMessage": { ... }
  }
}
```

---

### 9. ดึงข้อมูลธุรกรรม
```
GET /api/chat/transactions/:transactionId
```

**Headers:**
```
Authorization: Bearer {token}
```

---

### 10. อัพเดทสถานะธุรกรรม
```
PUT /api/chat/transactions/:transactionId/status
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed",  // 'pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'refunded'
  "reason": "เหตุผลในการเปลี่ยนสถานะ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "อัพเดทสถานะธุรกรรมสำเร็จ",
  "data": {
    "transaction": { ... }
  }
}
```

---

### 11. ดึงธุรกรรมทั้งหมดในห้องแชท
```
GET /api/chat/rooms/:roomId/transactions
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [ ... ]
  }
}
```

---

## การใช้งาน

### ตัวอย่างการสร้างห้องแชทและส่งข้อความ

```javascript
// 1. สร้างห้องแชท (ฉันเป็นผู้ซื้อ)
const createRoomResponse = await fetch('http://localhost:5000/api/chat/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    otherUserId: 'seller_user_id',
    role: 'buyer',
    productInfo: {
      name: 'iPhone 15 Pro',
      description: 'สภาพดี ใหม่มือ 1',
      price: 45000,
      quantity: 1
    }
  })
});

const { data } = await createRoomResponse.json();
const roomId = data.chatRoom._id;

// 2. ส่งข้อความ
await fetch(`http://localhost:5000/api/chat/rooms/${roomId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'สวัสดีครับ สนใจสินค้าครับ'
  })
});

// 3. อัพโหลดสลิปการโอนเงิน
const formData = new FormData();
formData.append('chatRoomId', roomId);
formData.append('productName', 'iPhone 15 Pro');
formData.append('amount', 45000);
formData.append('slip', fileInput.files[0]);
formData.append('paymentMethod', 'bank_transfer');

await fetch('http://localhost:5000/api/chat/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## Error Handling

ทุก API endpoint จะ return error ในรูปแบบ:

```json
{
  "success": false,
  "message": "รายละเอียด error"
}
```

HTTP Status Codes:
- `200`: สำเร็จ
- `201`: สร้างสำเร็จ
- `400`: ข้อมูลไม่ถูกต้อง
- `401`: ไม่ได้ระบุ token หรือ token ไม่ถูกต้อง
- `403`: ไม่มีสิทธิ์เข้าถึง
- `404`: ไม่พบข้อมูล
- `500`: Server error

---

## ข้อควรระวัง

1. ทุก API ต้องมี Authorization header พร้อม JWT token
2. ไฟล์รูปภาพรองรับเฉพาะ: jpeg, jpg, png, gif, webp
3. ขนาดไฟล์สูงสุด: 5MB
4. ไฟล์อัพโหลดจะถูกเก็บใน `/uploads/chat/` และ `/uploads/slips/`
5. สามารถเข้าถึงไฟล์ได้ที่ `http://localhost:5000/uploads/...`

---

## การทดสอบ

### ใช้ Postman หรือ cURL

```bash
# ตัวอย่าง: สร้างห้องแชท
curl -X POST http://localhost:5000/api/chat/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otherUserId": "user_id_here",
    "role": "buyer"
  }'

# ตัวอย่าง: ส่งข้อความ
curl -X POST http://localhost:5000/api/chat/rooms/ROOM_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "สวัสดีครับ"
  }'

# ตัวอย่าง: อัพโหลดสลิป
curl -X POST http://localhost:5000/api/chat/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "chatRoomId=ROOM_ID" \
  -F "productName=iPhone 15" \
  -F "amount=45000" \
  -F "slip=@/path/to/slip.jpg"
```
