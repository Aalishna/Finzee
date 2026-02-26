const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/goalController');
router.get('/', auth, c.getGoals);
router.post('/', auth, c.createGoal);
router.put('/:id', auth, c.updateGoal);
router.delete('/:id', auth, c.deleteGoal);
module.exports = router;