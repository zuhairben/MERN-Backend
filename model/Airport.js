const mongoose = require('mongoose');

const AirportSchema = new mongoose.Schema({
    id: String,
    country: String,
    city: String,
    owner: String,
    is_deleted: Boolean,
    is_active: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updated_time: String,
});

const Airports = mongoose.model('Airport', AirportSchema);

module.exports = Airports;
