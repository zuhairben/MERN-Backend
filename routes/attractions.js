const express = require('express');
const Attractions = require('../model/Attraction');
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
    const { name,
      city,
      state,
      type,
      country,
      description,
      phone,
      address,
      website,
      position,
      features,
      timeOpen,
      priceRange,
    } = req.body;
    const user = await Users.findOne({ email: req.user.email });
    console.log(user.role);
    if (user.role != "owner" && user.is_active == true)
      return res.status(401).json({ message: 'Unauthorized Action' });

    rating = 0;
    numberOfReviews = 0;

    const owner = user.email;
    let creation_time = new Date();
    creation_time = creation_time.toISOString().slice(0, 19).replace('T', ' ');
    const is_active = true;
    const is_deleted = false;
    const newAttraction = new Attractions({ name, city, state, type, country, description, phone, address, website, position, features, timeOpen, priceRange, rating, numberOfReviews, owner, creation_time, is_deleted, is_active });
    const savedAttraction = await newAttraction.save();
    res.json(savedAttraction);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/top-rated', async (req, res) => {
  try {
    const topRatedAttractions = await Attractions.find().sort({ rating: -1 }).limit(50);

    if (!topRatedAttractions || topRatedAttractions.length === 0) {
      return res.status(404).json({ message: 'No top-rated Attractions found' });
    }

    res.json(topRatedAttractions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/filter', async (req, res) => {
  try {
    // Get query parameters
    const {
      name,
      continent,
      country,
      city,
      type,
      no_rooms_min,
      no_rooms_max,
      rating_min,
      rating_max,
      price_min,
      price_max,
      facilities,
      days_available,
    } = req.query;

    // Apply filtering logic to your attraction data
    const filteredAttractions = await filterAttractions(
      name,
      continent,
      country,
      city,
      type,
      no_rooms_min,
      no_rooms_max,
      rating_min,
      rating_max,
      price_min,
      price_max,
      facilities,
      days_available
    );

    res.json(filteredAttractions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attractions' });
  }
});

async function filterAttractions(
  name,
  continent,
  country,
  city,
  type,
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

    if (name) {
      filter.name = name;
    }

    if (continent) {
      filter.continent = continent;
    }

    if (country) {
      filter.country = country; // corrected spelling
    }

    if (city) {
      filter.city = city; // corrected spelling
    }

    if (type) {
      filter.type = type;
    }

    if (no_rooms_min && no_rooms_max) {
      filter.position = { $gte: no_rooms_min, $lte: no_rooms_max }; // Assuming position field represents the number of rooms
    } else if (no_rooms_min) {
      filter.position = { $gte: no_rooms_min };
    } else if (no_rooms_max) {
      filter.position = { $lte: no_rooms_max };
    }

    if (rating_min && rating_max) {
      filter.rating = { $gte: rating_min, $lte: rating_max };
    } else if (rating_min) {
      filter.rating = { $gte: rating_min };
    } else if (rating_max) {
      filter.rating = { $lte: rating_max };
    }

    if (price_min && price_max) {
      filter.priceRange = { $gte: price_min, $lte: price_max }; // Assuming priceRange is an array with min and max values
    } else if (price_min) {
      filter.priceRange = { $gte: price_min };
    } else if (price_max) {
      filter.priceRange = { $lte: price_max };
    }

    if (facilities) {
      const facilitiesList = facilities.split(',');
      filter.features = { $in: facilitiesList };
    }

    if (days_available) {
      const availableDates = days_available.split(',').map(date => new Date(date));
      filter.timeOpen = { $in: availableDates }; // Assuming timeOpen represents available dates
    }

    // Find attractions matching the filter criteria
    const filteredAttractions = await Attractions.find(filter);

    return filteredAttractions;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

router.post("/delete", verifyToken, async (req, res) => {
  try {
    const { name, city } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const attraction = await Attractions.findOne({ "name": name, "city": city });
    if (attraction.owner.email != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });

    let deletion_time = new Date();
    deletion_time = deletion_time.toISOString().slice(0, 19).replace('T', ' ');


    await Attractions.updateOne({ "name": name, "city": city }), { is_deleted: true, deleted_by: user.email, deletion_time: deletion_time };
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/update", verifyToken, async (req, res) => {
  try {
    const { name,
      city,
      type,
      description,
      phone,
      address,
      website,
      features,
      timeOpen,
      priceRange,
    } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const attraction = await Attractions.findOne({ "name": name, "city": city });
    if (attraction.owner.email != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });

    const owner = req.user.email


    let updation_time = new Date();
    updation_time = updation_time.toISOString().slice(0, 19).replace('T', ' ');

    await Attractions.updateOne({ "name": name, "city": city }), {
      "type": type,
      "description": description,
      "phone": phone,
      "address": address,
      "website": website,
      "features": features,
      "timeOpen": timeOpen,
      "priceRange": priceRange,
      "updation_time": updation_time,
      "updated_by": owner
    };
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post("/get", async (req, res) => {
  try {
    const { _id } = req.body;

    const attraction = await Attractions.findOne({ _id: _id }).populate("reviews");
    if (!attraction) return res.status(404).json({ message: "Attraction not Found" })


    return res.status(200).json(attraction)
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})



module.exports = router;
