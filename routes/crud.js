const express = require('express');
const Books = require('../model/Books');
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
      return decoded;

  });
}

router.use(express.json());

router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title , content } = req.body;
        const author = await Users.findOne({email:req.user.email});
        const newBook = new Books({ title, content, author});
        const savedBook = await newBook.save();
        res.json(savedBook);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/read', verifyToken, async (req, res) => {
    try {
        const books = await Books.findOne({title:req.body.title});
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/update', verifyToken, async (req, res) => {
    try {
        const { title, newContent } = req.body;
        if (!title || !newContent) return res.status(400).json({ error: 'Title and Content are required' });
    
        const updatedBook = await Books.findOneAndUpdate({ title }, { content: newContent }, {
            new: true,
        });

        if (!updatedBook) {
            return res.status(404).json({ error: ' Book not found' });
        }

        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/delete', verifyToken, async (req, res) => {
    try {
        const deletedBook = await Books.findOneAndDelete({title:req.body.title});
        res.json(deletedBook);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/userinfo', verifyToken, async (req, res) => {
    try {
        const books = await Books.findOne({title:req.body.title}).populate("author");
        res.json(books);    

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
