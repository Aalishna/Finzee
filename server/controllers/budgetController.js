const Budget = require('../models/Budget');

exports.getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const budget = await Budget.findOne({ userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() });
    res.json(budget || { categories: [] });
  } catch (err) { next(err); }
};

exports.setBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const { categories } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() },
      { categories, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const now = new Date();
    const { category } = req.params;
    const { limit } = req.body;

    let budget = await Budget.findOne({ userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() });

    if (!budget) {
      budget = new Budget({ userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear(), categories: [] });
    }

    const idx = budget.categories.findIndex(c => c.name === category);
    if (idx >= 0) {
      budget.categories[idx].limit = limit;
    } else {
      budget.categories.push({ name: category, limit });
    }

    budget.updatedAt = new Date();
    await budget.save();
    res.json(budget);
  } catch (err) { next(err); }
};