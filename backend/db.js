const mongoose = require('mongoose');
const connectDB = () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('MONGODB_URI is not set in .env — skipping DB connection.');
        return;
    }

    mongoose
        .connect(uri)
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err.message);
        });
};

module.exports = connectDB;
