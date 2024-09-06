const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const bycrypt = require('bcrypt')
const jsonwebtoken= require('jsonwebtoken')
const {transporter} = require("../config/nodemailer");
const createUser = async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: bycrypt.hashSync(req.body.password, 10),
      },
      
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


const login = async (req, res) => {

  const { email, password } = req.body
  const userAgent = req.headers["user-agent"];
  const user = await prisma.user.findUnique({
    where: { email: email },
  })

  if (!user) {
    return res.status(401).json({ message: "email atau password salah" })
  }

  const isPasswordMatch = bycrypt.compareSync(password, user.password)

  if (!isPasswordMatch) {
    return res.status(401).json({ message: "email atau password salah" })
  }
  const GeneratedOtp = Math.floor(1000 + Math.random() * 3000);
  const mailOptions = {
    from: "testing@gmail.com",
    to: user.email,
    subject: "OTP Code",
    html: `<p>your OTP code is ${GeneratedOtp}</p>`,
  };



  if (userAgent === user.user_agent) {
		const token = jwt.sign(
      { email: user.email, 
        id_user: user.id 
      },
      process.env.JWT_SECRET, 
      {
         expiresIn: '4h' 
      });
		return res.status(200).json({ message: 'Login Success', token: token });
	} else {
		
		const otp = Math.floor(1000 + Math.random() * 9000);
		
		await prisma.user.update({
			where: {
				email: user.email
			},
			data: {
				otp: otp.toString(),
			}
		});

		// Send OTP to User Email
		transporter.sendMail({
			from: process.env.EMAIL,
			to: user.email,
			subject: 'OTP Verification',
			text: `Your OTP is ${otp}`
		});

		// Return Response
		return res.status(200).json({ 
			message: 'Silahkan Cek Email Anda',
			is_need_otp: true
		 });
	}
 


}

const verifyOTP= async (req, res, next) =>{
	// Get Data User From Request
	const userAgent = req.headers["user-agent"];
	const user_payload = {
		email: req.body.email,
		otp: req.body.otp
	};

	// Find User From Database
	const user = await prisma.user.findUnique({
		where: {
			email: user_payload.email
		}
	});

	// Check if User Not Found
	if (!user) {
		return res.status(400).json({ message: 'User tidak ditemukan' });
	}

	// Check if OTP Not Match
	if (user.otp !== user_payload.otp) {
		return res.status(400).json({ message: 'OTP tidak sama' });
	}

	// Generate Token
	const token = await jwt.sign({ email: user.email, id_user: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

	// Update User to column OTP
	await prisma.user.update({
		where: {
			email: user.email
		},
		data: {
			otp: null,
			user_agent: userAgent
		}
	});

	// Return Response
	return res.status(200).json({ message: 'OTP Verified', token: token });
}



const forgotPassword = async (req, res) =>{

	try{
		const { email} = req.body

		const user = await prisma.user.findUnique({
			where: { email: email },
		  })
		
		if (!user) {
			return res.status(401).json({ message: "user tidak ditemukan" })
		}
		

		const resetToken =  jwt.sign(
			{ email: user.email, id: user.id }, 
			process.env.JWT_SECRET, 
			{ expiresIn: '15m' }
		);

		// console.log(resetToken)
		await prisma.user.update({
			where: {
				email: user.email
			},
			data: {
				resetToken: resetToken,
			}
		});

		transporter.sendMail({
			from: process.env.EMAIL,
			to: user.email,
			subject: 'forgot password',
			text: `click on the link to reset your password http://localhost:3001/reset-password/${resetToken}` //tergantung dari portnya si frontend
		});

		return res.status(200).json({ 
			message: 'Silahkan Cek Email Anda untuk reset password',
			is_need_otp: true
		 });

	}catch (error) {
		res.status(500).json({ error: error.message })
	  }



}

const changePassword= async (req, res) =>{

	
	const {password,email} = req.body;
	
	

	try{
		const user = await prisma.user.findUnique({
			where: { email: email }
		});
		console.log(user)
		if (!user || user.email !== email) {
			return res.status(400).json({ message: "email not found." });
		}
		

		const hashedPassword = await bycrypt.hash(password, 10);

		await prisma.user.update({
			where: { email: user.email },
			data: {
				password: hashedPassword,
				resetToken: null // Clear the reset token after successful password reset
			}
		});


		return res.status(200).json({ message: "Password has been reset successfully." });

	}catch (error){
		console.log("aneh dah")
		res.status(500).json({ error: error.message })
	}


}

const changeForgotPassword = async (req, res) =>{
	const {resettoken } = req.query;
	const {password} = req.body;
	console.log(resettoken)
	console.log("cek reset token")
	const decoded = await jwt.verify(resettoken, process.env.JWT_SECRET);

	try{
		const user = await prisma.user.findUnique({
			where: { email: decoded.email }
		});
		console.log(user)
		if (!user || user.resetToken !== resettoken) {
			return res.status(400).json({ message: "Invalid or expired token." });
		}
		

		const hashedPassword = await bycrypt.hash(password, 10);

		await prisma.user.update({
			where: { email: user.email },
			data: {
				password: hashedPassword,
				resetToken: null // Clear the reset token after successful password reset
			}
		});


		return res.status(200).json({ message: "Password has been reset successfully." });

	}catch (error){
		console.log("aneh dah")
		res.status(500).json({ error: error.message })
	}


}
module.exports = { createUser, login,verifyOTP,forgotPassword,changeForgotPassword ,changePassword};