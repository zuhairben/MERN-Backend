const express = require('express');
const Hotels = require('../model/Hotel');
const Users = require('../model/User');

const jwt = require('jsonwebtoken');
const router = express.Router();

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

router.use(express.json());

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { hotel_name, continent, country_name, city_name, no_rooms, price, facilities, days_available } = req.body;
    const user = await Users.findOne({ email: req.user.email });

    const hotel = await Hotels.findOne({ "hotel_name": hotel_name, "city_name": city_name });
    if (hotel) return res.json({ "msg": "Hotel already exists" });

    if (user.role != "owner" && user.is_active == true)
      return res.status(401).json({ message: 'Unauthorized Action' });

    const owner = req.user.email;
    let creation_time = new Date();
    creation_time = creation_time.toISOString().slice(0, 19).replace('T', ' ');
    const is_active = true;

    rating = 0;
    numberOfReviews = 0;

    is_deleted = false;

    const newHotel = new Hotels({ hotel_name, continent, country_name, city_name, no_rooms, rating, price, numberOfReviews, facilities, days_available, owner, is_deleted, creation_time });
    const savedHotel = await newHotel.save();
    res.json(savedHotel);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/toprated', async (req, res) => {
  try {
    const topRatedHotels = await Hotels.find({ "is_deleted": false }).sort({ rating: -1 }).limit(50);

    if (!topRatedHotels || topRatedHotels.length === 0) {
      return res.status(404).json({ message: 'No top-rated hotels found' });
    }

    res.json(topRatedHotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get Hotels by filters
router.post('/filter', async (req, res) => {
  try {
    // Get query parameters
    const {
      hotel_name,
      continent,
      country_name,
      city_name,
      no_rooms_min,
      no_rooms_max,
      rating_min,
      rating_max,
      price_min,
      price_max,
      facilities,
      days_available,
    } = req.query;

    // Apply filtering logic to your hotel data (using your preferred model or database)
    const filteredHotels = await filterHotels(
      hotel_name,
      continent,
      country_name,
      city_name,
      no_rooms_min,
      no_rooms_max,
      rating_min,
      rating_max,
      price_min,
      price_max,
      facilities,
      days_available
    );


    res.json(filteredHotels);
  } catch (error) {
    console.log("error in route")
    console.error(error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
});


async function filterHotels(
  hotel_name,
  continent,
  country_name,
  city_name,
  no_rooms_min,
  no_rooms_max,
  rating_min,
  rating_max,
  price_min,
  price_max,
  facilities,
  days_available
) {
  try {

    // Build filter query object based on provided parameters
    const filter = {};

    if (hotel_name) {
      filter.hotel_name = hotel_name;
    }

    if (continent) {
      filter.continent = continent;
    }

    if (country_name) {
      filter.contry_name = country_name;
    }

    if (city_name) {
      filter.city_name = city_name;
    }

    if (no_rooms_min && no_rooms_max) {
      // Ensure no_rooms_min <= no_rooms_max
      filter.no_rooms = { $gte: no_rooms_min, $lte: no_rooms_max };
    } else if (no_rooms_min) {
      filter.no_rooms = { $gte: no_rooms_min };
    } else if (no_rooms_max) {
      filter.no_rooms = { $lte: no_rooms_max };
    }

    if (rating_min && rating_max) {
      // Ensure rating_min <= rating_max
      filter.rating = { $gte: rating_min, $lte: rating_max };
    } else if (rating_min) {
      filter.rating = { $gte: rating_min };
    } else if (rating_max) {
      filter.rating = { $lte: rating_max };
    }

    if (price_min && price_max) {
      // Ensure price_min <= price_max
      filter.price = { $gte: price_min, $lte: price_max };
    } else if (price_min) {
      filter.price = { $gte: price_min };
    } else if (price_max) {
      filter.price = { $lte: price_max };
    }

    if (facilities) {
      const facilitiesList = facilities.split(',');
      filter.facilities = { $in: facilitiesList };
    }

    if (days_available) {
      const availableDates = days_available.split(',').map(date => new Date(date));
      filter.days_available = { $in: availableDates };
    }

    filter.is_deleted = false

    console.log(filter)

    // Find hotels matching the filter criteria
    const filteredHotels = Hotels.find(filter);



    return filteredHotels
  } catch (error) {
    console.log("error in function")
    throw error; // Re-throw to be caught in the API endpoint
  }
}


router.post("/delete", verifyToken, async (req, res) => {
  try {
    const { hotel_name, city_name } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const hotel = await Hotels.findOne({ "hotel_name": hotel_name, "city_name": city_name });
    console.log("user: " + user.email + "\n" + "owner: " + hotel.owner);
    if (hotel.owner != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });

    let deletion_time = new Date();
    deletion_time = deletion_time.toISOString().slice(0, 19).replace('T', ' ');

    const updateResult = await Hotels.updateOne({ "hotel_name": hotel_name, "city_name": city_name }, { "is_deleted": true, "deleted_by": hotel.owner, "deletion_time": deletion_time });

    if (updateResult.modifiedCount === 1) {
      // Update successful, send response
      res.status(200).json({ msg: "Hotel deleted successfully" });
    } else {
      // Update failed, send error
      res.status(400).json({ msg: "Failed to delete hotel" });
    }

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/update", verifyToken, async (req, res) => {
  try {
    const { hotel_name, continent, country_name, city_name, no_rooms, rating, price, review_count, facilities, days_available } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const hotel = await Hotels.findOne({ "hotel_name": hotel_name, "city_name": city_name });
    console.log("user: " + user.email + "\n" + "owner: " + hotel.owner);
    if (hotel.owner != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });

    let updation_time = new Date();
    updation_time = updation_time.toISOString().slice(0, 19).replace('T', ' ');

    const owner = user.email;

    const updateResult = await Hotels.updateOne(
      { "hotel_name": hotel_name, "city_name": city_name }, // search criteria
      {
        "hotel_name": hotel_name,
        "continent": continent,
        "country_name": country_name,
        "city_name": city_name,
        "no_rooms": no_rooms,
        "rating": rating,
        "price": price,
        "review_count": review_count,
        "facilities": facilities,
        "days_available": days_available,
        "updated_by": owner,
        "updation_time": updation_time

      });

    if (updateResult.modifiedCount === 1) {
      // Update successful, send response
      res.status(200).json({ msg: "Hotel deleted successfully" });
    } else {
      // Update failed, send error
      res.status(400).json({ msg: "Failed to delete hotel" });
    }

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/get", async (req, res) => {
  try {
    const { _id } = req.body;
    console.log("reac")
    const hotel = await Hotels.findOne({ "_id": _id }).populate({path: "reviews", populate: {path: "reviews.owner"}});
    if (!hotel) return res.status(404).json({ message: "Hotel not Found" });
    console.log(hotel.reviews[0].owner.email)

    return res.status(200).json(hotel)
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})


module.exports = router;
