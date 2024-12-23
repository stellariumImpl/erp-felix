// models/WorkOrder.js
const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  area: {
    type: String,
    required: true
  },
  crane: {
    type: String,
    required: true
  },
  equipmentStatus: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  shift: {
    type: String,
    required: true,
    enum: ['早班', '晚班', '早/晚']
  },
  workType: {
    type: String,
    required: true
  },
  workProperty: {
    type: String,
    required: true
  },
  faultType: {
    type: String,
    required: true
  },
  hasSpareParts: {
    type: Boolean,
    default: false
  },
  sparePartsName: {
    type: String,
    required: function() {
      return this.hasSpareParts === true;
    }
  },
  sparePartsSpecification: {
    type: String,
    required: function() {
      return this.hasSpareParts === true;
    }
  },
  sparePartsUnit: {
    type: String,
    enum: ['米', '个', '组', '件'],
    required: function() {
      return this.hasSpareParts === true;
    }
  },
  sparePartsQuantity: {
    type: Number,
    required: function() {
      return this.hasSpareParts === true;
    },
    min: 0
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'cancel'],
    default: 'pending'  // 确保新建时默认为 pending
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // 关键修改：创建时不要求必填
    required: false
  },
  approveTime: {
    type: Date,
    required: false  // 不要求必填
  },
  approveComment: {
    type: String,
    required: false  // 不要求必填
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // 添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);