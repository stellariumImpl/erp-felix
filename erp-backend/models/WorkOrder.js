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
      return this.hasSpareParts;
    }
  },
  sparePartsSpecification: {
    type: String,
    required: function() {
      return this.hasSpareParts;
    }
  },
  sparePartsUnit: {
    type: String,
    required: function() {
      return this.hasSpareParts;
    },
    enum: ['米', '个', '组', '件']
  },
  sparePartsQuantity: {
    type: Number,
    required: function() {
      return this.hasSpareParts;
    }
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  created: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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