// routes/budget.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/budgetController');
router.get('/', auth, c.getBudget);
router.post('/', auth, c.setBudget);
router.put('/:category', auth, c.updateCategory);
module.exports = router;