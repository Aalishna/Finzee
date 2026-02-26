const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

exports.getHealthScore = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [expenses, budget, goals] = await Promise.all([
      Expense.find({ userId: req.userId, date: { $gte: startOfMonth } }),
      Budget.findOne({ userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() }),
      Goal.find({ userId: req.userId }),
    ]);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const totalBudget = budget?.categories?.reduce((s, c) => s + c.limit, 0) || 0;

    // 1. Budget adherence (0-40)
    let budgetAdherence = 20; // default if no budget set
    if (totalBudget > 0) {
      const ratio = totalSpent / totalBudget;
      if (ratio <= 0.6) budgetAdherence = 40;
      else if (ratio <= 0.8) budgetAdherence = 32;
      else if (ratio <= 1.0) budgetAdherence = 20;
      else if (ratio <= 1.2) budgetAdherence = 10;
      else budgetAdherence = 0;
    }

    // 2. Savings rate (0-30) — based on goals progress
    let savingsRate = 0;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((s, g) => s + (g.savedAmount / Math.max(g.targetAmount, 1)), 0) / goals.length;
      savingsRate = Math.round(avgProgress * 30);
    } else {
      savingsRate = 10; // some credit for just using the app
    }

    // 3. Spending consistency (0-30)
    let spendingConsistency = 15;
    if (expenses.length >= 7) {
      const dayMap = {};
      expenses.forEach(e => {
        const d = new Date(e.date).getDate();
        dayMap[d] = (dayMap[d] || 0) + e.amount;
      });
      const amounts = Object.values(dayMap);
      const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const variance = amounts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amounts.length;
      const cv = Math.sqrt(variance) / avg; // coefficient of variation
      if (cv < 0.3) spendingConsistency = 30;
      else if (cv < 0.6) spendingConsistency = 22;
      else if (cv < 1.0) spendingConsistency = 15;
      else spendingConsistency = 8;
    }

    const total = Math.min(budgetAdherence + savingsRate + spendingConsistency, 100);

    const tips = [];
    if (budgetAdherence < 30) tips.push('💰 Set and stick to a monthly budget for each category');
    if (savingsRate < 20) tips.push('🎯 Create savings goals and contribute regularly');
    if (spendingConsistency < 20) tips.push('📊 Try to spend more consistently day-to-day');
    if (!budget) tips.push('📋 Set up a monthly budget to track your limits');
    if (goals.length === 0) tips.push('🏆 Add a savings goal to boost your score');
    if (expenses.length < 10) tips.push('📝 Log all your expenses for better insights');

    res.json({ total, budgetAdherence, savingsRate, spendingConsistency, tips });
  } catch (err) { next(err); }
};