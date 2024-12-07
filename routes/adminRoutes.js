const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')

router.post('/admin_register', adminController.adminRegister);
router.post('/admin_login', adminController.adminLogin);
router.post('/create_contest', adminController.createContest);
router.put('/edit_contest/:_id', adminController.editContest);
router.delete('/delete_contest/:_id', adminController.deleteContest);
router.get('/get_all_contest', adminController.getAllContest);
router.get('/get_all_users', adminController.getAllUsers);

module.exports = router;