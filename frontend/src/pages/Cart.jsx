import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import './Cart.css';

const QR_EXPIRE_SECONDS = 60;

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [checkoutError, setCheckoutError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(QR_EXPIRE_SECONDS);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: '',
    customerAddress: '',
  });

  useEffect(() => {
    setCheckoutForm((prev) => ({
      ...prev,
      customerName: prev.customerName || currentUser?.name || '',
      customerEmail: prev.customerEmail || currentUser?.email || '',
    }));
  }, [currentUser]);

  useEffect(() => {
    if (paymentMethod !== 'qr') {
      setQrCodeUrl('');
      setQrExpiresAt(null);
      setQrTimeLeft(QR_EXPIRE_SECONDS);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (paymentMethod !== 'qr' || !qrExpiresAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((qrExpiresAt - Date.now()) / 1000));
      setQrTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paymentMethod, qrExpiresAt]);

  const qrExpired = paymentMethod === 'qr' && Boolean(qrExpiresAt) && qrTimeLeft <= 0;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitOrder = async (method) => {
    setSubmittingOrder(true);
    setCheckoutError('');

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutForm,
          items: cartItems,
          paymentMethod: method,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo đơn hàng');
      }

      alert(
        method === 'qr'
          ? `Thanh toán QR thành công! Đơn hàng #${data.id} đã được ghi nhận.`
          : `Đặt hàng tiền mặt thành công! Đơn hàng #${data.id} đang chờ xử lý.`
      );

      clearCart();
      setQrCodeUrl('');
      setQrExpiresAt(null);
      setQrTimeLeft(QR_EXPIRE_SECONDS);
      navigate('/');
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const generateQrCode = () => {
    if (!checkoutForm.customerName.trim()) {
      setCheckoutError('Vui lòng nhập tên người nhận trước khi tạo mã QR.');
      return;
    }

    const expiresAt = Date.now() + QR_EXPIRE_SECONDS * 1000;
    const qrPayload = `PhoneHub|${checkoutForm.customerName}|${checkoutForm.customerEmail || 'guest'}|${getTotalPrice()}|expires:${new Date(expiresAt).toISOString()}`;

    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`);
    setQrExpiresAt(expiresAt);
    setQrTimeLeft(QR_EXPIRE_SECONDS);
    setCheckoutError('');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || submittingOrder) {
      return;
    }

    if (!checkoutForm.customerName.trim()) {
      setCheckoutError('Vui lòng nhập tên người nhận để đặt hàng.');
      return;
    }

    if (paymentMethod === 'cash') {
      await submitOrder('cash');
      return;
    }

    if (!qrCodeUrl || qrExpired) {
      generateQrCode();
    }
  };

  const handleConfirmQrPayment = async () => {
    if (qrExpired) {
      setCheckoutError('Mã QR đã hết hạn sau 1 phút. Vui lòng tạo mã mới.');
      return;
    }

    await submitOrder('qr');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <h1>Giỏ hàng của bạn</h1>
        <div className="empty-state">
          <p className="empty-icon">🛒</p>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Giỏ hàng của bạn</h1>

        <div className="cart-content">
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tổng cộng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="cart-item-row">
                    <td className="product-col">
                      <div className="product-info">
                        <span className="product-icon">📱</span>
                        <div>
                          <p className="product-name">{item.name}</p>
                          <p className="product-brand">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="price-col">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="quantity-col">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                        />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td className="total-col">
                      <strong>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</strong>
                    </td>
                    <td className="action-col">
                      <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Xóa khỏi giỏ hàng"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <div className="summary-box">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="summary-item">
                <span>Tổng tiền hàng:</span>
                <span>{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="summary-item">
                <span>Phí vận chuyển:</span>
                <span className="free-ship">Miễn phí</span>
              </div>

              <div className="summary-item discount">
                <span>Giảm giá:</span>
                <span>0 ₫</span>
              </div>

              <div className="divider"></div>

              <div className="summary-item total">
                <span>Tổng cộng:</span>
                <span>{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="checkout-form-block">
                <h3>Thông tin nhận hàng</h3>
                <div className="checkout-form-grid">
                  <input name="customerName" value={checkoutForm.customerName} onChange={handleFormChange} placeholder="Họ tên người nhận" required />
                  <input name="customerEmail" type="email" value={checkoutForm.customerEmail} onChange={handleFormChange} placeholder="Email" />
                  <input name="customerPhone" value={checkoutForm.customerPhone} onChange={handleFormChange} placeholder="Số điện thoại" />
                  <input name="customerAddress" value={checkoutForm.customerAddress} onChange={handleFormChange} placeholder="Địa chỉ giao hàng" />
                </div>
              </div>

              <div className="payment-methods">
                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  💵 Tiền mặt
                </button>
                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('qr')}
                >
                  📱 Mã QR
                </button>
              </div>

              {paymentMethod === 'qr' && (
                <div className="qr-payment-box">
                  <h3>Thanh toán QR</h3>
                  <p className="summary-note">Mã QR được tạo bằng API và chỉ có hiệu lực trong 1 phút.</p>

                  {qrCodeUrl ? (
                    <>
                      <img src={qrCodeUrl} alt="QR thanh toán" className="qr-image" />
                      <p className={`qr-timer ${qrExpired ? 'expired' : ''}`}>
                        {qrExpired ? 'Mã QR đã hết hạn' : `Thời gian còn lại: ${qrTimeLeft}s`}
                      </p>
                      <div className="payment-actions">
                        <button className="btn btn-primary btn-block" type="button" onClick={handleConfirmQrPayment} disabled={submittingOrder || qrExpired}>
                          {submittingOrder ? 'Đang xác nhận...' : 'Tôi đã thanh toán QR'}
                        </button>
                        <button className="btn btn-secondary btn-block" type="button" onClick={generateQrCode}>
                          Tạo lại mã QR
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="summary-note">Bấm nút bên dưới để tạo mã QR thanh toán.</p>
                  )}
                </div>
              )}

              {checkoutError && <p className="error-text">{checkoutError}</p>}

              <button className="btn btn-primary btn-block" onClick={handleCheckout} disabled={submittingOrder}>
                {submittingOrder
                  ? 'Đang xử lý...'
                  : paymentMethod === 'cash'
                    ? 'Đặt hàng tiền mặt'
                    : qrCodeUrl && !qrExpired
                      ? 'Tạo lại mã QR thanh toán'
                      : 'Tạo mã QR thanh toán'}
              </button>

              <button
                className="btn btn-secondary btn-block"
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
