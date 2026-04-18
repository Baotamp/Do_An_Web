require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
const port = Number(process.env.PORT) || 4000;
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

app.use(cors({ origin: true }));
app.use(express.json());

let sequelize;

if (process.env.DB_USE_SQLITE === 'true') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || 'database.sqlite',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_DATABASE || 'webban',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
    }
  );
}

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Khách hàng' },
  passwordHash: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'users',
  timestamps: true,
});

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  originalPrice: { type: DataTypes.INTEGER, allowNull: true },
  specs: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 4.5 },
  reviews: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  image: { type: DataTypes.STRING, allowNull: true, defaultValue: '📱' },
  description: { type: DataTypes.TEXT, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: false },
  fullDescription: { type: DataTypes.TEXT, allowNull: true },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
}, {
  tableName: 'products',
  timestamps: true,
});

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true, defaultValue: '📱' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'cart_items',
  timestamps: true,
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customerName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Khách lẻ' },
  customerEmail: { type: DataTypes.STRING, allowNull: true },
  customerPhone: { type: DataTypes.STRING, allowNull: true },
  customerAddress: { type: DataTypes.STRING, allowNull: true },
  totalAmount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'cash' },
  paymentStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  itemsJson: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'orders',
  timestamps: true,
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  userName: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  comment: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'reviews',
  timestamps: true,
});

const defaultProducts = [
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 35900000,
    originalPrice: 39990000,
    specs: '6.7" AMOLED | A17 Pro | 256GB',
    rating: 4.8,
    reviews: 245,
    image: '📱',
    description: 'Flagship iPhone mới nhất với công nghệ camera tiên tiến',
    details: 'Màn hình AMOLED 6.7 inch, Chip A17 Pro, Camera 48MP, Pin 4685mAh, 5G, Titanium',
    fullDescription: 'iPhone 15 Pro Max là chiếc iPhone mạnh nhất của Apple với chip A17 Pro và thiết kế Titanium.',
    stock: 15,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 32990000,
    originalPrice: 36990000,
    specs: '6.8" Dynamic AMOLED | Snapdragon 8 Gen 3',
    rating: 4.7,
    reviews: 189,
    image: '📱',
    description: 'Điện thoại flagship của Samsung với hiệu năng cực mạnh',
    details: 'Màn hình Dynamic AMOLED 120Hz, Snapdragon 8 Gen 3, Camera 50MP, 5000mAh, S Pen',
    fullDescription: 'Galaxy S24 Ultra nổi bật với S Pen tích hợp, camera chất lượng cao và hiệu năng flagship.',
    stock: 12,
  },
  {
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    price: 19990000,
    originalPrice: 22990000,
    specs: '6.73" AMOLED | Snapdragon 8 Gen 3',
    rating: 4.6,
    reviews: 156,
    image: '📱',
    description: 'Giá tốt nhất cho flagship performance',
    details: 'Màn hình AMOLED 120Hz, Snapdragon 8 Gen 3, Camera Leica 50MP, 5000mAh',
    fullDescription: 'Xiaomi 14 Ultra mang lại hiệu năng mạnh và hệ thống camera Leica ấn tượng.',
    stock: 20,
  },
  {
    name: 'OPPO Find X6 Pro',
    brand: 'OPPO',
    price: 21990000,
    originalPrice: 24990000,
    specs: '6.82" AMOLED | Snapdragon 8 Gen 3',
    rating: 4.5,
    reviews: 98,
    image: '📱',
    description: 'Thiết kế đẹp với công nghệ sạc nhanh',
    details: 'Màn hình AMOLED 120Hz, Snapdragon 8 Gen 3, Sạc 100W, Camera 50MP',
    fullDescription: 'OPPO Find X6 Pro phù hợp người dùng thích thiết kế cao cấp và sạc siêu nhanh.',
    stock: 18,
  },
  {
    name: 'iPhone 15',
    brand: 'Apple',
    price: 26900000,
    originalPrice: 29990000,
    specs: '6.1" Super Retina | A16 Bionic',
    rating: 4.7,
    reviews: 312,
    image: '📱',
    description: 'iPhone tiêu chuẩn với hiệu năng mạnh mẽ',
    details: 'Màn hình 6.1 inch, A16 Bionic, Camera 48MP, 5G',
    fullDescription: 'iPhone 15 là lựa chọn cân bằng giữa hiệu năng, thiết kế và độ ổn định.',
    stock: 25,
  },
  {
    name: 'Samsung Galaxy A54',
    brand: 'Samsung',
    price: 12990000,
    originalPrice: 14990000,
    specs: '6.4" Super AMOLED | Exynos 1380',
    rating: 4.4,
    reviews: 267,
    image: '📱',
    description: 'Smartphone tầm trung tốt nhất hiện nay',
    details: 'Màn hình Super AMOLED 120Hz, Exynos 1380, Camera 50MP, Pin 5000mAh',
    fullDescription: 'Galaxy A54 là mẫu máy tầm trung nổi bật với pin bền, màn hình đẹp và camera ổn định.',
    stock: 30,
  },
];

