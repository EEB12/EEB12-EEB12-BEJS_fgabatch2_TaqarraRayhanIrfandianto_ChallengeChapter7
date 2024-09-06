const nodemailer = require('nodemailer');
require('dotenv').config();

console.log(process.env.PASSWORD)
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
});

module.exports = {
	transporter
};