import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
const router = Router();
import * as userMiddleware from "../middlewares/users.middlewares.js";
import postModel from "../models/post.model.js";
import commentModel from "../models/comment.model.js";
import messageModel from "../models/message.model.js";
import { log } from "console";
import userModel from "../models/user.js";

router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/", (req, res) => {
  res.render("login");
});

router.get(
  "/add-follower/:userId",
  userMiddleware.authUser,
  async (req, res) => {
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
);

router.post("/remove-follower", userMiddleware.authUser, async (req, res) => {
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
});
router.get(
  "/remove-follower/:userId",
  userMiddleware.authUser,
  async (req, res) => {
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
);

router.get(
  "/logout",
  userMiddleware.authUser,
  userController.logOutUserController
)
router.get('/notifications',userMiddleware.authUser,
 async (req,res)=>{
    try {
      const followUserId = req.params.userId;
      const currentUserId = req.user._id;
      const followUser=await userModel.findById(followUserId);
      const currentUser = await userModel.findById(currentUserId).populate('requests');
      const AcceptedReq = await userModel.findById(currentUserId).populate('AcceptedReq');
      const RejectedReq = await userModel.findById(currentUserId).populate('RejectedReq');
     
      const notifications=currentUser.requests;
      const acceptedRequests=AcceptedReq.AcceptedReq; 
      const rejectedRequests=RejectedReq.RejectedReq; 

      res.render('notifications',{notifications,acceptedRequests,rejectedRequests})

    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Something went wrong to notifications !" });
    }
 
  }
)
router.get('/accept-notification/:senderId', userMiddleware.authUser, async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const currentUserId = req.user._id;

    // Find sender and receiver
    const sender = await userModel.findById(senderId);
    const receiver = await userModel.findById(currentUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Push receiverId into sender's followers list if not already
    if (!sender.followers.includes(currentUserId)) {
      sender.followers.push(currentUserId);
    }

    // 2. Push senderId into receiver's followers list if not already
    if (!receiver.followers.includes(senderId)) {
      receiver.followers.push(senderId);
    }

    // 3. Remove senderId from receiver's requests array
    receiver.requests = receiver.requests.filter(id => id.toString() !== senderId.toString());

    // 4. Push receiverId into sender's acceptedRequests array if not already
    
    if (!sender.AcceptedReq.includes(currentUserId)) {
      sender.AcceptedReq.push(currentUserId);
    }

    // Save both updated documents
    await sender.save();
    await receiver.save();

    

     
    res.redirect('/notifications');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong in notifications!" });
  }
});

router.get('/reject-notification/:senderId', userMiddleware.authUser, async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const currentUserId = req.user._id;

    // Find current user (receiver)
    const receiver = await userModel.findById(currentUserId);
    const sender = await userModel.findById(senderId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Remove senderId from receiver's requests array
    receiver.requests = receiver.requests.filter(id => id.toString() !== senderId.toString());

    // 2. Push senderId into receiver's rejectedReq array if not already
   
    if (!sender.RejectedReq.includes(currentUserId)) {
      sender.RejectedReq.push(currentUserId);
    }

    // Save updated receiver
    await receiver.save();
    await sender.save();

    // Redirect back to notifications page
    res.redirect('back');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while rejecting notification!" });
  }
});


router.get('/remove-acceptedRequest/:senderId', userMiddleware.authUser, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const senderId = req.params.senderId;

    // Find current user (receiver)
    const receiver = await userModel.findById(currentUserId);
    const sender = await userModel.findById(senderId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Remove senderId from receiver's requests array
    receiver.AcceptedReq = receiver.AcceptedReq.filter(id => id.toString() !== senderId.toString());

    // Save updated receiver
    await receiver.save();
    await sender.save();

    // Redirect back to notifications page
    res.redirect('back');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while rejecting notification!" });
  }
});

router.get('/remove-rejectedRequest/:senderId', userMiddleware.authUser, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const senderId = req.params.senderId;

    // Find current user (receiver)
    const receiver = await userModel.findById(currentUserId);
    const sender = await userModel.findById(senderId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Remove senderId from receiver's requests array
    receiver.RejectedReq = receiver.RejectedReq.filter(id => id.toString() !== senderId.toString());

    // Save updated receiver
    await receiver.save();
    await sender.save();

    // Redirect back to notifications page
    res.redirect('back');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while rejecting notification!" });
  }
});





router.get("/home", userMiddleware.authUser, async (req, res) => {
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
});

router.get("/followers", userMiddleware.authUser, async (req, res) => {
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
});

router.post(
  "/register",
  userMiddleware.registerUserValidation,
  userController.createUserController
);

router.post(
  "/login",
  userMiddleware.loginUserValidation,
  userController.loginUserController
);

router.get("/profile", userMiddleware.authUser, (req, res) => {
  res.json({ user: req.user });
});



router.get(
  "/get-messages",
  userMiddleware.authUser,
  userController.getMessageController
);


router.get('/messages/:receiverId', async (req, res) => {
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
});


export default router;
