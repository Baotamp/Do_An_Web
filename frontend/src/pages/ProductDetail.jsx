import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { fallbackProducts } from '../data/fallbackProducts';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const numericId = Number(id);

  const [product, setProduct] = useState(() => fallbackProducts.find((item) => item.id === numericId) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: currentUser?.name || '',
    rating: 5,
    comment: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/products/${numericId}`);
        if (!response.ok) {
          throw new Error('Không thể tải chi tiết sản phẩm');
        }

        const data = await response.json();
        if (!ignore) {
          setProduct(data);
        }
      } catch (err) {
        if (!ignore) {
          const fallback = fallbackProducts.find((item) => item.id === numericId) || null;
          setProduct(fallback);
          if (fallback) {
            setError('Không tải được dữ liệu live, đang hiển thị dữ liệu mẫu.');
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const loadReviews = async () => {
      setReviewLoading(true);

      try {
        const response = await fetch(`${API_BASE}/api/products/${numericId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          if (!ignore) {
            setReviews(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        if (!ignore) {
          setReviewLoading(false);
        }
      }
    };

    loadProduct();
    loadReviews();

    return () => {
      ignore = true;
    };
  }, [numericId]);

  useEffect(() => {
    if (currentUser?.name && !newReview.userName) {
      setNewReview((prev) => ({ ...prev, userName: currentUser.name }));
    }
  }, [currentUser?.name, newReview.userName]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!newReview.userName.trim() || !newReview.comment.trim()) {
      setSubmitError('Vui lòng nhập tên và nội dung bình luận');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/products/${numericId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể gửi đánh giá');
      }

      setReviews((prev) => [data, ...prev]);
      setNewReview({
        userName: currentUser?.name || '',
        rating: 5,
        comment: '',
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="container not-found">
        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container not-found">
        <h2>Sản phẩm không tìm thấy</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const hasImageUrl = typeof product.image === 'string' && /^https?:/i.test(product.image);

  return (
    <div className="product-detail-page">
      <div className="container product-detail">
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        <div className="product-detail-content">
          <div className="product-image-large">
            {hasImageUrl ? <img src={product.image} alt={product.name} /> : <div className="image-placeholder">{product.image || '📱'}</div>}
          </div>

          <div className="product-details-info">
            {error && <p>{error}</p>}
            <h1 className="product-title">{product.name}</h1>
            <p className="product-brand-tag">{product.brand}</p>

            <div className="rating-section">
              <div className="stars">⭐ {product.rating}</div>
              <span className="review-count">({product.reviews} đánh giá)</span>
            </div>

            <div className="price-section">
              <p className="price-main">{product.price.toLocaleString('vi-VN')} ₫</p>
              {product.originalPrice && (
                <>
                  <p className="price-original">{product.originalPrice.toLocaleString('vi-VN')} ₫</p>
                  <p className="discount">
                    Tiết kiệm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </p>
                </>
              )}
            </div>

            <div className="specs-section">
              <h3>Thông số kỹ thuật</h3>
              <p>{product.details}</p>
            </div>

            <div className="action-section">
              <div className="quantity-selector">
                <label>Số lượng:</label>
                <input type="number" min="1" defaultValue="1" />
              </div>
              <button 
                className="btn btn-primary btn-large"
                onClick={() => addToCart(product)}
              >
                🛒 Thêm vào giỏ hàng
              </button>
              <button className="btn btn-secondary btn-large">
                ❤️ Thêm vào yêu thích
              </button>
            </div>

            <div className="benefits-section">
              <div className="benefit-item">
                <span>🚚</span>
                <p><strong>Giao hàng miễn phí</strong> trên toàn thành phố</p>
              </div>
              <div className="benefit-item">
                <span>🛡️</span>
                <p><strong>Bảo hành 12 tháng</strong> từ hãng sản xuất</p>
              </div>
              <div className="benefit-item">
                <span>💬</span>
                <p><strong>Hỗ trợ 24/7</strong> qua chat, email, điện thoại</p>
              </div>
            </div>
          </div>
        </div>

        <div className="product-description-section">
          <h2>Mô tả chi tiết</h2>
          <div className="description-content">
            {product.fullDescription || product.details || product.description}
          </div>
        </div>

        <div className="reviews-section">
          <h2>Đánh giá và bình luận ({reviews.length})</h2>

          <div className="review-form-container">
            <h3>Gửi đánh giá của bạn</h3>
            {submitError && <p className="error-text">{submitError}</p>}
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="input-group">
                <label>Tên của bạn</label>
                <input
                  type="text"
                  name="userName"
                  value={newReview.userName}
                  onChange={handleReviewChange}
                  placeholder="Nhập tên..."
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="input-group">
                <label>Đánh giá sao</label>
                <select
                  name="rating"
                  value={newReview.rating}
                  onChange={handleReviewChange}
                  disabled={isSubmitting}
                >
                  <option value="5">5 sao - Tuyệt lắm</option>
                  <option value="4">4 sao - Tốt</option>
                  <option value="3">3 sao - Bình thường</option>
                  <option value="2">2 sao - Không tốt</option>
                  <option value="1">1 sao - Rất tệ</option>
                </select>
              </div>

              <div className="input-group">
                <label>Bình luận</label>
                <textarea
                  name="comment"
                  value={newReview.comment}
                  onChange={handleReviewChange}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  rows="4"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>

          <div className="reviews-list">
            {reviewLoading && <p>Loading reviews...</p>}
            {!reviewLoading && reviews.length === 0 && <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>}
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-user-info">
                    <span className="review-user-name">{review.userName}</span>
                    <span className="review-rating">{'⭐'.repeat(review.rating)} ({review.rating}/5)</span>
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
