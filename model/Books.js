const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: String,
    content : String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
});

const Books = mongoose.model('Books', BookSchema);

module.exports = Books;