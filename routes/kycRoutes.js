const express = require('express');
const router = express.Router();
const KycController = require('../controllers/kycController')

router.post('/aadhar_otp_kyc', KycController.AadharOtp)
router.post('/verify_aadhar_otp', KycController.verifyAadharOtp)
router.post('/verify_pan', KycController.verifyPan)
router.post('/verify_bank', KycController.verifyBank)

module.exports = router;