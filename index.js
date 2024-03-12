const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/crud'); 
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const dburl = process.env.MONGODB_URI || process.env.password;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function connectToDatabase() {
    try {
        await mongoose.connect(dburl);
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

connectToDatabase();

app.use('/auth', authRouter);
app.use('/books', booksRouter);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
