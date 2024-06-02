
function verifyToken(req, res, next) {
    const jwt = require('jsonwebtoken');
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
