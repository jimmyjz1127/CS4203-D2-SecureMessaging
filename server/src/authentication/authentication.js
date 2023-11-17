const jwt = require("jsonwebtoken");
require('dotenv').config();


const authenticateToken = (req, res, next) => { 
    const {access_token, refresh_token} = req.cookies;

    if (access_token == null){
        return res.status(401).json({error:"NULL TOKEN"})
    } else {//verify token was created using our secret 
        jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
            if (error){
                return res.status(403).json({error:error.message});
            }
            req.user = user;
            next();
        })
    }
}

module.exports = {authenticateToken};