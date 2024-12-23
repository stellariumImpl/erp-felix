// routes/workOrder.js
const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const mongoose = require('mongoose'); // 添加这行
const auth = require('../middleware/auth');

// 创建工单
// routes/workOrder.js
router.post('/', auth, async (req, res) => {
  try {
    const workOrderData = {
      ...req.body,
      creator: req.user.userId,
      lastModifiedBy: req.user.userId,
      status: 'pending'
    };

    // 如果没有使用备件，把备件字段设为 null
    if (!workOrderData.hasSpareParts) {
      workOrderData.sparePartsName = null;
      workOrderData.sparePartsSpecification = null;
      workOrderData.sparePartsUnit = null;
      workOrderData.sparePartsQuantity = null;
    }

    // 删除空字符串字段
    Object.keys(workOrderData).forEach(key => {
      if (workOrderData[key] === '') {
        workOrderData[key] = null;
      }
    });

    const workOrder = new WorkOrder(workOrderData);
    await workOrder.save();

    res.status(201).json({
      message: '工单创建成功',
      workOrder
    });

  } catch (error) {
    console.error('创建工单失败:', error);
    res.status(500).json({
      message: '创建工单失败',
      error: error.message
    });
  }
});

// routes/workOrder.js
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await WorkOrder.countDocuments();

    // 获取分页数据
    const records = await WorkOrder.find()
    .populate('creator', 'username role')
    .populate('lastModifiedBy', 'username role')
    .populate('approver', 'username role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    res.json({
      records,             // 当前页的记录
      total,              // 总记录数
      page,               // 当前页码
      pages: Math.ceil(total / limit)  // 总页数
    });

  } catch (error) {
    console.error('获取工单列表错误:', error);
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
router.get('/workorders/export', auth, async (req, res) => {
  try {
    console.log('开始导出所有工单');  // 添加日志
    
    const workOrders = await WorkOrder.find()
      .populate('creator', 'username')
      .lean();
      
    console.log('查询到的工单数量:', workOrders.length);  // 添加日志
    
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

    console.log('处理后的数据:', exportData.length);  // 添加日志
    
    res.json(exportData);
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ 
      message: '导出失败', 
      error: error.message,
      stack: error.stack  // 添加错误堆栈信息
    });
  }
});


// routes/workOrder.js
// 审批路由
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approveComment } = req.body;

    // 查找并检查工单
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    // 检查工单状态
    if (workOrder.status !== 'pending') {
      return res.status(400).json({ 
        message: '该工单已被审批',
        currentStatus: workOrder.status 
      });
    }

    // 权限检查
    if (!['admin', 'boss'].includes(req.user.role)) {
      return res.status(403).json({ message: '无权审批工单' });
    }

    // 更新工单
    const updatedWorkOrder = await WorkOrder.findOneAndUpdate(
      { _id: id, status: 'pending' },
      {
        status,
        approver: req.user.userId,  // 确认这里正确设置了审批人
        approveTime: new Date(),
        approveComment,
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      },
      { new: true }
    )
    .populate([
      { path: 'creator', select: 'username role' },
      { path: 'approver', select: 'username role' },  // 确保正确填充审批人
      { path: 'lastModifiedBy', select: 'username role' }
    ]);

    console.log('Updated work order:', updatedWorkOrder);  // 添加日志检查数据

    res.json(updatedWorkOrder);
  } catch (error) {
    console.error('审批失败:', error);
    res.status(500).json({ message: '审批失败', error: error.message });
  }
});


module.exports = router;