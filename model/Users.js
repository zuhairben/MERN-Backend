const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    firstname: String,
    lastname: String,
});

const Users = mongoose.model('Users', UserSchema);

module.exports = Users;