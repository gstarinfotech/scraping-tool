const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {
    sendOtpMail,
    sendWelcomeMail,
    generateOTP,
} = require('../utils/mailer');

const security_key = process.env.SECURITY_KEY;

const otpStore = new Map();
const verifiedEmails = new Map();

const signup = async (req, res) => {
    const { formdata } = req.body;

    try {
        if (
            !formdata?.name ||
            !formdata?.mobile ||
            !formdata?.email ||
            !formdata?.password
        ) {
            return res.status(400).json({
                status: false,
                msg: 'All required fields are missing',
            });
        }

        const email = formdata.email.trim().toLowerCase();

        const existingAdmin = await Admin.findOne({
            email,
        });

        if (existingAdmin) {
            return res.status(409).json({
                status: false,
                msg: 'Email already exist',
            });
        }

        const verification = verifiedEmails.get(email);

        if (!verification || verification.expiresAt < Date.now()) {
            verifiedEmails.delete(email);

            return res.status(400).json({
                status: false,
                msg: 'Please verify your email OTP first',
            });
        }

        const hashpassword = await bcryptjs.hash(
            formdata.password,
            10
        );

        const admin = new Admin({
            name: formdata.name,
            mobile: formdata.mobile,
            email,
            img: formdata?.img || '',
            password: hashpassword,
        });

        const newadmin = await admin.save();

        if (!newadmin) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to create admin',
            });
        }

        verifiedEmails.delete(email);
        otpStore.delete(email);

        await sendWelcomeMail(
            formdata.name,
            email,
            formdata.password,
            'Admin'
        );

        return res.status(200).json({
            status: true,
            msg: 'Admin signup successful',
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, loginType } = req.body;

        if (loginType !== 'admin') {
            return res.status(400).json({
                status: false,
                msg: 'Invalid login type',
            });
        }

        const user = await Admin.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                msg: 'User not found',
            });
        }

        if (await bcryptjs.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email },
                security_key,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                status: true,
                token,
            });
        }

        return res.status(401).json({
            status: false,
            msg: 'Wrong password',
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const sendotp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Email is required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const isexist = await Admin.findOne({
            email: normalizedEmail,
        });

        if (isexist) {
            return res.status(409).json({
                status: false,
                msg: 'Email already exist',
            });
        }

        const otp = generateOTP();

        otpStore.set(normalizedEmail, {
            otp: String(otp),
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        verifiedEmails.delete(normalizedEmail);

        await sendOtpMail(
            normalizedEmail,
            otp,
            'Admin'
        );

        return res.status(200).json({
            status: true,
            msg: 'OTP sent successfully',
        });
    } catch (err) {
        console.error('Error sending OTP:', err);

        return res.status(500).json({
            status: false,
            msg: 'Failed to send OTP',
        });
    }
};

const verifyotp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: false,
                msg: 'Email and OTP are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const storedOtp = otpStore.get(normalizedEmail);

        if (!storedOtp) {
            return res.status(400).json({
                status: false,
                msg: 'OTP not found. Please request a new OTP',
            });
        }

        if (storedOtp.expiresAt < Date.now()) {
            otpStore.delete(normalizedEmail);

            return res.status(400).json({
                status: false,
                msg: 'OTP expired. Please request a new OTP',
            });
        }

        if (
            String(storedOtp.otp) !==
            String(otp).trim()
        ) {
            return res.status(400).json({
                status: false,
                msg: 'Incorrect OTP',
            });
        }

        otpStore.delete(normalizedEmail);

        verifiedEmails.set(normalizedEmail, {
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        return res.status(200).json({
            status: true,
            msg: 'OTP verified successfully',
        });
    } catch (err) {
        console.error('Error verifying OTP:', err);

        return res.status(500).json({
            status: false,
            msg: 'Failed to verify OTP',
        });
    }
};

const getprofile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: false,
                msg: 'Authorization header missing',
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: false,
                msg: 'Token missing from authorization header',
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, security_key);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: false,
                    msg: 'Session expired',
                });
            }

            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: false,
                    msg: 'Invalid token, Please relogin',
                });
            }

            throw err;
        }

        let user = await Admin.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                msg: 'Admin not found',
            });
        }

        user = user.toObject();
        delete user.password;

        return res.status(200).json({
            status: true,
            admin: user,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            msg: 'An unexpected error occurred',
            error: err.message,
        });
    }
};

module.exports = {
    signup,
    login,
    sendotp,
    verifyotp,
    getprofile,
};