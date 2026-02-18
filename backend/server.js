import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Static folders for upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Routes placeholder
app.get('/', (req, res) => {
    res.json({ message: 'AI Learning Assistant API is running' });
});

app.use(errorHandler);

//404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found',
        statusCode: 404
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
