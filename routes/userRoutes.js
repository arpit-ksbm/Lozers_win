const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const authenticateToken = require('../middleware/auth');

router.post('/user_login_register', userController.userLogin);
router.post('/verify_otp', userController.verifyOtp);
router.post('/update_user', authenticateToken, userController.updateUser);
router.post('/update_phone_no', authenticateToken,  userController.updatePhoneNumber);
router.post('/create_razorpay_order', userController.createRazorpayOrder);

module.exports = router;