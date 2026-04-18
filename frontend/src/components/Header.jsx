import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin' || String(role || '').trim() === 'Quản trị';

const Header = () => {
  const { getTotalItems } = useCart();
  const { isAdmin, logoutAdmin } = useAdmin();
  const { isAuthenticated, currentUser, logoutUser } = useAuth();
  const showAdminAccess = isAdmin && isAdminRole(currentUser?.role);

  return (
    <header className="header">
      <div className="container header-content">
        <Link to={isAuthenticated ? (showAdminAccess ? '/admin' : '/') : '/auth'} className="logo">
          <h1>📱 PhoneHub</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Trang chủ</Link>
          <Link to="/products" className="nav-link">Sản phẩm</Link>
          {showAdminAccess && <Link to="/admin" className="nav-link nav-link-admin">Menu admin</Link>}
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <span className="user-chip">👋 {currentUser.name}</span>
          ) : (
            <Link to="/auth" className="user-button">Đăng nhập</Link>
          )}

          {showAdminAccess && <Link to="/admin" className="admin-button">Quản trị</Link>}

          {isAuthenticated && (
            <button type="button" className="logout-button" onClick={logoutUser}>
              Đăng xuất
            </button>
          )}

          <Link to="/cart" className="cart-link">
            🛒 Giỏ hàng
            {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
