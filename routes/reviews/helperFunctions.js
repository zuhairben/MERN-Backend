const Users = require('../../model/User')
const Reviews = require('../../model/Review')

async function CheckReviewExists(email, _id) {

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
            $match: { "reviews._id": mongoose.Types.ObjectId(_id) },
        },
    ]);

    if (review_exists.length === 0) return false;
    return true;

}

