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
    const { message, history } = req.body;

    const userMsg = String(message || '').trim().toLowerCase();

    if (!userMsg) {
      return res.status(400).json({ error: 'Thiếu nội dung chat' });
    }

    const products = await Product.findAll({ order: [['id', 'ASC']] });

    let matched = products;
    let filterType = '';

    // Kiểm tra câu hỏi cụ thể trước
    if (userMsg.includes('xin chào') || userMsg.includes('hello') || userMsg.includes('hi')) {
      const reply = 'Xin chào Anh/Chị! 👋 Em có thể tư vấn điện thoại phù hợp với nhu cầu của Anh/Chị. Anh/Chị đang tìm điện thoại trong tầm giá bao nhiêu ạ? 💰';
      return res.json({ reply });
    } else if (userMsg.includes('trả góp')) {
      const reply = 'PhoneHub hỗ trợ trả góp 0% lên đến 12 tháng! ✅\n\nĐiều kiện: CMND/CCCD còn hạn, hợp đồng lao động hoặc sao kê ngân hàng 3 tháng.\n\nAnh/Chị muốn trả góp sản phẩm nào ạ?';
      return res.json({ reply });
    } else if (userMsg.includes('đăng ký') || userMsg.includes('muốn đăng ký') || userMsg.includes('tôi muốn đăng ký')) {
      const reply = 'Để được tư vấn đăng ký, Anh/Chị vui lòng liên hệ hotline 1800.1060 hoặc inbox trực tiếp. Nhân viên PhoneHub sẽ liên hệ lại ngay để hỗ trợ ạ!';
      return res.json({ reply });
    } else if (userMsg.includes('giấy tờ') || userMsg.includes('cần giấy') || userMsg.includes('điều kiện')) {
      const reply = 'Để trả góp 0% tại PhoneHub, Anh/Chị cần chuẩn bị:\n\n✅ CMND/CCCD còn hạn\n✅ Hợp đồng lao động hoặc chứng chỉ công việc\n✅ Hoặc sao kê ngân hàng 3 tháng gần nhất\n\nAnh/Chị có đủ điều kiện để trả góp không ạ? 😊';
      return res.json({ reply });
    } else if (userMsg.includes('bảo hành')) {
      const reply = 'PhoneHub bảo hành chính hãng 12 tháng tại tất cả cửa hàng! 🛡️\n\nHỗ trợ 1 đổi 1 trong 30 ngày nếu lỗi do nhà sản xuất.\n\nAnh/Chị cần hỗ trợ thêm gì không ạ?';
      return res.json({ reply });
    }

    // Lọc theo hãng
    if (userMsg.includes('iphone') || userMsg.includes('apple')) {
      matched = products.filter((p) => p.brand.toLowerCase() === 'apple');
      filterType = 'Apple';
    } else if (userMsg.includes('samsung')) {
      matched = products.filter((p) => p.brand.toLowerCase() === 'samsung');
      filterType = 'Samsung';
    } else if (userMsg.includes('xiaomi')) {
      matched = products.filter((p) => p.brand.toLowerCase() === 'xiaomi');
      filterType = 'Xiaomi';
    } else if (userMsg.includes('oppo')) {
      matched = products.filter((p) => p.brand.toLowerCase() === 'oppo');
      filterType = 'OPPO';
    }
    // Lọc theo giá
    else if (userMsg.includes('dưới 10') || userMsg.includes('10 triệu')) {
      matched = products.filter((p) => Number(p.price) < 10000000);
      filterType = 'dưới 10 triệu';
    } else if (userMsg.includes('dưới 15') || userMsg.includes('15 triệu') || userMsg.includes('tầm trung')) {
      matched = products.filter((p) => Number(p.price) < 15000000);
      filterType = 'dưới 15 triệu';
    } else if (userMsg.includes('dưới 20') || userMsg.includes('20 triệu')) {
      matched = products.filter((p) => Number(p.price) < 20000000);
      filterType = 'dưới 20 triệu';
    } else if (userMsg.includes('dưới 25') || userMsg.includes('25 triệu trở xuống')) {
      matched = products.filter((p) => Number(p.price) <= 25000000);
      filterType = 'dưới 25 triệu';
    } else if (userMsg.includes('rẻ')) {
      matched = products.filter((p) => Number(p.price) < 12000000);
      filterType = 'giá rẻ';
    } else if (
      userMsg.includes('trên 25') ||
      userMsg.includes('trên 30') ||
      userMsg.includes('flagship') ||
      userMsg.includes('cao cấp') ||
      userMsg.includes('mạnh nhất')
    ) {
      matched = products.filter((p) => Number(p.price) >= 25000000);
      filterType = 'trên 25 triệu';
    }

    let reply = '';

    if (matched.length > 0) {
      // Nếu tìm thấy sản phẩm theo tiêu chí lọc
      const top = matched.slice(0, 3);
      const lines = top
        .map(
          (p) =>
            `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} (${p.reviews} đánh giá) • ${p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'}`
        )
        .join('\n\n');
      reply = `Em tìm được ${top.length} sản phẩm phù hợp cho Anh/Chị:\n\n${lines}\n\nAnh/Chị muốn biết thêm chi tiết sản phẩm nào ạ? 😊`;
    } else if (filterType) {
      // Không tìm thấy theo tiêu chí lọc, hiển thị tất cả sản phẩm
      const allLines = products.slice(0, 5)
        .map(
          (p) =>
            `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} • ${p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'}`
        )
        .join('\n\n');
      reply = `Em chưa tìm được sản phẩm "${filterType}". Dưới đây là tất cả sản phẩm của PhoneHub:\n\n${allLines}\n\nAnh/Chị muốn chọn sản phẩm nào ạ? 😊`;
    } else {
      // Không có tiêu chí lọc cụ thể, hiển thị tất cả sản phẩm
      const allLines = products.slice(0, 5)
        .map(
          (p) =>
            `📱 ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ\n   ${p.specs}\n   ⭐ ${p.rating} • ${p.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'}`
        )
        .join('\n\n');
      reply = `Dưới đây là danh sách sản phẩm của PhoneHub:\n\n${allLines}\n\nAnh/Chị muốn tìm sản phẩm nào ạ? 😊`;
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
