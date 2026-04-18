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

app.get('/api/products', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { brand: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
            { details: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined;

    const products = await Product.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.json(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice || null,
        specs: product.specs,
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        stock: product.stock,
      }))
    );
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ error: 'Lỗi khi truy vấn sản phẩm' });
  }
});

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

      const formatItem = (p) =>
        `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} (${p.reviews} đánh giá) • ${
          p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'
        }`;

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
        .map(
          (p) =>
            `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} (${p.reviews} đánh giá) • ${
              p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'
            }`
        )
        .join('\n\n')}\n\nAnh/Chị muốn biết thêm chi tiết sản phẩm nào ạ? 😊`;
    } else {
      const allLines = products.slice(0, 5)
        .map(
          (p) =>
            `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} (${p.reviews} đánh giá) • ${
              p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'
            }`
        )
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

app.listen(port, () => {
  console.log(`🚀 Server chạy tại http://localhost:${port}`);
});
