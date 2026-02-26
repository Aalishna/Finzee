// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);
router.put('/profile', auth, c.updateProfile);
router.put('/password', auth, c.updatePassword);
router.delete('/account', auth, c.deleteAccount);

module.exports = router;
