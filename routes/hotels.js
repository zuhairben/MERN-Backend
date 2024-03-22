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
    const { hotel_name, continent, country_name, city_name, no_rooms, rating, price, review_count, facilities, days_available } = req.body;
    const user = await Users.findOne({ email: req.user.email });

    if (user.role != "owner")
    return res.status(401).json({ message: 'Unauthorized Action' });
 
    const newHotel = new Hotels({ hotel_name, continent, country_name, city_name, no_rooms, rating, price, review_count, facilities, days_available, user });
    const savedHotel = await newHotel.save();
    res.json(savedHotel);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
      const topRatedHotels = await Hotels.find().sort({ rating: -1 }).limit(50);

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

router.get('/filter', async (req, res) => {
  try {
    // Get query parameters
    const {
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
  try{
    const {hotel_name, city_name} = req.body;
    const user = await Users.findOne({"email": req.user.email});
    const hotel = await Hotel.findOne({"hotel_name": hotel_name, "city_name": city_name});
    if (hotel.owner.email != user.email) 
      return res.status(401).json({msg:"Unauthorized Access"});
    await Hotel.deleteOne({"hotel_name": hotel_name, "city_name": city_name});
  }
  catch (error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
