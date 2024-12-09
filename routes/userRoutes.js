const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const authenticateToken = require('../middleware/auth');

router.post('/user_login_register', userController.userLogin);
router.post('/verify_otp', userController.verifyOtp);
router.post('/update_user', authenticateToken, userController.updateUser);
router.post('/update_phone_no', authenticateToken,  userController.updatePhoneNumber);
router.post('/get_contests_matchid',  userController.getAllContestByMatchId);
router.post('/get_players_by_matchid',  userController.fetchPlayersByMatch);
router.post('/create_team',  userController.createUserTeam);
router.post('/join_contest',  userController.joinContest);
router.post('/create_razorpay_order', userController.createRazorpayOrder);

module.exports = router;