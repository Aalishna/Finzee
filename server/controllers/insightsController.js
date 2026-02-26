const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOf2MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [thisMonthExp, lastMonthExp, budget] = await Promise.all([
      Expense.find({ userId: req.userId, date: { $gte: startOfMonth } }),
      Expense.find({ userId: req.userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Budget.findOne({ userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() }),
    ]);

    const insights = [];

    // Weekend vs weekday
    if (thisMonthExp.length >= 5) {
      const weekend = thisMonthExp.filter(e => [0, 6].includes(new Date(e.date).getDay()));
      const weekday = thisMonthExp.filter(e => ![0, 6].includes(new Date(e.date).getDay()));
      if (weekend.length > 0 && weekday.length > 0) {
        const wkendAvg = weekend.reduce((s, e) => s + e.amount, 0) / weekend.length;
        const wkdayAvg = weekday.reduce((s, e) => s + e.amount, 0) / weekday.length;
        const diff = ((wkendAvg - wkdayAvg) / wkdayAvg * 100).toFixed(0);
        if (Math.abs(diff) > 10) {
          insights.push({
            type: diff > 0 ? 'warning' : 'positive',
            title: diff > 0
              ? `You spend ${Math.abs(diff)}% more on weekends`
              : `You're more frugal on weekends by ${Math.abs(diff)}%`,
            description: `Weekend average: ₹${wkendAvg.toFixed(0)} vs weekday average: ₹${wkdayAvg.toFixed(0)} per transaction.`,
          });
        }
      }
    }

    // Month over month category comparison
    if (thisMonthExp.length > 0 && lastMonthExp.length > 0) {
      const thisCats = {}; const lastCats = {};
      thisMonthExp.forEach(e => thisCats[e.category] = (thisCats[e.category] || 0) + e.amount);
      lastMonthExp.forEach(e => lastCats[e.category] = (lastCats[e.category] || 0) + e.amount);
      const biggestIncrease = Object.entries(thisCats)
        .map(([cat, amt]) => ({ cat, amt, change: amt - (lastCats[cat] || 0) }))
        .sort((a, b) => b.change - a.change)[0];
      if (biggestIncrease && biggestIncrease.change > 100) {
        insights.push({
          type: 'warning',
          title: `${biggestIncrease.cat} spending up by ₹${biggestIncrease.change.toFixed(0)}`,
          description: `Your ${biggestIncrease.cat} expenses increased compared to last month.`,
          action: 'View Budget', actionLink: '/budget'
        });
      }
    }

    // Budget forecast
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalBudget = budget?.categories?.reduce((s, c) => s + c.limit, 0) || 0;
    const totalSpent = thisMonthExp.reduce((s, e) => s + e.amount, 0);

    if (totalBudget > 0 && daysElapsed > 3) {
      const dailyRate = totalSpent / daysElapsed;
      const projected = dailyRate * daysInMonth;
      if (projected > totalBudget) {
        insights.push({
          type: 'danger',
          title: `Projected to exceed budget by ₹${(projected - totalBudget).toFixed(0)}`,
          description: `At ₹${dailyRate.toFixed(0)}/day, you'll spend ₹${projected.toFixed(0)} this month — ₹${(projected - totalBudget).toFixed(0)} over your ₹${totalBudget} budget.`,
          action: 'Adjust Budget', actionLink: '/budget'
        });
      } else {
        insights.push({
          type: 'positive',
          title: `On track! Projected to save ₹${(totalBudget - projected).toFixed(0)}`,
          description: `At current pace, you'll spend ₹${projected.toFixed(0)} — ₹${(totalBudget - projected).toFixed(0)} under budget.`,
        });
      }
    }

    // Recurring detection
    const twoMonthsAgo = await Expense.find({
      userId: req.userId,
      date: { $gte: startOf2MonthsAgo, $lte: endOfLastMonth }
    });

    const recurring = [];
    const descCounts = {};
    [...thisMonthExp, ...lastMonthExp, ...twoMonthsAgo].forEach(e => {
      const key = e.description.toLowerCase().trim();
      if (!descCounts[key]) descCounts[key] = { count: 0, amounts: [], category: e.category, description: e.description };
      descCounts[key].count++;
      descCounts[key].amounts.push(e.amount);
    });

    Object.values(descCounts).forEach(d => {
      if (d.count >= 2) {
        const avg = d.amounts.reduce((s, a) => s + a, 0) / d.amounts.length;
        recurring.push({ description: d.description, amount: Math.round(avg), category: d.category, frequency: 'Monthly' });
      }
    });

    if (recurring.length > 0) {
      insights.push({
        type: 'info',
        title: `${recurring.length} recurring expense${recurring.length > 1 ? 's' : ''} detected`,
        description: `Total recurring: ₹${recurring.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}/month. Review if all are necessary.`,
      });
    }

    // Build forecast data
    const forecast = [];
    const dailyRate2 = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    let cumActual = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayExpenses = thisMonthExp.filter(e => new Date(e.date).getDate() === d);
      const dayAmount = dayExpenses.reduce((s, e) => s + e.amount, 0);
      if (d <= daysElapsed) cumActual += dayAmount;
      forecast.push({
        day: d,
        actual: d <= daysElapsed ? cumActual : null,
        projected: d > daysElapsed ? dailyRate2 * d : null,
      });
    }

    res.json({ insights, forecast, recurring, budget: totalBudget });
  } catch (err) { next(err); }
};