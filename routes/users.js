const express = require('express');
const Users = require('../model/User');

const jwt = require('jsonwebtoken');
const Hotels = require('../model/Hotel');
const Attraction = require('../model/Attraction');
const Airports = require('../model/Airport');
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

router.post('/ch_pwd', verifyToken, async (req, res) => {
  try {
    const { email, password, newpassword } = req.body;
    const user = await Users.findOne({ email: req.user.email });
    if (!user) return res.json({ msg: "User doesn't exist" });
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) return res.json({ msg: "Invalid password" });
    await Users.updateOne({ email: req.user.email }, { password: await bcrypt.hash(newpassword, 5), updated_by: req.user.email, updation_time: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    return res.json({ msg: 'Password Changed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/del_acc', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email: req.user.email });
    if (req.user.email === email) {
      if (!user) return res.json({ msg: "User doesn't exist" });
      await Users.updateOne({ email: req.user.email }, { is_deleted: true, deleted_by: req.user.email, deletion_time: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      return res.json({ msg: 'User Deleted' });
    }
    else {
      return res.json({ msg: "Delete not Authorized" })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/inactive', verifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.user.email });
    if (user.role === "admin" && user.is_active == true) {
      const inactive_users = Users.find({ is_active: "false" });
      res.json(inactive_users)
    }
    else {
      res.status(401).json({ error: 'Unauthorized get request' })
    }
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/activate', verifyToken, async (req, res) => {
  try {
    const { email } = req.body
    const user = await Users.findOne({ email: req.user.email });
    if (user.role === "admin" && user.is_active == true) {
      const inactive_users = Users.updateOne({ email: email }, { is_active: "true" });
      return res.status(200).json({ "msg": "User activated" })
    }
    else {
      res.status(401).json({ error: 'Unauthorized get request' })
    }
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/profile', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;

    let user = await Users.findOne({ email: email }).populate("reviews");

    const hotels = await Hotels.find({ owner: email })
    const attractions = await Attraction.find({ owner: email })
    const airports = await Airports.find({ owner: email })

    return res.status(200).json({ "user": user, "hotels": hotels, "attractions": attractions, "airports": airports });
  }



  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post("/get", async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await Users.findOne({ "_id": _id });
    if (!user) return res.status(404).json({ message: "User not Found" });
    console.log(user)

    return res.status(200).json(user)
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})


module.exports = router;

