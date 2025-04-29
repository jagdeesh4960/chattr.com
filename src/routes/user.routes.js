import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import * as messageController from "../controllers/message.controller.js";
import * as notificationController from "../controllers/notification.controller.js";
const router = Router();
import * as userMiddleware from "../middlewares/users.middlewares.js";
import postModel from "../models/post.model.js";
import commentModel from "../models/comment.model.js";
import messageModel from "../models/message.model.js";
import { log } from "console";
import userModel from "../models/user.js";

router.get("/register", userController.registerUserController);

router.get("/", userController.loginUserControllerRender);

router.get(
  "/logout",
  userMiddleware.authUser,
  userController.logOutUserController
);

router.get("/profile", userMiddleware.authUser, userController.userProfile);

router.get("/home", userMiddleware.authUser, userController.homeController);

router.get(
  "/followers",
  userMiddleware.authUser,
  userController.followerController
);

router.get(
  "/add-follower/:userId",
  userMiddleware.authUser,
  userController.addFollowerController
);

router.post(
  "/remove-follower",
  userMiddleware.authUser,
  userController.removeFollowerController
);

router.get(
  "/remove-follower/:userId",
  userMiddleware.authUser,
  userController.removeFollowerUserId
);

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

router.get(
  "/get-messages",
  userMiddleware.authUser,
  userController.getMessageController
);

router.get(
  "/messages/:receiverId",
  userMiddleware.authUser,
  messageController.getMessageController
);

router.get(
  "/notifications",
  userMiddleware.authUser,
  notificationController.getNotification
);

router.get(
  "/accept-notification/:senderId",
  userMiddleware.authUser,
  notificationController.acceptNotification
);

router.get(
  "/reject-notification/:senderId",
  userMiddleware.authUser,
  notificationController.rejectNotification
);

router.get(
  "/remove-acceptedRequest/:senderId",
  userMiddleware.authUser,
  notificationController.removeNotification
);

router.get(
  "/remove-rejectedRequest/:senderId",
  userMiddleware.authUser,
  notificationController.removeRejectNotification
);

export default router;
