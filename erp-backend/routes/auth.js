const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// 注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Register attempt:', { username, role });

    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Registration failed: Username exists', username);
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 验证角色是否有效
    const validRoles = ['user', 'admin', 'boss'];
    if (!validRoles.includes(role)) {
      console.log('Registration failed: Invalid role', role);
      return res.status(400).json({ message: '无效的用户角色' });
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      role
    });

    await user.save();
    console.log('Registration successful:', { username, role });

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    // 先查找用户名匹配的用户
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login failed: User not found', username);
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证角色是否匹配
    // if (user.role !== role) {
    //   console.log('Login failed: Role mismatch', { 
    //     attempted: role, 
    //     actual: user.role 
    //   });
    //   return res.status(401).json({ message: '用户角色不匹配' });
    // }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password', username);
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { username, role: user.role });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.log('User not found:', req.user.userId);
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
});

// 验证用户角色权限
router.get('/verify-role', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found for role verification:', req.user.userId);
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ role: user.role });
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
});

// 测试路由 - 用于调试
router.get('/test-user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;