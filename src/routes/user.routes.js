import { Router } from 'express'
import * as userController from "../controllers/user.controller.js"
const router = Router();
import * as userMiddleware from "../middlewares/users.middlewares.js"
import postModel from '../models/post.model.js';
import commentModel from '../models/comment.model.js';
import { log } from 'console';

router.get('/register',(req,res)=>{
    res.render('register')
})
router.get('/',(req,res)=>{
  res.render('login')  
})

router.get('/logout',userMiddleware.authUser,userController.logOutUserController)
  
router.get('/home',userMiddleware.authUser,async (req,res)=>{
    const {postId}=req.body;
    const user=req.user;
    const posts= await postModel.find()
    const comments=await commentModel.find();
    res.render('home',{user,posts,comments})
})

router.get('/followers',userMiddleware.authUser,async (req,res)=>{
    const followingUser=[

    ]
    res.render('your-followers');

}
)





router.post('/register',
    userMiddleware.registerUserValidation,
    userController.createUserController);

router.post('/login',
    userMiddleware.loginUserValidation,
    userController.loginUserController);

router.get('/profile', userMiddleware.authUser, (req, res) => {
    res.json({ user: req.user });
})

router.get('/logout', userMiddleware.authUser, userController.logOutUserController)

router.get('/get-messages',
    userMiddleware.authUser,
    userController.getMessageController
)


export default router;
