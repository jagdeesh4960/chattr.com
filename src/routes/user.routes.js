import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
const router = Router();
import * as userMiddleware from "../middlewares/users.middlewares.js";
import postModel from "../models/post.model.js";
import commentModel from "../models/comment.model.js";
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

      if (!currentUser.followers.includes(followUserId)) {
        currentUser.followers.push(followUserId);
        await currentUser.save();
      }

      res.redirect("/home");
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

router.get("/home", userMiddleware.authUser, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId).populate("followers"); // populate following not followers!

    if (!user) {
      return res.status(404).send("User not found");
    }

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
      .limit(10);

    res.render("home", { user, posts, comments, suggestionUsers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/followers", userMiddleware.authUser, async (req, res) => {
  try {
    const userId = req.user._id;

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

    res.render("your-followers", { followingUsers, suggestionUsers });
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

export default router;
