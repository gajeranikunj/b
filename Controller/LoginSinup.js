const LoginSingup = require('../modal/LoginSingup')
const Profile = require('../Modal/Profile')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const upload = require('./multer'); // Adjusted path to multer.js

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Change this line
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "naitikkherala47@gmail.com",
        pass: "kdmlvyiwgmhuhcdd",
    },
});
async function main(data) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <naitikkherala47@gmail.com>', // sender address
        to: data.email, // list of receivers
        subject: `Hello ✔ ${data.name} Success fully email send to natik kherala `, // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

exports.Singup = async (req, res) => {
    try {
        upload.single('img')(req, res, async (err) => {
            console.log(req.file);
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: err.message,
                });
            }

            // Check if user exists
            const existingUser = await LoginSingup.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({
                    status: "fail",
                    message: "User already exists with this email",
                });
            }

            // Hash password
            req.body.password = await bcrypt.hash(req.body.password, 10);

            // Create user without image
            const { name, email, password } = req.body;
            const user = await LoginSingup.create({ name, email, password });

            // Create profile with image
            const img = req.file ? "http://localhost:3005/file/" + req.file.filename : null;
            const profileData = {
                name: name,
                email: email,
                img: img,
                userId: user._id
            };
            const profile = await Profile.create(profileData);

            res.status(200).json({
                status: "success",
                message: "Signup and Profile creation successful",
                data: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email
                    },
                    profile
                }
            });
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message,
        });
    }
};

exports.Login = async (req, res) => {
    try {
        // Fetch only the necessary fields (email and password)
        const login = await LoginSingup.findOne({ email: req.body.email }, 'email password');
        if (!login) throw new Error("Invalid email");

        // Use bcrypt.compare with a lower salt rounds if applicable
        const verypassword = await bcrypt.compare(req.body.password, login.password);
        console.log("Password verification result:", verypassword);
        if (!verypassword) throw new Error("Invalid password");

        try {
            //  main(login);
        } catch (err) {
            console.error("Error sending email:", err.message);
            // Optional: Decide if email errors should block the login process
        }

        const token = jwt.sign({ id: login._id }, "surat");
        console.log("Generated Token:", token);

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            data: login,
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

exports.getdata = async (req, res) => {
    try {
        const token = req.headers.authorization;
        console.log("Token value:", token);

        if (!token) throw new Error("Token is required");
        const decoded = jwt.verify(token, "surat");
        

        // Get basic user data without image
        const user = await LoginSingup.findOne({ _id: decoded.id });
        if (!user) throw new Error("Invalid user");

        // Get profile data which includes the image
        const profile = await Profile.findOne({ userId: user._id }).exec();
        if (!profile) throw new Error("Profile not found");

        // Combine user and profile data, using profile's image
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: {
                ...profile.toObject(),
                img: profile.img  // Image comes from profile
            }
        };

        res.status(200).json({
            status: "success",
            message: "Fetched user data successfully",
            data: userData
        });

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.changepassword = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, "surat");
        
        const user = await LoginSingup.findById(decoded.id);
        if (!user) throw new Error("User not found");

        // Verify current password
        const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isValidPassword) throw new Error("Current password is incorrect");

        // Check if new password matches confirm password
        if (req.body.newPassword !== req.body.confirmPassword) {
            throw new Error("New password and confirm password do not match");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
};


