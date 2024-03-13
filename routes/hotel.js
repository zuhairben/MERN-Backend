const express = require('express');
const Hotels = require('../model/Hotels'); 
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
    const { hotel_name, continent, country_name, city_name, no_rooms, rating, price, review_count, facilities, days_available } = req.body;
    const author = await Users.findOne({ email: req.user.email });
    const newHotel = new Hotels({ hotel_name, continent, country_name, city_name, no_rooms, rating, price, review_count, facilities, days_available, author });
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

module.exports = router;
