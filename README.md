# PhoneHub - Nhóm 5

## Cách chạy local cho cả nhóm

### 1. Clone repository
```bash
git clone https://github.com/thaithuan123/Nhom5Office.git
cd Nhom5Office
```

### 2. Chạy Backend

#### Vào thư mục backend:
```bash
cd backend
```

#### Cài dependencies:
```bash
npm install
```

#### Tạo file .env:
Tạo file `.env` với nội dung:
```
DB_USE_SQLITE=true
SQLITE_STORAGE=database.sqlite
PORT=4000
```

#### Copy database:
```bash
cp ../database.sqlite database.sqlite
```

#### Chạy backend:
```bash
npm run dev
```
Backend sẽ chạy tại: http://localhost:4000

### 3. Chạy Frontend

#### Mở terminal mới, vào thư mục frontend:
```bash
cd ../frontend
```

#### Cài dependencies:
```bash
npm install
```

#### Chạy frontend:
```bash
npm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

### 4. Truy cập ứng dụng

Mở trình duyệt và vào: **http://localhost:5173**

### Lưu ý quan trọng:

- **Backend phải chạy trước** (http://localhost:4000)
- **Frontend sẽ tự động kết nối** với backend local
- Nếu gặp lỗi database, đảm bảo file `database.sqlite` đã được copy vào `backend/`
- Để dừng server, nhấn `Ctrl+C` trong terminal tương ứng

### Phân công công việc:

- **Frontend**: `frontend/` - Giao diện người dùng
- **Backend**: `backend/` - API và database
- **Database**: SQLite file `database.sqlite`

### Các file quan trọng:

- `frontend/src/App.jsx` - Routing chính
- `backend/index.js` - Server Express
- `backend/.env` - Cấu hình database
- `frontend/src/config/api.js` - Kết nối API

Nếu gặp vấn đề, hãy kiểm tra README.md trong từng thư mục!