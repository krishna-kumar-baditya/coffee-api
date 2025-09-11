// config/db.js
const mongoose = require('mongoose');

class DbConnection {
    constructor() {
        this._connected = false;
    }

    async connectDb() {
        if (this._connected) {
            console.log('Using existing MongoDB connection.');
            return;
        }

        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error('MONGO_URL is not defined in environment variables.');
        }


        try {
            await mongoose.connect(mongoUrl);
            this._connected = true;
            console.log('MongoDB connected successfully.');

            // Optional event listeners
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this._connected = false;
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err.message);
            });
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error.message);
            process.exit(1); // Exit process with failure
        }
    }
}

module.exports = new DbConnection();