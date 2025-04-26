import {body} from "express-validator"
import redis from '../services/redis.service.js'
import userModel from '../models/user.js'

export const  registerUserValidation =[
    body('username')
        .isString()
        .withMessage('username must be a string')
        .isLength({min:3,max:15})
        .withMessage('Username must be at least 3 to 15 characters ')
        .custom((value)=>value===value.toLowerCase())
        .withMessage('Username must contain only lowercase letters'),
       
        body('email')
        .isEmail()
        .withMessage('Email must be a valid email address'),
    
        body('password')
        .isString()
        .withMessage('Password must be a string')
        .isLength({min:6})
        .withMessage('Password must be at least 6 characters long'),
    
]

export const loginUserValidation =[
    body('email')
    .isEmail()
    .withMessage('Email must be a valid email address'),

    body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters long')
   ]

export const authUser=async (req,res,next) => {
try{
    const token= req.cookies.token||req.headers.authorization?.split(' ')[1];
    
if(!token){
    return res.status(401).json({msg: 'unauthorized'});
}

const isTokenBlackListed=await redis.get(`blacklist:${token}`);
if(isTokenBlackListed){
    return res.status(401).json({msg: 'unauthorized'});
}

const decoded=userModel.verifyToken(token);
let user=await redis.get(`user:${decoded.id}`)
if(user){
    user=JSON.parse(user);
}

if(!user){
    user=await userModel.findById(decoded.id);
    if(user){
        delete user._doc.password;
        await redis.set(`user:${decoded.id}`,JSON.stringify(user));
    }
   else{
    return res.status(401).json({msg: 'unauthorized'});
   }
}
req.user = user;
req.tokenData={token,...decoded}
return next();
}
catch(err){
    console.error(err);
    return res.status(401).json({msg: 'server error'});
}

}   