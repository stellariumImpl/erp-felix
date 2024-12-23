// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const workOrderRoutes = require('./routes/workOrder'); // 移到顶部
const userRoutes = require('./routes/user');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由注册 - 把所有路由放在一起
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);         // 用户管理路由
app.use('/api/workorders', workOrderRoutes);

// 添加日志中间件方便调试
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// backend/app.js
app.use(cors({
  origin: 'http://localhost:5173',  // 前端开发服务器地址
  credentials: true
}));


// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});