const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  feeId: {
    type: String,
    unique:true
  },
  feeCurrency: {
    type: String
  },
  priority: {
    type: Number,
    default: 0
  },
  feeLocale: {
    type: String
  },
  feeProperty: {
    type: String
  },
  feeEntity: {
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

const FeeRepo = {
  findOne: async (data) => {
    return Fee.findOne(data)
  },
  findConfigs: async({feeCurrency, feeLocale, feeEntity, feeProperty}) => {
    return Fee.find({
      feeLocale: {$in: [...feeLocale, '*']},
      feeCurrency: {$in: [...feeCurrency, '*']},
      feeEntity: {$in: [...feeEntity, '*']},
      feeProperty: {$in: [...feeProperty, '*']},
    }).sort({
        priority: 1
    });
  },
  findCurrency: async(currency) => {
    return Fee.find({feeCurrency: currency})
  },
  insertMany: async(data,options) => {
    return Fee.insertMany(data,options);
  }
}

module.exports = FeeRepo;
