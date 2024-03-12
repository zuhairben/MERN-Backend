const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    hotel_name: String,
    continent : String,
    contry_name: String,
    city_name: String,
    no_rooms: Number,
    rating: Number,
    price: Number,
    review_count: Number,
    facilities: String,
    days_available: [Date]

});

const Books = mongoose.model('Hotels', HotelSchema);

module.exports = Books;