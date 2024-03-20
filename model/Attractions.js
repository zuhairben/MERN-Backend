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
    features: [String],
    timeOpen: [Date],
    priceRange: [number],
    rating: Number,
    numberOfReviews: Number
});

const Attraction = mongoose.model('Attraction', AttractionSchema);

module.exports = Attraction;
