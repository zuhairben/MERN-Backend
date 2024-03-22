const mongoose = require('mongoose');

const AttractionSchema = new mongoose.Schema({
    name: String,
    city: String,
    state: String,
    type: String,
    country: String,
    description: String,
    phone: String,
    address: String,
    website: String,
    position: Number,
    features: String,
    timeOpen: String,
    priceRange: Number,
    rating: Number,
    numberOfReviews: Number,
    owner: {
        email: String,
        password: String,
        role: String,
        firstname: String,
        lastname: String,
    }
});

const Attraction = mongoose.model('Attraction', AttractionSchema);

module.exports = Attraction;
