import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasImageUrl = typeof product.image === 'string' && /^https?:/i.test(product.image);

  return (
    <div className="product-card">
      <div className="product-image">
        {hasImageUrl ? <img src={product.image} alt={product.name} /> : <div>{product.image || '📱'}</div>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <p className="product-specs">{product.specs}</p>
        <div className="product-rating">
          <span className="stars">⭐ {product.rating || 4.5}</span>
          <span className="reviews">({product.reviews || 0} đánh giá)</span>
        </div>
      </div>
      <div className="product-footer">
        <div className="price-section">
          <p className="price">{product.price.toLocaleString('vi-VN')} ₫</p>
          {product.originalPrice && (
            <p className="original-price">{product.originalPrice.toLocaleString('vi-VN')} ₫</p>
          )}
        </div>
        <div className="action-buttons">
          <Link to={`/product/${product.id}`} className="btn btn-secondary">
            Chi tiết
          </Link>
          <button className="btn btn-primary" onClick={() => addToCart(product)}>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
