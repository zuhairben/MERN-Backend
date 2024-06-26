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

    if (user.role != "owner" && user.is_active == true)
      return res.status(401).json({ message: 'Unauthorized Action' });

    const owner = user.email;
    let creation_time = new Date();
    creation_time = creation_time.toISOString().slice(0, 19).replace('T', ' ');
    const is_active = true;
    const newAirport = new Airports({ id, country, city, owner, is_active, creation_time });
    const savedAirport = await newAirport.save();
    res.json(savedAirport);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/get/id', async (req, res) => {
  try {
    const { id } = req.body
    const airport = await Airports.findOne({ "id": id });
    res.json(airport);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/get/all', async (req, res) => {
  try {
    const airports = await Airports.find();
    res.json(airports)
  }

  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post("/delete/id", verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const airport = await Airports.findOne({ "id": id });
    console.log(airport.owner);
    console.log(req.user.email);
    if (!(airport.owner === req.user.email))
      return res.status(401).json({ msg: "Unauthorized Access" });
    let deletion_time = new Date();
    deletion_time = deletion_time.toISOString().slice(0, 19).replace('T', ' ');
    await Airports.updateOne({ "id": id }, { "is_deleted": true, "deleted_by": airport.owner, "deletion_time": deletion_time });
    return res.status(200).json({ "msg": "Deleted" })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post("/update/id", verifyToken, async (req, res) => {
  try {
    const { id, country, city } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const airport = await Airports.findOne({ "id": id });
    if (!(airport.owner === req.user.email)) {
      return res.status(401).json({ msg: "Unauthorized Access" });
    }

    if (city !== undefined) {
      airport.city = city;
    }

    if (country !== undefined) {
      airport.country = country;
    }


    airport.updated_by = req.user.name;
    airport.updated_time = new Date();

    await airport.save();


    res.status(200).json({ msg: "Airport Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
