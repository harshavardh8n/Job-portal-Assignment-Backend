const jwt = require('jsonwebtoken');
const { User } = require('../db');


const JWT_SECRET ="your_secret_key"; // Use an environment variable for the secret key


const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assume token is sent as Bearer <token>

    if (!token) {
        return res.status(208).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) {
            return res.status(209).json({ message: "User not found" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(error);
        return res.status(209).json({ message: "Invalid token" });
    }
};

module.exports = authenticate;
