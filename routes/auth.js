const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../model/User');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.OAuth);
const axios = require('axios');
require("dotenv").config();
CLIENT_ID = process.env.OAuth;

router.post('/signup', async (req, res) => {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // copied from stack overflow
        const { email, password, firstname, lastname, role } = req.body;
        let user = await Users.findOne({ email });
        if (user) return res.json({ msg: 'User exists' });
        if (email.length < 3) return res.json({ msg: 'Email too small' });
        if (!emailRegex.test(email)) return res.json({ msg: 'Invalid email format' });
        if (password.length < 8) return res.json({ msg: 'Password too small' });
        if (!(role === "owner") && !(role === "user")) return res.json({ msg: "Invalid user role" });

        await Users.create({ email, password: await bcrypt.hash(password, 5), role, firstname, lastname, });

        return res.json({ msg: 'User Created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email });
        if (!user) return res.json({ msg: "User doesn't exist" });

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.json({ msg: "Invalid password" });
        console.log("user role = ", user.role);
        const tokenPayload = {
            email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname
        };

        const token = jwt.sign(tokenPayload, "Secret123", { expiresIn: "1d" });

        res.json({
            msg: "Logged in",
            token,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/google-login', async (req, res) => {
    try {
        const { tokenId } = req.body;
        const response = await client.verifyIdToken({ idToken: tokenId, audience: CLIENT_ID });
        const { email_verified, email, given_name, family_name } = response.payload;

        if (email_verified) {
            const user = await Users.findOne({ email });
            if (user) {
                const tokenPayload = {
                    email,
                    role: user.role,
                    firstname: given_name || '', // Use given_name from Google Auth, or an empty string if not provided
                    lastname: family_name || '' // Use family_name from Google Auth, or an empty string if not provided
                };

                const token = jwt.sign(tokenPayload, "Secret123", { expiresIn: "1d" });
                return res.json({ msg: "Logged in", token });
            } else {
                await Users.create({ email });
                const tokenPayload = {
                    email,
                    role: 'User', // Default role for new users
                    firstname: given_name || '', // Use given_name from Google Auth, or an empty string if not provided
                    lastname: family_name || '' // Use family_name from Google Auth, or an empty string if not provided
                };

                const token = jwt.sign(tokenPayload, "Secret123", { expiresIn: "1d" });
                return res.json({ msg: "User registered and logged in", token });
            }
        } else {
            return res.json({ msg: "Email not verified" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/facebook-login', async (req, res) => {
    try {
        const { accessToken, userID } = req.body;
        const response = await axios.get(`https://graph.facebook.com/v13.0/${userID}?fields=id,email,first_name,last_name&access_token=${accessToken}`);

        const { id, email, first_name, last_name } = response.data;

        if (id) {
            const user = await Users.findOne({ email });
            if (user) {
                const tokenPayload = {
                    email,
                    role: user.role,
                    firstname: first_name || '', // Use first_name from Facebook Auth, or an empty string if not provided
                    lastname: last_name || '' // Use last_name from Facebook Auth, or an empty string if not provided
                };

                const token = jwt.sign(tokenPayload, "Secret123", { expiresIn: "1d" });
                return res.json({ msg: "Logged in", token });
            } else {
                await Users.create({ email });
                const tokenPayload = {
                    email,
                    role: 'User', // Default role for new users
                    firstname: first_name || '', // Use first_name from Facebook Auth, or an empty string if not provided
                    lastname: last_name || '' // Use last_name from Facebook Auth, or an empty string if not provided
                };

                const token = jwt.sign(tokenPayload, "Secret123", { expiresIn: "1d" });
                return res.json({ msg: "User registered and logged in", token });
            }
        } else {
            return res.json({ msg: "Invalid access token or user ID" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
