import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const bodyText = await response.text();
      let data;
      try {
        data = JSON.parse(bodyText);
      } catch (parseError) {
        throw new Error(`API trả về không phải JSON: ${bodyText.slice(0, 200)}`);
      }
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải dữ liệu user');
      }
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = isEditing ? `${API_BASE}/api/users/${editingUserId}` : `${API_BASE}/api/users`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Lỗi khi lưu user');
      }

      setForm({ name: '', email: '', role: '' });
      setIsEditing(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role });
    setIsEditing(true);
    setEditingUserId(user.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Lỗi khi xóa user');
      }
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="users-page">
      <div className="container">
        <h1>Danh sách Users</h1>
        <p>Thông tin các tài khoản nhân sự của PhoneHub</p>

        {loading && <p>Đang tải danh sách…</p>}
        {error && <p className="error-text">Lỗi: {error}</p>}

        {!loading && !error && (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Chưa có user nào trong database.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="btn btn-secondary small" onClick={() => handleEdit(user)}>
                          Sửa
                        </button>
                        <button className="btn btn-danger small" onClick={() => handleDelete(user.id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <section className="user-form-section">
          <h2>{isEditing ? 'Chỉnh sửa user' : 'Thêm user mới'}</h2>
          <form className="user-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Họ tên</label>
              <input name="name" value={form.name} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Vai trò</label>
              <input name="role" value={form.role} onChange={handleInputChange} required />
            </div>
            <div className="action-buttons">
              <button className="btn btn-primary" type="submit">{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
              {isEditing && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setForm({ name: '', email: '', role: '' });
                    setIsEditing(false);
                    setEditingUserId(null);
                    setError(null);
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        <Link className="btn btn-secondary" to="/">
          Quay về trang chủ
        </Link>
      </div>
    </main>
  );
};

export default Users;
