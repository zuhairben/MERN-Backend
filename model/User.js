const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    firstname: String,
    lastname: String,
    status: String,
    reviews: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Reviews' }],
    is_deleted: Boolean,
    is_active: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updation_time: String,
});

const Users = mongoose.model('Users', UserSchema);

module.exports = Users;