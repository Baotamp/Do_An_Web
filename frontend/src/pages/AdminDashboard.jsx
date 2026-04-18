import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const { isAdmin, adminUser, logoutAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="admin-page">
      <div className="container admin-dashboard">
        <div className="admin-header-block">
          <div>
            <span className="eyebrow">Menu admin</span>
            <h1>Xin chào, {adminUser.name}</h1>
            <p>Chọn một chức năng quản trị để cập nhật dữ liệu của hệ thống.</p>
          </div>
          <button className="btn btn-secondary" type="button" onClick={logoutAdmin}>
            Đăng xuất
          </button>
        </div>

        <div className="admin-card-grid">
          <Link to="/admin/products" className="admin-card-link">
            <h2>Quản lý sản phẩm</h2>
            <p>Thêm, sửa, xóa sản phẩm và kiểm soát tồn kho trong cửa hàng.</p>
          </Link>
          <Link to="/admin/users" className="admin-card-link">
            <h2>Quản lý người dùng</h2>
            <p>Xem danh sách nhân sự, chỉnh sửa vai trò và cập nhật thông tin người dùng.</p>
          </Link>
          <Link to="/admin/orders" className="admin-card-link">
            <h2>Đơn hàng đã bán</h2>
            <p>Xem các đơn đặt hàng thành công, phương thức thanh toán và thống kê sản phẩm đã bán.</p>
          </Link>
          <Link to="/products" className="admin-card-link">
            <h2>Xem trang sản phẩm</h2>
            <p>Kiểm tra giao diện khách hàng đang hiển thị sản phẩm ngoài trang công khai.</p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
