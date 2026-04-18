# PhoneHub Backend

## Cách chạy local

### 1. Clone repository
```bash
git clone https://github.com/thaithuan123/Nhom5Office.git
cd Nhom5Office
```

### 2. Vào thư mục backend
```bash
cd backend
```

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Tạo file .env
Tạo file `.env` trong thư mục `backend/` với nội dung:
```
DB_USE_SQLITE=true
SQLITE_STORAGE=database.sqlite
PORT=4000
```

### 5. Copy database
Copy file `database.sqlite` từ thư mục root vào `backend/`:
```bash
cp ../database.sqlite database.sqlite
```

### 6. Chạy backend
```bash
npm run dev
```

Backend sẽ chạy tại: http://localhost:4000

## API Endpoints

- GET /api/products - Lấy danh sách sản phẩm
- POST /api/orders - Tạo đơn hàng
- Và các endpoint khác...

## Database

Sử dụng SQLite với file `database.sqlite`.
Tables sẽ tự động tạo khi chạy server lần đầu.