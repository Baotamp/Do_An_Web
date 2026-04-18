import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1 className="error-code">404</h1>
          <h2>Không tìm thấy trang</h2>
          <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
