# PhoneHub - Frontend Website

Giao diện website bán điện thoại di động đẹp mắt và đầy đủ chức năng!

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Các component tái sử dụng
│   ├── Header.jsx      # Thanh điều hướng trên cùng
│   ├── Footer.jsx      # Chân trang
│   ├── ProductCard.jsx # Thẻ sản phẩm
│   └── ProductList.jsx # Danh sách sản phẩm
│
├── pages/              # Các trang chính
│   ├── Home.jsx        # Trang chủ
│   ├── ProductDetail.jsx # Chi tiết sản phẩm
│   ├── Cart.jsx        # Giỏ hàng
│   └── NotFound.jsx    # Trang 404
│
├── context/            # Global state management
│   └── CartContext.jsx # Quản lý giỏ hàng
│
├── App.jsx            # Component chính với routing
└── index.css          # Styles toàn cục
```

## 🚀 Cài đặt & Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Truy cập vào: `http://localhost:5173`

### 3. Build cho production
```bash
npm run build
```

## 🎨 Tính năng chính

### ✅ Trang chủ
- Banner hero đẹp mắt
- 4 ưu điểm nổi bật (giao hàng nhanh, giá tốt, bảo hành, hỗ trợ)
- Danh sách sản phẩm nổi bật

### 🛍️ Danh sách sản phẩm
- Lưới hiển thị sản phẩm responsive
- Bộ lọc theo hãng (Apple, Samsung, Xiaomi, OPPO)
- Sắp xếp theo: Mới nhất, Giá thấp→cao, Giá cao→thấp, Đánh giá cao
- Hiển thị: Tên, Hãng, Specs, Đánh giá, Giá, Discount

### 🔍 Chi tiết sản phẩm
- Hình ảnh lớn
- Thông tin chi tiết
- Giá + giá gốc (nếu có) + % giảm
- Mô tả đầy đủ về sản phẩm
- Nút thêm vào giỏ hàng
- Hiển thị benefits (giao hàng miễn phí, bảo hành, hỗ trợ)

### 🛒 Giỏ hàng
- Hiển thị toàn bộ sản phẩm đã thêm
- Thay đổi số lượng (tăng/giảm)
- Tính tổng tiền tự động
- Xóa sản phẩm khỏi giỏ
- Tóm tắt đơn hàng (tổng tiền, phí giao, giảm giá, tổng cộng)
- Nút đặt hàng & tiếp tục mua sắm
- Hỗ trợ responsive (table trên desktop, cards trên mobile)

## 📱 Responsive Design

- **Desktop**: 1200px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

Tất cả các trang đều responsive hoàn toàn!

## 🎯 Routes

| Path | Trang |
|------|-------|
| `/` | Trang chủ |
| `/product/:id` | Chi tiết sản phẩm |
| `/cart` | Giỏ hàng |
| `/*` | Trang 404 |

## 🧠 State Management

### CartContext
Quản lý trạng thái giỏ hàng toàn cục:
```javascript
- cartItems: Mảng sản phẩm trong giỏ
- addToCart(product): Thêm sản phẩm
- removeFromCart(id): Xóa sản phẩm
- updateQuantity(id, qty): Cập nhật số lượng
- clearCart(): Xóa hết giỏ hàng
- getTotalPrice(): Tính tổng tiền
- getTotalItems(): Đếm tổng số item
```

## 🎨 Màu sắc & CSS Variables

```css
--primary-color: #3b82f6 (Xanh chính)
--secondary-color: #10b981 (Xanh lá cây)
--danger-color: #ef4444 (Đỏ)
--warning-color: #f59e0b (Vàng)
--dark-bg: #1f2937 (Nền tối)
--light-bg: #f3f4f6 (Nền sáng)
--text-dark: #111827 (Chữ tối)
--text-light: #6b7280 (Chữ nhạt)
--border-color: #e5e7eb (Viền)
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.23.0",
    "axios": "^1.6.2"
  }
}
```

## 🔗 Tích hợp Backend

Hiện tại dữ liệu sản phẩm đã hardcode. Để tích hợp với API backend:

1. **Tạo service file** (`src/services/api.js`):
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const getProducts = () => API.get('/products');
export const getProduct = (id) => API.get(`/products/${id}`);
// ... more endpoints
```

2. **Import và sử dụng trong components**:
```javascript
import { getProducts } from '../services/api';

useEffect(() => {
  getProducts().then(res => setProducts(res.data));
}, []);
```

## 📝 Ghi chú

- Tất cả component đều sử dụng CSS module hoặc CSS thông thường
- Fully accessible (a11y friendly)
- Optimized cho performance
- Smooth animations & transitions
- Dark/Light mode ready (CSS variables đã sẵn sàng)

## 🚧 Cải tiến trong tương lai

- [ ] User authentication
- [ ] Wishlist functionality
- [ ] Product reviews & ratings
- [ ] Search functionality
- [ ] Advanced filtering
- [ ] Payment integration
- [ ] Order history
- [ ] Admin panel
- [ ] Dark mode toggle

---

**Tạo bởi**: GitHub Copilot
**Ngày**: 2024
