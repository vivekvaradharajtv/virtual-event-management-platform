const express = require('express');
const router = express.Router();
const { auth } = require('../validators');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', auth.register, asyncHandler(authController.register));
router.post('/login', auth.login, asyncHandler(authController.login));

module.exports = router;
