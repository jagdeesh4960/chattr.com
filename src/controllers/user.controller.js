import { validationResult } from "express-validator";
import * as userServices from '../services/user.service.js';
import redis from "../services/redis.service.js";
import messageModel from "../models/message.model.js";
import postModel from "../models/post.model.js";
import commentModel from "../models/comment.model.js";
import userModel from "../models/user.js";

export const registerUserController=async (req, res) => {
    res.render("register");
}

export const loginUserControllerRender=async  (req, res) => {
    res.render("login");
}

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

export const userProfile=async  (req, res) => {
    res.json({ user: req.user });
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

export const homeController=async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId).populate("followers"); // populate following not followers!
     if (!user) {
      return res.status(404).send("User not found");
    }
    const userRequestsList=await userModel.findById(userId).populate('requests');
    const notifications=userRequestsList.requests;
   
    const followingUsers = user.followers.map((u) => u._id); // get list of following user IDs

    // Fetch posts made by following users (and user's own posts too if you want)
    const posts = await postModel
      .find({
        author: { $in: [...followingUsers] }, // Posts from following + self
      })
      .populate("author") // populate user details inside post
      .sort({ createdAt: -1 }); // latest posts first

    const comments = await commentModel.find();

    const suggestionUsers = await userModel
      .find({
        _id: { $nin: [...followingUsers, userId] },
      })
      .limit(15);

    res.render("home", { user, posts, comments, suggestionUsers,notifications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

export const followerController=async (req, res) => {
  try {
    const userId = req.user._id;
    const token=req.cookies.token;  

    const user = await userModel.findById(userId).populate("followers");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const followingUsers = user.followers;

    const suggestionUsers = await userModel
      .find({
        _id: { $nin: [...followingUsers.map((u) => u._id), userId] },
      })
      .limit(10);

    res.render("your-followers", { followingUsers,userId, suggestionUsers,token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

export const addFollowerController= async (req, res) => {
    try {
      const followUserId = req.params.userId;
      const currentUserId = req.user._id;

      const currentUser = await userModel.findById(currentUserId);
      const followerUser=await userModel.findById(followUserId).populate('requests');
      followerUser.requests.push(currentUserId);
      await followerUser.save();
      
      res.redirect('/home');
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Something went wrong to following user!" });
    }
  }

export const removeFollowerController= async (req, res) => {
  try {
    const followUserId = req.body.followerId;
    const currentUserId = req.user._id;
    const currentUser = await userModel.findById(currentUserId);
    currentUser.followers = currentUser.followers.filter(
      (followerId) => followerId.toString() !== followUserId.toString()
    );
    await currentUser.save();

    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while removing follower!" });
  }
}

export const removeFollowerUserId= async (req, res) => {
    try {
      const followUserId = req.params.userId;
      const currentUserId = req.user._id;
      const currentUser = await userModel.findById(currentUserId);
      // Remove follower
      currentUser.followers = currentUser.followers.filter(
        (followerId) => followerId.toString() !== followUserId.toString()
      );

      await currentUser.save();

      res.redirect("/home");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Something went wrong while removing follower!" });
    }
  }