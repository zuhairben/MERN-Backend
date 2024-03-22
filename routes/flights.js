const express = require('express');
const Flights = require('../model/Flight');
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
    const { plane_id,
      departure_airport,
      arrival_airport,
      departure_time,
      arrival_time,
      seats_total,
      ticket_price
    } = req.body;
    const user = await Users.findOne({ email: req.user.email });

    if (user.role != "owner")
      return res.status(401).json({ message: 'Unauthorized Action' });

    const flight_id = plane_id + departure_time;

    const flight = await Flights.findOne({ "flight_id": flight_id });
    if (flight) return res.json({ "msg": "Flight already exists" });
    const formatted_departure_time = new Date("<" + departure_time + ">");
    const formatted_arrival_time = new Date("<" + arrival_time + ">");
    const seats_booked = 0;

    const newFlight = new Flights({ flight_id, plane_id, departure_airport, arrival_airport, formatted_departure_time, formatted_arrival_time, seats_total, seats_booked, ticket_price, user });
    const savedFlight = await newFlight.save();
    res.json(savedFlight);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/search/route', async (req, res) => {
  try {
    const { departure_airport, arrival_airport } = req.body;
    const EnrouteFlights = await Flights.find({ "departure_airport": departure_airport, "arrival_airport": arrival_airport }).sort({ departure_time: 1 });

    res.json(EnrouteFlights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/search/id', async (req, res) => {
  try {
    const { flight_id } = req.body;
    const flight = await Flights.find({ "flight_id": flight_id });

    res.json(flight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/booking', verifyToken, async (req, res) => {
  try {

    const { flight_id, passport_id } = req.body;
    const flight = await Flights.findOne({ "flight_id": flight_id });

    if (!flight)
      return res.status(404).json({ message: 'Flight not found' });

    console.log("booked ", flight.seats_booked);
    console.log("total ", flight.seats_total);

    if (flight.seats_booked === flight.seats_total)
      return res.status(404).json({ message: 'Flight Full' });
    const new_booked = flight.seats_booked + 1
    await Flights.findOneAndUpdate({ "flight_id": flight_id }, { $set: { "seats_booked": new_booked }, $push: { "bookings": { "passport_id": passport_id } } })
  }

  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/deleteByID", verifyToken, async (req, res) => {
  try {
    const { flight_id } = req.body;
    const user = await Users.findOne({ "email": req.user.email });
    const flight = await Flights.findOne({ "flight_id": flight_id });
    if (flight.owner.email != user.email)
      return res.status(401).json({ msg: "Unauthorized Access" });
    await Flights.deleteOne({ "flight_id": flight_id });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
