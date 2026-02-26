const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['Food','Transport','Shopping','Entertainment','Health','Education','Subscriptions','Utilities','Rent','Travel','Other'],
    default: 'Other'
  },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true, trim: true },
  paymentMethod: { type: String, enum: ['Cash','Card','UPI','Net Banking'], default: 'UPI' },
  isRecurring: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);