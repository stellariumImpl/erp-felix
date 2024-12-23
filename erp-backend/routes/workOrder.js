// routes/workOrder.js
const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const auth = require('../middleware/auth');

// 创建工单
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received work order data:', req.body)
    console.log('User:', req.user)

    const workOrder = new WorkOrder({
      ...req.body,
      creator: req.user.userId,
      lastModifiedBy: req.user.userId
    })

    console.log('Created work order:', workOrder)

    await workOrder.save()
    console.log('Work order saved successfully')

    res.status(201).json({ message: '工单创建成功', workOrder })
  } catch (error) {
    console.error('创建工单失败:', error)
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// routes/workOrder.js
router.get('/', auth, async (req, res) => {
  try {
    // 不再根据用户角色筛选工单，允许所有用户查看所有工单
    const query = {}
    if (req.query.area) query.area = req.query.area;
    
    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .sort('-createdAt')
      .populate('creator', 'username role')
      .populate('lastModifiedBy', 'username')
      
    res.json({
      workOrders,
      total,
      totalPages: Math.ceil(total / 10)
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加删除工单路由
router.delete('/:id', auth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('creator', 'role');
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    // 权限检查
    const canDelete = 
      req.user.role === 'boss' || 
      (req.user.role === 'admin' && 
        (workOrder.creator._id.toString() === req.user.userId || 
         workOrder.creator.role === 'user')) ||
      workOrder.creator._id.toString() === req.user.userId;

    if (!canDelete) {
      return res.status(403).json({ message: '无权限删除此工单' });
    }

    await WorkOrder.findByIdAndDelete(req.params.id);
    res.json({ message: '工单删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个工单详情
router.get('/:id', auth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('creator', 'username');
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 修改工单的权限检查
router.put('/:id', auth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('creator', 'role');
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    // 权限检查
    if (req.user.role === 'user' && workOrder.creator._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: '无权修改此工单' });
    }

    if (req.user.role === 'admin' && 
        workOrder.creator.role === 'admin' && 
        workOrder.creator._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: '无权修改其他管理员的工单' });
    }

    // 更新工单
    workOrder.lastModifiedBy = req.user.userId;
    workOrder.lastModifiedAt = new Date();
    Object.assign(workOrder, req.body);
    await workOrder.save();

    res.json({
      message: '工单更新成功',
      workOrder
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除工单
router.delete('/:id', auth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('creator', 'role')
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' })
    }

    // 使用与编辑相同的权限检查逻辑
    const canDelete = 
      req.user.role === 'boss' || 
      (req.user.role === 'admin' && 
       (workOrder.creator._id.toString() === req.user.userId || 
        workOrder.creator.role === 'user')) ||
      workOrder.creator._id.toString() === req.user.userId

    if (!canDelete) {
      return res.status(403).json({ message: '无权限删除此工单' })
    }

    await workOrder.remove()
    res.json({ message: '工单删除成功' })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
});

// routes/workOrder.js
router.get('/export', auth, async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('creator', 'username')
      .lean();

    // 确保所有字段都被包含在导出数据中
    const exportData = workOrders.map(order => ({
      area: order.area,
      crane: order.crane,
      equipmentStatus: order.equipmentStatus,
      startTime: order.startTime,
      endTime: order.endTime,
      duration: order.duration,
      shift: order.shift,
      workType: order.workType,
      workProperty: order.workProperty,
      faultType: order.faultType,
      hasSpareParts: order.hasSpareParts,
      sparePartsName: order.sparePartsName,
      status: order.status,
      creator: order.creator?.username || '',
      remarks: order.remarks,
      createdAt: order.createdAt
    }));

    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: '导出失败', error: error.message });
  }
});

module.exports = router;