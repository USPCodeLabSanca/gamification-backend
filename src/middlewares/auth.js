import jwt from 'jsonwebtoken'
import authConfig from '../auth.json'

export default (req, res, next) => {
    let authHeader = req.headers.authorization;
    // checking if token exists
    if (!authHeader)
        return res.status(401).send({error: 'No token provided'});

    // checking if token is well formated
    // jwt format: bearer <hash>
    let parts = authHeader.split(' ');
    if(parts.length != 2)
        return res.status(401).send({error: 'Token error'});

    // splits token in two
    let [ scheme, token ] = parts;

    // checks if token is well formatted
    if (!/^Bearer$/i.test(scheme))
        return res.status(401).send({error: 'Bad token format'});

    // checks if token is valid
    jwt.verify(token, authConfig.secret_key, (err, decoded) => {
        // if an error occurs
        if(err) return res.status(401).send({ error: 'Could not validate token' });
        // else gives the decoded userID
        req.userId = decoded.id
        req.admin = decoded.admin
        return next();
    });
};