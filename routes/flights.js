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

    console.log(user.role);
    console.log(user.email);

    if (user.role != "owner" && user.is_active == true)
      return res.status(401).json({ message: 'Unauthorized Action' });

    const flight_id = plane_id + departure_time;

    const flight = await Flights.findOne({ "flight_id": flight_id });
    if (flight) return res.json({ "msg": "Flight already exists" });
    const formatted_departure_time = new Date("<" + departure_time + ">");
    const formatted_arrival_time = new Date("<" + arrival_time + ">");
    const seats_booked = 0;

    const owner = user.email;
    let creation_time = new Date();
    creation_time = creation_time.toISOString().slice(0, 19).replace('T', ' ');


    const newFlight = new Flights({ flight_id, plane_id, departure_airport, arrival_airport, formatted_departure_time, formatted_arrival_time, seats_total, seats_booked, ticket_price, owner, creation_time });
    const savedFlight = await newFlight.save();
    res.json(savedFlight);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/search/route', async (req, res) => {
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

router.post('/booking', verifyToken, async (req, res) => { //This needs to add Updation time and stuff
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
    res.status(200).json({ "msg": "Booking Successful" })
  }

  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/delete/id", verifyToken, async (req, res) => {
  try {
    const { flight_id } = req.body;


    const flight = await Flights.findOne({ "flight_id": flight_id });

    if (!(flight.owner === req.user.email)) return res.status(401).json({ "error": "Unauthorized Action" });

    let deletion_time = new Date();
    deletion_time = deletion_time.toISOString().slice(0, 19).replace('T', ' ');

    await Flights.updateOne({ "flight_id": flight_id }, { "is_deleted": true, "deleted_by": flight.owner, "deletion_time": deletion_time });
    return res.status(200).json({ "msg": "Deleted" })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/update/id", verifyToken, async (req, res) => {
  try {
    const { flight_id,
      departure_airport,
      arrival_airport,
      seats_total,
      ticket_price } = req.body;


    const flight = await Flights.findOne({ "flight_id": flight_id });

    if (!(flight.owner === req.user.email)) return res.status(401).json({ "error": "Unauthorized Action" });

    let updation_time = new Date();
    updation_time = updation_time.toISOString().slice(0, 19).replace('T', ' ');

    const owner = req.user.email;

    await Flights.updateOne({ "flight_id": flight_id }, {
      "departure_airport": departure_airport,
      "arrival_airport": arrival_airport,
      "seats_total": seats_total,
      "ticket_price": ticket_price,
      "updation_time": updation_time,
      "updated_by": owner
    });
    return res.status(200).json({ "msg": "Deleted" })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
