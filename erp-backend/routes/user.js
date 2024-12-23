// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkOrder = require('../models/WorkOrder');
const auth = require('../middleware/auth');

// 获取所有用户
router.get('/', auth, async (req, res) => {
  try {
    if (!['admin', 'boss'].includes(req.user.role)) {
      return res.status(403).json({ message: '无权限访问' });
    }
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户工单
router.get('/:userId/workorders', auth, async (req, res) => {
  try {
    if (!['admin', 'boss'].includes(req.user.role)) {
      return res.status(403).json({ message: '无权限访问' });
    }
    const workOrders = await WorkOrder.find({ creator: req.params.userId });
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 导出用户工单
router.get('/:userId/workorders/export', auth, async (req, res) => {
  try {
    // 权限检查
    if (!['admin', 'boss'].includes(req.user.role)) {
      return res.status(403).json({ message: '无权限访问' });
    }

    const workOrders = await WorkOrder.find({ creator: req.params.userId })
      .populate('creator', 'username')
      .lean();

    const exportData = workOrders.map(order => ({
      区域: order.area,
      行车: order.crane,
      设备状况: order.equipmentStatus,
      开始时间: new Date(order.startTime).toLocaleString(),
      结束时间: new Date(order.endTime).toLocaleString(),
      时长: order.duration,
      班次: order.shift,
      作业类型: order.workType,
      作业属性: order.workProperty,
      故障类型: order.faultType,
      是否消耗备件: order.hasSpareParts ? '是' : '否',
      备件名称: order.sparePartsName,
      备件规格: order.sparePartsSpecification,
      备件数量: order.sparePartsQuantity,
      备件单位: order.sparePartsUnit,
      状态: order.status,
      创建人: order.creator?.username,
      备注: order.remarks
    }));

    res.json(exportData);
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;