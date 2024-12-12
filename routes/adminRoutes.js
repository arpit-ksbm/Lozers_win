const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const transactionController = require('../controllers/transactionControlller')
const authenticateToken = require('../middleware/auth');

router.post('/admin_register', adminController.adminRegister);
router.post('/admin_login', adminController.adminLogin);
router.post('/create_contest',authenticateToken, adminController.createContest);
router.put('/edit_contest/:_id', authenticateToken, adminController.editContest);
router.delete('/delete_contest/:_id', authenticateToken,  adminController.deleteContest);
router.get('/get_all_contest', adminController.getAllContest);
router.get('/get_all_users',authenticateToken, adminController.getAllUsers);
router.put('/update_user_status/:_id',authenticateToken, adminController.updateUserStatus);
router.post('/handle_withdrawl_request', transactionController.handleWithdrawalRequest);
router.post('/add_rank_winning', adminController.addRankAndWinningByContestId);

module.exports = router;