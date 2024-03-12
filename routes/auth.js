const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../model/Users');
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// copied from stack overflow
        const { email, password } = req.body;

        let user = await Users.findOne({ email });
        if (user) return res.json({ msg: 'User exists' });
        if (email.length<3) return res.json({ msg: 'Email too small' });
        if (!emailRegex.test(email)) return res.json({ msg: 'Invalid email format' });
        if (password.length<8) return res.json({ msg: 'Password too small' });

        await Users.create({ email, password: await bcrypt.hash(password, 5) });

        return res.json({ msg: 'User Created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await Users.findOne({ email })
        if (!user) return res.json({ msg: "User doesn't exist" })

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.json({ msg: "Invalid  password" })

        const token = jwt.sign({
            email,
        }, "Secret123", { expiresIn: "1d" });

        res.json({
            msg: "Logged in", token
        })
        
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
