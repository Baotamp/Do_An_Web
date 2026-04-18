import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './AdminOrders.css';

const paymentMethodLabel = {
  cash: 'Tiền mặt',
  qr: 'QR',
};

const paymentStatusLabel = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
};

const orderStatusLabel = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải danh sách đơn hàng');
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const soldProducts = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.id || item.name;
        const current = map.get(key) || {
          id: item.id,
          name: item.name,
          brand: item.brand,
          quantitySold: 0,
          revenue: 0,
        };

        current.quantitySold += Number(item.quantity || 0);
        current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
        map.set(key, current);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.quantitySold - a.quantitySold);
  }, [orders]);

  const summary = useMemo(() => ({
    orderCount: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    soldUnits: soldProducts.reduce((sum, product) => sum + product.quantitySold, 0),
    paidOrders: orders.filter((order) => order.paymentStatus === 'paid').length,
  }), [orders, soldProducts]);

  return (
    <main className="admin-orders-page">
      <div className="container">
        <div className="page-heading">
          <div>
            <h1>Đơn hàng & sản phẩm đã bán</h1>
            <p>Theo dõi các đơn đặt hàng thành công, phương thức thanh toán và thống kê số lượng sản phẩm đã bán.</p>
          </div>
          <Link className="btn btn-secondary" to="/admin">
            Về menu admin
          </Link>
        </div>

        <div className="orders-summary-grid">
          <div className="summary-card"><span>Tổng đơn hàng</span><strong>{summary.orderCount}</strong></div>
          <div className="summary-card"><span>Tổng doanh thu</span><strong>{summary.totalRevenue.toLocaleString('vi-VN')} ₫</strong></div>
          <div className="summary-card"><span>Sản phẩm đã bán</span><strong>{summary.soldUnits}</strong></div>
          <div className="summary-card"><span>Đơn thanh toán QR</span><strong>{summary.paidOrders}</strong></div>
        </div>

        {loading && <p>Đang tải đơn hàng...</p>}
        {error && <p className="error-text">Lỗi: {error}</p>}

        {!loading && (
          <>
            <section className="orders-section">
              <h2>Danh sách đơn đã bán</h2>
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center' }}>
                          Chưa có đơn hàng nào.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            <strong>{order.customerName || 'Khách lẻ'}</strong>
                            <p>{order.customerEmail || 'Không có email'}</p>
                          </td>
                          <td>
                            {(order.items || []).map((item) => (
                              <div key={`${order.id}-${item.id}-${item.name}`} className="order-item-line">
                                {item.name} × {item.quantity}
                              </div>
                            ))}
                          </td>
                          <td>
                            <strong>{paymentMethodLabel[order.paymentMethod] || order.paymentMethod || 'Tiền mặt'}</strong>
                            <p>{paymentStatusLabel[order.paymentStatus] || order.paymentStatus || 'Chờ thanh toán'}</p>
                          </td>
                          <td>{orderStatusLabel[order.status] || order.status || 'Chờ xử lý'}</td>
                          <td>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} ₫</td>
                          <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="orders-section">
              <h2>Thống kê sản phẩm đã bán</h2>
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Hãng</th>
                      <th>Số lượng đã bán</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>
                          Chưa có dữ liệu bán hàng.
                        </td>
                      </tr>
                    ) : (
                      soldProducts.map((product) => (
                        <tr key={`${product.id}-${product.name}`}>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>{product.quantitySold}</td>
                          <td>{product.revenue.toLocaleString('vi-VN')} ₫</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminOrders;