const serializeOrder = (orderInstance) => {
  const order = orderInstance.get ? orderInstance.get({ plain: true }) : orderInstance;
  return {
    ...order,
    items: order.itemsJson ? JSON.parse(order.itemsJson) : [],
  };
};

const serializeUser = (userInstance) => {
  const user = userInstance.get ? userInstance.get({ plain: true }) : userInstance;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const generateAuthToken = (user) => jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role,
  },
  jwtSecret,
  { expiresIn: jwtExpiresIn }
);

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.get('/', (req, res) => {
  res.json({
    message: 'PhoneHub backend is running',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/users',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/chat',
    ],
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['id', 'ASC']] });
    res.json(users.map(serializeUser));
  } catch (err) {
    console.error('GET /api/users error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });
    res.json(serializeUser(user));
  } catch (err) {
    console.error('GET /api/users/:id error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn user' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Thiếu fields name/email/password' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: 'Khách hàng',
      passwordHash,
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user: serializeUser(newUser),
    });
  } catch (err) {
    console.error('POST /api/auth/register error', err);
    res.status(500).json({ error: 'Lỗi khi đăng ký tài khoản' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu fields email/password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const safeUser = serializeUser(user);
    const token = generateAuthToken(safeUser);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('POST /api/auth/login error', err);
    res.status(500).json({ error: 'Lỗi khi đăng nhập' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Thiếu fields name/email/role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    const newUser = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role,
    });
    res.status(201).json(serializeUser(newUser));
  } catch (err) {
    console.error('POST /api/users error', err);
    res.status(500).json({ error: 'Lỗi khi tạo user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (email) {
      const sameEmail = await User.findOne({ where: { email, id: { [Sequelize.Op.ne]: user.id } } });
      if (sameEmail) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }
    }

    user.name = name || user.name;
    user.email = email ? String(email).trim().toLowerCase() : user.email;
    user.role = role || user.role;
    await user.save();

    res.json(serializeUser(user));
  } catch (err) {
    console.error('PUT /api/users/:id error', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    await user.destroy();
    res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    console.error('DELETE /api/users/:id error', err);
    res.status(500).json({ error: 'Lỗi khi xóa user' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const trimmedSearch = String(search).trim();

    const whereClause = trimmedSearch
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${trimmedSearch}%` } },
            { brand: { [Op.like]: `%${trimmedSearch}%` } },
            { description: { [Op.like]: `%${trimmedSearch}%` } },
            { details: { [Op.like]: `%${trimmedSearch}%` } },
          ],
        }
      : undefined;

    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn products' });
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    console.error('GET /api/products/:id/reviews error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn đánh giá' });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const productId = Number(req.params.id);

    if (!userName || !comment) {
      return res.status(400).json({ error: 'Thiếu tên người dùng hoặc nội dung bình luận' });
    }

    const ratingNum = Number(rating) || 5;
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const newReview = await Review.create({
      productId,
      userName: String(userName).trim(),
      rating: ratingNum,
      comment: String(comment).trim(),
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error('POST /api/products/:id/reviews error', err);
    res.status(500).json({ error: 'Lỗi khi thêm đánh giá' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    res.json(product);
  } catch (err) {
    console.error('GET /api/products/:id error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn sản phẩm' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, price, specs, description, details } = req.body;
    if (!name || !brand || !price || !specs || !description || !details) {
      return res.status(400).json({ error: 'Thiếu thông tin sản phẩm bắt buộc' });
    }

    const product = await Product.create({
      ...req.body,
      price: Number(price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
      stock: Number(req.body.stock || 10),
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products error', err);
    res.status(500).json({ error: 'Lỗi khi tạo sản phẩm' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

    await product.update({
      ...req.body,
      price: req.body.price ? Number(req.body.price) : product.price,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : product.originalPrice,
      stock: req.body.stock ? Number(req.body.stock) : product.stock,
    });

    res.json(product);
  } catch (err) {
    console.error('PUT /api/products/:id error', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

    await product.destroy();
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error('DELETE /api/products/:id error', err);
    res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.sub },
      order: [['createdAt', 'ASC']],
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Lỗi lấy giỏ hàng' });
  }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Thiếu productId' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const existingItem = await CartItem.findOne({
      where: { userId: req.user.sub, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      res.json(existingItem);
    } else {
      const newItem = await CartItem.create({
        userId: req.user.sub,
        productId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        quantity,
      });
      res.json(newItem);
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Lỗi thêm vào giỏ hàng' });
  }
});

app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.sub },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật giỏ hàng' });
  }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.sub },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await item.destroy();
    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ error: 'Lỗi xóa khỏi giỏ hàng' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['id', 'DESC']] });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    console.error('GET /api/orders error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn đơn hàng' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    res.json(serializeOrder(order));
  } catch (err) {
    console.error('GET /api/orders/:id error', err);
    res.status(500).json({ error: 'Lỗi khi truy vấn đơn hàng' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, items, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
    }

    const normalizedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
    }));

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const normalizedPaymentMethod = paymentMethod === 'qr' ? 'qr' : 'cash';

    const order = await Order.create({
      customerName: customerName || 'Khách lẻ',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      totalAmount,
      status: normalizedPaymentMethod === 'qr' ? 'confirmed' : 'pending',
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentMethod === 'qr' ? 'paid' : 'pending',
      itemsJson: JSON.stringify(normalizedItems),
    });

    await CartItem.destroy({ where: {} });
    res.status(201).json(serializeOrder(order));
  } catch (err) {
    console.error('POST /api/orders error', err);
    res.status(500).json({ error: 'Lỗi khi tạo đơn hàng' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Đơn hàng không tồn tại' });

    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    await order.save();
    res.json(serializeOrder(order));
  } catch (err) {
    console.error('PUT /api/orders/:id error', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật đơn hàng' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', dialect: sequelize.getDialect() });
  } catch (err) {
    res.status(500).json({ status: 'fail', error: err.message });
  }
});

// Chat route (giữ nguyên từ file hiện tại)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userMsg = String(message || '').trim().toLowerCase();

    if (!userMsg) {
      return res.status(400).json({ error: 'Thiếu nội dung chat' });
    }

    const products = await Product.findAll({ order: [['id', 'ASC']] });

    const parsePriceRange = (text) => {
      const normalized = text.replace(/\./g, '').replace(/,/, '.')
      const result = { min: null, max: null }
      const match = normalized.match(/(\d+(?:\.\d+)?)\s*triệu/)

      if (!match) return result
      const value = Number(match[1]) * 1000000

      if (/\b(dưới|ít hơn|thấp hơn|trở xuống|tối đa|nhỏ hơn|<=?)\b/.test(normalized)) {
        result.max = value
      } else if (/\b(trên|lớn hơn|cao hơn|trở lên|>=?)\b/.test(normalized)) {
        result.min = value
      } else if (/\b(từ)\b/.test(normalized)) {
        result.min = value
      } else {
        result.max = value
      }

      return result
    };

    const getBrand = (text) => {
      if (text.includes('iphone') || text.includes('apple')) return 'apple'
      if (text.includes('samsung')) return 'samsung'
      if (text.includes('xiaomi')) return 'xiaomi'
      if (text.includes('oppo')) return 'oppo'
      return null
    };

    const buildProductLink = (product) => `${FRONTEND_URL}/product/${product.id}`

    const formatItem = (p) =>
      `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} (${p.reviews} đánh giá) • ${
        p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'
      }\n   Xem chi tiết: ${buildProductLink(p)}`

    const priceRange = parsePriceRange(userMsg)
    const brand = getBrand(userMsg)

    let matched = products

    if (brand) {
      matched = matched.filter((p) => p.brand.toLowerCase() === brand)
    }
    if (priceRange.min !== null) {
      matched = matched.filter((p) => Number(p.price) >= priceRange.min)
    }
    if (priceRange.max !== null) {
      matched = matched.filter((p) => Number(p.price) <= priceRange.max)
    }

    const isCompareRequest = /so sánh giá|so sánh|so sanh giá|so sanh/.test(userMsg);

    if (userMsg.includes('xin chào') || userMsg.includes('hello') || userMsg.includes('hi')) {
      return res.json({
        reply:
          'Xin chào Anh/Chị! 👋 Em có thể tư vấn điện thoại phù hợp với nhu cầu của Anh/Chị. Anh/Chị đang tìm điện thoại trong tầm giá bao nhiêu ạ? 💰',
      });
    }

    if (userMsg.includes('trả góp')) {
      return res.json({
        reply:
          'PhoneHub hỗ trợ trả góp 0% lên đến 12 tháng! ✅\n\nĐiều kiện: CMND/CCCD còn hạn, hợp đồng lao động hoặc sao kê ngân hàng 3 tháng.\n\nAnh/Chị muốn trả góp sản phẩm nào ạ?',
      });
    }

    if (userMsg.includes('thanh toán') || userMsg.includes('phương thức thanh toán')) {
      return res.json({
        reply:
          'Hiện PhoneHub có 2 cách thanh toán chính:\n\n' +
          '1️⃣ Thanh toán 1 lần (trực tiếp hoặc khi nhận hàng)\n' +
          '2️⃣ Thanh toán trả góp 0% (lãi suất 0%, thủ tục nhanh gọn)\n\nAnh/Chị có thể chọn sản phẩm trực tiếp trên website và nhấn "Mua ngay" hoặc "Thêm vào giỏ" để hoàn tất đơn hàng ạ.',
      });
    }

    if (userMsg.includes('đăng ký') || userMsg.includes('tôi muốn đăng ký') || userMsg.includes('muốn đăng ký')) {
      return res.json({
        reply:
          'Để đăng ký hỗ trợ trả góp, Anh/Chị vui lòng liên hệ hotline 1800.1060 hoặc để lại số, nhân viên PhoneHub sẽ gọi lại ngay ạ.',
      });
    }

    if (userMsg.includes('giấy tờ') || userMsg.includes('cần giấy') || userMsg.includes('điều kiện')) {
      return res.json({
        reply:
          'Để trả góp 0% tại PhoneHub, Anh/Chị cần chuẩn bị:\n\n✅ CMND/CCCD còn hạn\n✅ Hợp đồng lao động hoặc sao kê ngân hàng 3 tháng\n\nAnh/Chị có muốn em giúp chọn sản phẩm để đăng ký không ạ?',
      });
    }

    if (isCompareRequest) {
      const items = matched.length > 0 ? matched : products;
      const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
      const cheapest = sorted.slice(0, 3);
      const expensive = sorted.slice(-3).reverse();

      return res.json({
        reply: `Dưới đây là so sánh giá ${brand ? `của ${brand}` : ''} cho Anh/Chị:\n\n` +
          `🔹 Rẻ nhất:\n${cheapest.map(formatItem).join('\n\n')}\n\n` +
          `🔸 Cao cấp nhất:\n${expensive.map(formatItem).join('\n\n')}\n\n` +
          `Anh/Chị muốn xem thêm chi tiết sản phẩm nào ạ?`,
      });
    }

    let reply = '';
    if (matched.length > 0) {
      const top = matched.slice(0, 3);
      reply = `Em tìm được ${top.length} sản phẩm phù hợp cho Anh/Chị:\n\n${top
        .map(formatItem)
        .join('\n\n')}\n\nAnh/Chị muốn biết thêm chi tiết sản phẩm nào ạ? 😊`;
    } else {
      const allLines = products.slice(0, 5)
        .map(formatItem)
        .join('\n\n');

      reply = `Em chưa tìm được sản phẩm chính xác theo yêu cầu. Dưới đây là một vài sản phẩm PhoneHub đang có:\n\n${allLines}\n\nAnh/Chị muốn chọn sản phẩm nào ạ?`;
    }

    res.json({ reply });
  } catch (err) {
    console.error('POST /api/chat error', err);
    res.status(500).json({
      reply:
        'Em xin lỗi, hiện tại hệ thống đang bận. Anh/Chị có thể liên hệ hotline 1800.1060 để được hỗ trợ ngay nhé! 📞',
    });
  }
});

async function startServer() {
  try {
    await sequelize.sync({ alter: true });

    const adminEmail = 'admin@phonehub.com';
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await User.create({
        name: 'Quản trị viên PhoneHub',
        email: adminEmail,
        role: 'Admin',
        passwordHash: adminPasswordHash,
      });
      console.log('Seeded admin account');
    } else if (existingAdmin.role !== 'Admin' || !existingAdmin.passwordHash) {
      existingAdmin.role = 'Admin';
      existingAdmin.passwordHash = adminPasswordHash;
      await existingAdmin.save();
      console.log('Updated admin account');
    }

    const users = await User.count();
    if (users === 0) {
      await User.bulkCreate([
        { name: 'Trương Hoàng Thái Thuận', email: 'thuanch@phonehub.com', role: 'Admin' },
        { name: 'Nguyễn Đức Quang', email: 'ducq@phonehub.com', role: 'Nhân viên bán hàng' },
        { name: 'Nguyễn Trần Quốc Quang', email: 'quangqt@phonehub.com', role: 'CSKH' },
        { name: 'Bùi Minh Nhật', email: 'nhatbm@phonehub.com', role: 'Giao nhận' },
        { name: 'Phạm Bảo Tâm', email: 'tampb@phonehub.com', role: 'Kiểm hàng' },
      ]);
      console.log('Seeded initial users');
    }

    const products = await Product.count();
    if (products === 0) {
      await Product.bulkCreate(defaultProducts);
      console.log('Seeded initial products');
    }

    app.listen(port, () => {
      console.log(`Backend server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Cannot start server', err);
  }
}

startServer();
