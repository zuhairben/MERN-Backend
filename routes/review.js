const express = require('express');
const Attractions = require('../model/Attraction');
const Users = require('../model/User');
const Hotels = require('../model/Hotel');
const Reviews = require('../model/Review')
const mongoose = require('mongoose');
// const { verifyToken } = require('../verifyToken');


// const { CheckReviewExists } = require('./helperFunctions');
const router = express.Router();

router.use(express.json());

async function CheckReviewExists(email, _id) {

    console.log("email: " + email + "\n" + "id: " + _id);

    const review_exists = await Users.aggregate([
        {
            $match: { email: email },
        },
        {
            $lookup: {
                from: "Reviews",
                localField: "reviews",
                foreignField: "_id",
                as: "reviews",
            },
        },
        {
            $match: { "reviews._id": _id },
        },
    ]);

    return review_exists.length != 0;


}

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    const [bearer, token] = authorizationHeader.split(' ');

    if (!token) {
        return res.status(403).json({ error: 'Unauthorized: Token not provided' });
    }

    jwt.verify(token, 'Secret123', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

router.post('/post', verifyToken, async (req, res) => {  // Added semicolon here
    try {
        const { _id, rating, description, type } = req.body;

        if (rating > 5 || rating < 0) return res.status(422).json({ message: "Invalid rating" })

        const user = await Users.findOne({ email: req.user.email }).populate("reviews");

        let place;

        if (await CheckReviewExists(user.email, _id)) {
            return res.status(409).json({ msg: "Review Already Exists" })
        }
        // Add new review entry
        let creation_time = new Date();
        creation_time = creation_time.toISOString().slice(0, 19).replace('T', ' ');


        const review = new Reviews({
            rating: rating,
            description: description,
            type: type,
            place: _id,
            owner: user._id,
            creation_time: creation_time
        });


        await review.save();



        // Update review values inside the Hotel/Attraction
        if (type === "Hotel")
            place = await Hotels.findOne({ "_id": _id });
        else place = await Attractions.findOne({ "_id": _id });

        console.log("old rating = " + place.rating)
        console.log("new rating value = " + rating)

        if (isNaN(place.rating)) {
            place.rating = rating;
            place.numberOfReviews = 1;
        }
        else {
            place.rating = ((place.rating * place.numberOfReviews) + rating) / (place.numberOfReviews + 1)
            place.numberOfReviews += 1;
        }
        place.reviews.push(review._id);
        await place.save();

        // Add review entry into User's profile
        user.reviews.push(review._id);
        await user.save();



        return res.status(200).json({ msg: "Review Successfully Created", review });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/update", verifyToken, async (req, res) => {
    try {
        const { _id, rating, description } = req.body;

        const review = await Reviews.findOne({ "_id": _id }).populate("owner");

        if (!review) return res.status(404).json({ message: "Review not found" })

        // check if updater is owner of original review
        if ((req.user.role === "owner" || req.user.role === "user")
            && review.owner.email != req.user.email
        )
            return res.status(401).json({ message: "Unauthorized Action" });

        // Update rating
        let place

        console.log("type: " + review.type);

        if (review.type === "Hotel")
            place = await Hotels.findOne({ "_id": review.place })
        else
            place = await Attractions.findOne({ "_id": review.place })


        console.log("place: " + place + "\n" + "place id: " + review.place);
        if (!place) return res.status(404).json({ message: "Place not found" })


        place.rating = ((place.rating * place.numberOfReviews) - place.rating + rating) / place.numberOfReviews;
        await place.save();


        // Update review
        review.rating = rating;
        review.description = description;
        review.updated_by = req.user.email;

        let updation_time = new Date();
        updation_time = updation_time.toISOString().slice(0, 19).replace('T', ' ');

        review.updation_time = updation_time;

        await review.save();

        return res.status(200).json({ message: "Review Successfully Updated", review })

    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/delete", verifyToken, async (req, res) => {
    try {
        const { _id } = req.body;

        const review = await Reviews.findOne({ "_id": _id }).populate("owner");
        if (!review) return res.status(404).json({ message: "Review not found" })



        // check if updater is owner of original review
        if ((req.user.role === "owner" || req.user.role === "user")
            && review.owner.email != req.user.email
        )
            return res.status(401).json({ message: "Unauthorized Action" });


        // Update Rating in place
        let place

        if (review.type === "Hotel")
            place = await Hotels.findOne({ "_id": review.place })
        else
            place = await Attractions.findOne({ "_id": review.place })


        console.log("place: " + place);

        if (!place) return response.status(404).json({ message: "Place not found" })


        place.rating = ((place.rating * place.numberOfReviews) - review.rating) / (place.numberOfReviews - 1);
        place.numberOfReviews -= 1;

        place.reviews.pull(review._id)

        await place.save();



        // Delete Review
        review.deleted_by = req.user.email;
        review.is_deleted = true;

        let deletion_time = new Date();
        deletion_time = deletion_time.toISOString().slice(0, 19).replace('T', ' ');
        review.deletion_time = deletion_time;

        await review.save();


        return res.status(200).json({ message: "Review Successfully Soft Deleted", review })
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});



module.exports = router;