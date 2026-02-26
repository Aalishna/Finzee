const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
  try {
    const { month, year, category, dateRange } = req.query;
    const query = { userId: req.userId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    } else if (dateRange) {
      const [from, to] = dateRange.split(',');
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    if (category) query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { amount, category, date, description, paymentMethod } = req.body;
    if (!amount || !description) return res.status(400).json({ message: 'Amount and description required' });
    const expense = await Expense.create({ userId: req.userId, amount, category, date, description, paymentMethod });
    res.status(201).json(expense);
  } catch (err) { next(err); }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Natural Language Parser
exports.parseNatural = (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const parsed = {};

    // Amount
    const amountMatch = text.match(/(\d+(\.\d{1,2})?)/);
    if (amountMatch) parsed.amount = parseFloat(amountMatch[1]);

    // Category keywords
    const catKeywords = {
      Food: ['food','lunch','dinner','breakfast','eat','restaurant','coffee','cafe','snack','pizza','swiggy','zomato'],
      Transport: ['uber','ola','bus','train','metro','petrol','fuel','cab','auto','rickshaw'],
      Shopping: ['shopping','clothes','amazon','flipkart','bought','purchase'],
      Entertainment: ['movie','netflix','spotify','game','concert','party'],
      Health: ['doctor','medicine','pharmacy','gym','hospital','medical'],
      Subscriptions: ['subscription','prime','hotstar','netflix','spotify'],
      Utilities: ['electricity','water','internet','wifi','bill','utility'],
      Rent: ['rent','house','apartment'],
      Travel: ['travel','flight','hotel','trip','vacation','holiday'],
      Education: ['course','book','class','tuition','school','college'],
    };
    const lowerText = text.toLowerCase();
    let foundCat = 'Other';
    for (const [cat, kws] of Object.entries(catKeywords)) {
      if (kws.some(kw => lowerText.includes(kw))) { foundCat = cat; break; }
    }
    parsed.category = foundCat;

    // Date
    const today = new Date();
    if (lowerText.includes('yesterday')) {
      today.setDate(today.getDate() - 1);
      parsed.date = today.toISOString().split('T')[0];
    } else if (lowerText.includes('last friday')) {
      const day = today.getDay();
      const diff = (day + 2) % 7 + 1;
      today.setDate(today.getDate() - diff);
      parsed.date = today.toISOString().split('T')[0];
    } else if (lowerText.includes('last week')) {
      today.setDate(today.getDate() - 7);
      parsed.date = today.toISOString().split('T')[0];
    } else {
      parsed.date = today.toISOString().split('T')[0];
    }

    // Description — use remainder of text minus amount/date words
    const cleanDesc = text.replace(/\d+(\.\d+)?/, '').replace(/yesterday|today|last friday|last week/gi, '').replace(/spent|paid|on|for|rupees?|rs\.?/gi, '').trim();
    parsed.description = cleanDesc || 'Expense';

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Parse failed' });
  }
};