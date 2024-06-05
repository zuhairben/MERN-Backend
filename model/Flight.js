const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flight_id: String,
    plane_id: String,
    departure_airport: String,
    arrival_airport: String,
    Departure_time: Date,
    Arrival_time: Date,
    seats_total: Number,
    seats_booked: Number,
    ticket_price: Number,
    owner: String,
    bookings: [{ passport_id: String, user_email: String }],
    is_deleted: Boolean,
    is_active: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updation_time: String,


});


const Flight = mongoose.model('Flight', FlightSchema);

module.exports = Flight;