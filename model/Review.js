const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: Number,
    description: String,
    model_type: { type: String, enum: ['Hotel', 'Attraction'], required: true },
    place: { type: mongoose.SchemaTypes.ObjectId, refPath: 'model_type' },
    owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    is_deleted: Boolean,
    deleted_by: String,
    deletion_time: String,
    creation_time: String,
    updated_by: String,
    updation_time: String
});

const Reviews = mongoose.model('Reviews', ReviewSchema);

module.exports = Reviews;