const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    hotel_name: String,
    continent: String,
    contry_name: String,
    city_name: String,
    no_rooms: Number,
    rating: Number,
    price: Number,
    numberOfReviews: Number,
    facilities: String,
    days_available: String,
    owner: String,
    reviews: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Reviews' }],
    is_deleted: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updation_time: String

});

const Hotels = mongoose.model('Hotels', HotelSchema);

module.exports = Hotels;