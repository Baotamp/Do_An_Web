import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { API_BASE } from '../config/api';
import { fallbackProducts } from '../data/fallbackProducts';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách sản phẩm');
        }

        const data = await response.json();
        if (!ignore) {
          setProducts(Array.isArray(data) && data.length > 0 ? data : fallbackProducts);
        }
      } catch (err) {
        if (!ignore) {
          setProducts(fallbackProducts);
          setError('Không tải được dữ liệu live, đang hiển thị dữ liệu mẫu.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-banner">
          <span className="hero-badge">Ưu đãi đặc biệt</span>
          <h1>PhoneHub - Chọn điện thoại đẹp, nhận quà ngay</h1>
          <p>
            Ghé thăm cửa hàng, xem hàng loạt mẫu mới và thêm vào giỏ khi bạn sẵn sàng.
          </p>
          <Link className="btn btn-primary" to="/products">Xem sản phẩm</Link>
          <div className="hero-wave" />
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="feature-item">
            <span className="feature-icon">🚚</span>
            <h3>Giao hàng nhanh</h3>
            <p>Giao hàng trong 24h tại TP.HCM</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <h3>Giá tốt nhất</h3>
            <p>Giảm giá tối đa cho tất cả sản phẩm</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <h3>Bảo hành chính hãng</h3>
            <p>Bảo hành 12-24 tháng từ hãng</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <h3>Hỗ trợ 24/7</h3>
            <p>Chăm sóc khách hàng tuyệt vời</p>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <h2>Sản phẩm nổi bật</h2>
          {loading && <p>Đang tải sản phẩm...</p>}
          {!loading && error && <p>{error}</p>}
          <ProductList products={products} />
        </div>
      </section>
    </main>
  );
};

export default Home;
