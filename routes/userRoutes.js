const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/userRegister', userController.userLogin);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/updateUser', userController.updateUser);
router.post('/updatePhoneNo', userController.updatePhoneNumber);

module.exports = router;