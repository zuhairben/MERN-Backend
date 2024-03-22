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
    bookings: [{ passport_id: String }],
    is_deleted: Boolean

});


const Flight = mongoose.model('Flight', FlightSchema);

module.exports = Flight;
