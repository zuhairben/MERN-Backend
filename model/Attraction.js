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
    owner: String,
    reviews: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Reviews' }],
    is_deleted: Boolean,
    is_active: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updation_time: String,

});

const Attraction = mongoose.model('Attraction', AttractionSchema);

module.exports = Attraction;
