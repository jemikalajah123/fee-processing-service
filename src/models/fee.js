const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  feeId: {
    type: String,
    unique:true
  },
  feeCurrency: {
    type: String
  },
  feeLocale: {
    type: String
  },
  feeEntityAndProperty: {
    type: String
  },
  feeType: {
    type: String
  },
  feeValue: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Fee = mongoose.model('fee', FeeSchema);

module.exports = Fee;
