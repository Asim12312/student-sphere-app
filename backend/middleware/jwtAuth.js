const jwt = require('jsonwebtoken')

const authenticate = (req,res, next)=>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(401).json({error:'Token missing'});
        return;
    }
    try{
        const decoded = jwt.verify(token, "asim123");
        req.user = decoded;
        next();

    }
    catch(error){
        res.status(401).json({error:'Invalid or expired token'});
        return;
    }
}
module.exports = authenticate;