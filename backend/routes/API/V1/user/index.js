const express = require('express');
const { createUser,login,verifyOTP,forgotPassword,changeForgotPassword,changePassword} = require('../../../../controllers/user.controller')
const router = express.Router();

router.post('/login', login);
router.post('/register', createUser);
router.post('/verify-otp', verifyOTP);
router.post('/forgotPassword', forgotPassword);
router.post('/change-forgot-password', changeForgotPassword);
router.post('/change-password', changePassword);


module.exports = router;