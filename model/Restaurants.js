const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    restaurant_name: String,
    continent : String,
    country_name: String,
    city_name: String,
    cuisines: String,
    rating: Number,
    review_count: Number,
    excellent_count: Number,
    very_good_count: Number,
    average_count: Number,
    poor_count: Number,
    terrible_count: Number

});

const Books = mongoose.model('Restaurants', RestaurantSchema);

module.exports = Books;