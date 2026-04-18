import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>PhoneHub</h3>
          <p>Cửa hàng bán điện thoại di động uy tín & chất lượng</p>
        </div>
        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="#">Sản phẩm</a></li>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Chính sách</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>Email: info@phonehub.com</p>
          <p>Điện thoại: 1900-XXXX-XXXX</p>
          <p>Địa chỉ: 123 Đường ABC, TP. HCM</p>
        </div>
        <div className="footer-section">
          <h4>Theo dõi</h4>
          <div className="social-links">
            <a href="#" className="social-icon">Facebook</a>
            <a href="#" className="social-icon">Instagram</a>
            <a href="#" className="social-icon">Twitter</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 PhoneHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
