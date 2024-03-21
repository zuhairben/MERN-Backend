const express = require('express');
const Restaurants = require('../model/Restaurants'); 
const Users = require('../model/Users'); 

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
    const { restaurant_name, continent, country_name, city_name, cuisines, rating, review_count } = req.body; // Capture additional details if needed
    const author = await Users.findOne({ email: req.user.email }); // Get user if applicable

    const newRestaurant = new Restaurants({ restaurant_name, continent, country_name, city_name, cuisines, rating, review_count, author });

    const savedRestaurant = await newRestaurant.save();
    res.json(savedRestaurant);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    const topRatedRestaurants = await Restaurants.find().sort({ rating: -1 }).limit(50);

    if (!topRatedRestaurants || topRatedRestaurants.length === 0) {
      return res.status(404).json({ message: 'No top-rated restaurants found' });
    }

    res.json(topRatedRestaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const {
      restaurant_name,
      continent,
      country_name,
      city_name,
      cuisines,
      min_rating,
      max_rating 
    } = req.query;

    const filter = {};

    if (restaurant_name) {
      filter.restaurant_name = { $regex: restaurant_name, $options: 'i' }; // Case-insensitive search
    }

    if (continent) {
      filter.continent = continent;
    }

    if (country_name) {
      filter.country_name = country_name;
    }

    if (city_name) {
      filter.city_name = city_name;
    }

    if (cuisines) {
      filter.cuisines = cuisines; // Assuming cuisines is an array
    }

    if (min_rating && max_rating) {
      filter.rating = { $gte: min_rating, $lte: max_rating }; // Filter between min and max rating
    }

    const filteredRestaurants = await Restaurants.find(filter).limit(10);

    res.json(filteredRestaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
});

module.exports = router;