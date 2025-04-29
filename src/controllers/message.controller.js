import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
const router = Router();
import * as userMiddleware from "../middlewares/users.middlewares.js";
import postModel from "../models/post.model.js";
import commentModel from "../models/comment.model.js";
import messageModel from "../models/message.model.js";
import { log } from "console";
import userModel from "../models/user.js";


export const getMessageController=async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = verifyToken(token);
    const userId = decoded.id;
    const receiverId = req.params.receiverId;

    const messages = await messageModel.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}