const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/expenseController');

router.get('/', auth, c.getExpenses);
router.post('/', auth, c.createExpense);
router.post('/parse-natural', auth, c.parseNatural);
router.put('/:id', auth, c.updateExpense);
router.delete('/:id', auth, c.deleteExpense);

module.exports = router;