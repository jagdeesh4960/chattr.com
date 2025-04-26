import { validationResult } from "express-validator";
import * as userServices from '../services/user.service.js';
import redis from "../services/redis.service.js";
import messageModel from "../models/message.model.js";

export const createUserController=async (req,res)=>{

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

try{

const {username,password, email}=req.body;
const user=await userServices.createUser({username,password,email});
const token=await user.generateToken();
res.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
  res.redirect('/home');

}catch(err){
    console.error(err);
    res.status(500).send(err.message);
 }
}


export const loginUserController=async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }   
  try
   { 
    const {email,password}=req.body;
    
    const user=await userServices.loginUser({email,password});
    const token=await user.generateToken();
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only HTTPS in production
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
    res.redirect('/home');
}
    catch(err){
        console.error(err);
        res.status(500).send(err.message);
    }
}

export const logOutUserController =async (req,res)=>{
    const timeRemainingForToken =req.tokenData.exp*1000-Date.now();
    await redis.set(`blacklist:${req.tokenData.token}`,true,"EX",Math.floor(timeRemainingForToken/1000));
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.redirect('/');
    
}

export const getMessageController=async (req,res)=>{
    try{
        const messages=await messageModel.find({
            $or:[
                {
                    sender:req.user._id,
                    receiver:req.query.userId
                },
                {
                    sender:req.query.userId,
                    receiver:req.user._id
                }
            ]
        })
        res.status(200).json({
            messages,
            messageCount: messages.length,
            message:"message are successfully fecthed"
        });
    
      



}catch(err){
         console.error(err);
        res.status(500).send(err.message);
}}