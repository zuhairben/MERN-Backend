const mongoose = require('mongoose');

const AirportSchema = new mongoose.Schema({
    id: String,
    ident: String,
    type: String,
    name: String,
    latitude_deg: Number,
    longitude_deg: Number,
    iso_region: String
});

const Airports = mongoose.model('Airport', AirportSchema);

module.exports = Airports;
