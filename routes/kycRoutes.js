const express = require('express');
const router = express.Router();
const KycController = require('../controllers/kycController')
const authenticateToken = require('../middleware/userAuth');

router.post('/aadhar_otp_kyc',authenticateToken, KycController.AadharOtp)
router.post('/verify_aadhar_otp',authenticateToken, KycController.verifyAadharOtp)
router.post('/verify_pan',authenticateToken, KycController.verifyPan)
router.post('/verify_bank', KycController.verifyBank)

module.exports = router;