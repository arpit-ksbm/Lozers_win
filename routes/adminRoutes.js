const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')

router.post('/adminRegister', adminController.adminRegister);
router.post('/adminLogin', adminController.adminLogin);

module.exports = router;