import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { useAdmin } from '../context/AdminContext';
import { API_BASE } from '../config/api';
import { fallbackProducts } from '../data/fallbackProducts';
import './ShopProducts.css';

const Products = () => {
  const { isAdmin } = useAdmin();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      const fetchProducts = async () => {
        setLoading(true);
        setError('');

        try {
          const query = searchTerm.trim()
            ? `?search=${encodeURIComponent(searchTerm.trim())}`
            : '';
          const response = await fetch(`${API_BASE}/api/products${query}`, {
            signal: controller.signal,
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Không thể tải danh sách sản phẩm');
          }

          setProducts(Array.isArray(data) && data.length > 0 ? data : []);
        } catch (err) {
          if (err.name !== 'AbortError') {
            setProducts(fallbackProducts);
            setError('Không tải được dữ liệu live, đang hiển thị dữ liệu mẫu.');
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      };

      fetchProducts();
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <main className="shop-products-page">
      <div className="container">
        <section className="shop-products-hero">
          <h1>Danh sách sản phẩm</h1>
          <p>
            Khám phá các mẫu điện thoại nổi bật của PhoneHub. Bạn có thể lọc theo hãng và sắp xếp theo giá hoặc đánh giá.
          </p>

          <div className="input-group" style={{ maxWidth: 520, marginTop: 24 }}>
            <label>Tìm kiếm sản phẩm</label>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên máy, hãng hoặc mô tả..."
            />
          </div>

          {isAdmin && (
            <div className="shop-admin-shortcut">
              <Link className="btn btn-secondary" to="/admin">
                Vào menu admin
              </Link>
              <Link className="btn btn-primary" to="/admin/products">
                Quản lý sản phẩm
              </Link>
            </div>
          )}
        </section>

        {loading && <p>Đang tải danh sách sản phẩm...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && products.length === 0 && <p>Không tìm thấy sản phẩm phù hợp.</p>}

        <ProductList products={products} />
      </div>
    </main>
  );
};

export default Products;
