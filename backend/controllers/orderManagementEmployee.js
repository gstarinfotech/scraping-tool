const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee2 = require('../models/Employee');
const {
    sendOtpMail,
    sendWelcomeMail,
    generateOTP,
} = require('../utils/mailer');

const security_key = process.env.SECURITY_KEY;
const otpStore = new Map();
const verifiedEmails = new Map();

const signup = async (req, res) => {
    const { formData } = req.body;
    try {
        if (!formData) {
            return res.status(400).json({
                status: false,
                msg: 'Form data is required',
            });
        }

        const email = formData.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Email is required',
            });
        }

        const verification = verifiedEmails.get(email);
        if (!verification || verification < Date.now()) {
            verifiedEmails.delete(email);
            return res.status(403).json({
                status: false,
                msg: 'Please verify your email with OTP first',
            });
        }

        const existingEmployee = await Employee2.findOne({ email });
        if (existingEmployee) {
            verifiedEmails.delete(email);
            return res.status(409).json({
                status: false,
                msg: 'Email already exist',
            });
        }

        const hashpassword = await bcryptjs.hash(
            formData.password,
            10
        );

        const employee = new Employee2({
            name: formData.name,
            mobile: formData.mobile,
            role: formData.role,
            account: formData.role === 'operator'
                ? formData.account
                : '',
            email,
            addedby: formData.addedby,
            password: hashpassword,
            img: formData.img,
        });

        await employee.save();
        await sendWelcomeMail(
            formData.name,
            email,
            formData.password,
            'Employee'
        );

        verifiedEmails.delete(email);
        res.status(200).json({
            status: true,
            msg: 'Employee signed up successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password,
            loginType,
        } = req.body;

        if (loginType !== 'employee') {
            return res.status(400).json({
                status: false,
                msg: 'Invalid login type',
            });
        }

        const user = await Employee2.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: false,
                msg: 'User not found',
            });
        }

        const passwordMatch = await bcryptjs.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.json({
                status: false,
                msg: 'Wrong password',
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
            },
            security_key,
            {
                expiresIn: '24h',
            }
        );

        // Never send password to frontend
        const profile = user.toObject();
        delete profile.password;

        res.status(200).json({
            status: true,
            role: user.role,
            token,
            profile,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const sendotp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Email is required',
            });
        }

        const isexist = await Employee2.findOne({ email });
        if (isexist) {
            return res.status(409).json({
                status: false,
                msg: 'Email already exist',
            });
        }

        // Generate OTP
        const otp = generateOTP();
        otpStore.set(email, {
            otp: String(otp),
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        // Send OTP to email
        await sendOtpMail(
            email,
            otp,
            'Employee'
        );

        res.status(200).json({
            status: true,
            msg: 'OTP sent successfully',
        });

    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({
            status: false,
            msg: 'Failed to send OTP',
        });
    }
};

const verifyotp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const enteredotp = String(req.body.otp || '').trim();

        if (!email) {
            return res.status(400).json({
                status: false,
                msg: 'Email is required',
            });
        }

        if (!enteredotp) {
            return res.status(400).json({
                status: false,
                msg: 'OTP is required',
            });
        }

        const savedOtp = otpStore.get(email);

        if (!savedOtp) {
            return res.status(400).json({
                status: false,
                msg: 'OTP not found. Please request a new OTP',
            });
        }

        // OTP expired
        if (Date.now() > savedOtp.expiresAt) {
            otpStore.delete(email);

            return res.status(400).json({
                status: false,
                msg: 'OTP expired. Please request a new OTP',
            });
        }

        if (savedOtp.otp !== enteredotp) {
            return res.status(400).json({
                status: false,
                msg: 'Incorrect OTP',
            });
        }

        otpStore.delete(email);
        verifiedEmails.set(
            email,
            Date.now() + 10 * 60 * 1000
        );

        res.status(200).json({
            status: true,
            msg: 'OTP verified successfully',
        });

    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({
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
            decoded = jwt.verify(
                token,
                security_key
            );
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

        let user = await Employee2.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                msg: 'Employee not found',
            });
        }

        user = user.toObject();

        delete user.password;

        res.status(200).json({
            status: true,
            employee: user,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: false,
            msg: 'An unexpected error occurred',
            error: err.message,
        });
    }
};

const addsecretkey = async (req, res) => {
    try {
        const { email, key } = req.body;

        const profile = await Employee2.findOneAndUpdate(
            { email },
            {
                $set: {
                    secretkey: key,
                },
            },
            {
                new: true,
            }
        );

        if (profile?._id) {
            res.status(200).json({
                status: true,
                profile,
            });
        } else {
            res.status(404).json({
                status: false,
                msg: 'Employee not found',
            });
        }

    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const addsheetdetails = async (req, res) => {
    try {
        const {
            newsheet,
            id,
        } = req.body;

        if (
            newsheet?.sheetname &&
            typeof newsheet.sheetname === 'string'
        ) {
            const user = await Employee2.findOne({
                _id: id,
            });

            let arraylist = user.sheetlist || [];

            arraylist.push(
                newsheet.sheetname
            );

            arraylist = [
                ...new Set(arraylist),
            ];

            const updateField = {
                [`sheet.${newsheet.sheetname}`]: newsheet,
                sheetlist: arraylist,
            };

            const resp =
                await Employee2.findOneAndUpdate(
                    { _id: id },
                    {
                        $set: updateField,
                    },
                    {
                        new: true,
                    }
                );

            res.status(200).json({
                status: true,
                profile: resp,
            });

        } else {
            res.status(400).json({
                status: false,
                msg: 'sheetname is required',
            });
        }

    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

const addclientid = async (req, res) => {
    try {
        const {
            clientId,
            id,
        } = req.body;

        const resp =
            await Employee2.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        clientid: clientId,
                    },
                },
                {
                    new: true,
                }
            );

        if (resp?._id) {
            res.status(200).json({
                status: true,
                profile: resp,
            });
        } else {
            res.status(404).json({
                status: false,
                msg: 'Employee not found',
            });
        }

    } catch (err) {
        console.error(err);

        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

module.exports = {
    signup,
    login,
    sendotp,
    verifyotp,
    getprofile,
    addsecretkey,
    addsheetdetails,
    addclientid,
};