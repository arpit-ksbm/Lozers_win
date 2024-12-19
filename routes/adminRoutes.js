const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const transactionController = require('../controllers/transactionControlller')
const authenticateAdminToken = require('../middleware/adminAuth');

router.post('/admin_register', adminController.adminRegister);
router.post('/admin_login', adminController.adminLogin);
router.post('/change_password', adminController.changePassword);
router.post('/create_contest',authenticateAdminToken, adminController.createContest);
router.put('/edit_contest/:_id', authenticateAdminToken, adminController.editContest);
router.delete('/delete_contest/:_id', authenticateAdminToken,  adminController.deleteContest);
router.get('/get_all_contest', adminController.getAllContest);
router.get('/get_all_users',authenticateAdminToken, adminController.getAllUsers);
router.put('/update_user_status/:_id',authenticateAdminToken, adminController.updateUserStatus);
router.post('/handle_withdrawl_request', transactionController.handleWithdrawalRequest);
router.get('/get_withdrawl_request', transactionController.getAllWithdrawRequest);
router.get('/get_withdrawl_history', transactionController.getAllWithdrawHistory);
router.post('/add_rank_winning', adminController.addRankAndWinningByContestId);
router.get('/get_dashboard', adminController.adminDashboard);
router.get('/get_points', adminController.getPoints);
router.put('/update_points', adminController.updatePoints)

module.exports = router;