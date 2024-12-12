const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const transactionController = require('../controllers/transactionControlller')
const authenticateToken = require('../middleware/auth');


router.post('/user_login_register', userController.userLogin);
router.post('/verify_otp', userController.verifyOtp);
router.post('/update_user', authenticateToken, userController.updateUser);
router.post('/update_phone_no', authenticateToken,  userController.updatePhoneNumber);
router.post('/get_contests_matchid',  userController.getAllContestByMatchId);
router.post('/get_players_by_matchid',  userController.fetchPlayersByMatch);
router.post('/create_team', authenticateToken, userController.createUserTeam);
router.get('/get_user_teams/:matchId', authenticateToken, userController.getUserTeam);
router.post('/join_contest', authenticateToken, userController.joinContest);
router.post('/create_razorpay_order', userController.createRazorpayOrder);
router.get('/get_matches', userController.getMatches);
router.post('/add_funds_to_wallet', transactionController.addFundsToWallet);
router.post('/withdrawl_request', transactionController.createWithdrawalRequest);
router.get('/transaction_history', transactionController.getTransactionHistory);
router.get('/get_rank_winning/:contestId', userController.getRankAndWinning);
router.get('/get_leaderboard/:contestId', userController.getLeaderboard);

module.exports = router;