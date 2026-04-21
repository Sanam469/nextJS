import mongoose from 'mongoose';

export async function connect() {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log('Using existing MongoDB connection');
            return;
        }

        console.log('Attempting to connect to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        await mongoose.connect(process.env.MONGO_URI);
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        connection.on('error', (err) => {
            console.error('MongoDB connection error: ', err);
            // In serverless, we don't want to exit the process
        })

    } catch (error) {
        console.error('CRITICAL: MongoDB connection failed!');
        console.error(error);
        throw error; 
    }
}