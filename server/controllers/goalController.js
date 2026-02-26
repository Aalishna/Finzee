const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { next(err); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, savedAmount, targetDate } = req.body;
    if (!name || !targetAmount) return res.status(400).json({ message: 'Name and target amount required' });
    const goal = await Goal.create({ userId: req.userId, name, targetAmount, savedAmount: savedAmount || 0, targetDate });
    res.status(201).json(goal);
  } catch (err) { next(err); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) { next(err); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) { next(err); }
};