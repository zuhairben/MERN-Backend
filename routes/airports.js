const express = require('express');
const Airports = require('../model/Airport');
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
    const { id, country, city } = req.body;
    const user = await Users.findOne({ email: req.user.email });

    if (user.role != "owner")
      return res.status(401).json({ message: 'Unauthorized Action' });

    const owner = user.email;

    const newAirport = new Airports({ id, country, city, owner });
    const savedAirport = await newAirport.save();
    res.json(savedAirport);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getByID', async (req, res) => {
  try {
    const { id } = req.body
    const airport = Airports.findOne({ "id": id });
    res.json(airport);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/deleteByID", verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const airport = await Airports.findOne({ "id": id });
    if (airport.owner.email != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });
    await Airports.deleteOne({ "id": id });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
