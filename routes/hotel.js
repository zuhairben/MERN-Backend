const express = require('express');
const Hotels = require('../model/Hotels'); // Updated import
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

module.exports = router;
