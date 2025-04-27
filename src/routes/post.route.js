import {Router} from 'express';
import * as postController from '../controllers/post.controller.js';
import * as postMiddleware from '../middlewares/post.middleware.js';
import * as userMiddleware from '../middlewares/users.middlewares.js';
import { render } from 'ejs';
import postModel from '../models/post.model.js';

const router=Router();  
router.get('/create',userMiddleware.authUser,(req,res)=>{
    res.render('createpost');
})

router.get('/my-posts',userMiddleware.authUser,async (req,res)=>{
    const user=req.user;
    const posts=await postModel.find({author:user._id})
    res.render('my-post',{posts,user});
})

router.post('/create',
    userMiddleware.authUser,
    postMiddleware.handleFileUpload,
    postController.createPost)

router.patch('/like/:postId',
    userMiddleware.authUser,
    postController.likePost,

)    

router.patch('/remove-like/:postId',
    userMiddleware.authUser,
    postController.removeLikePost,

)    

router.get('/get-recent',
    userMiddleware.authUser,
    postController.getAllPosts,

)

router.get('/get/:postId',
    userMiddleware.authUser,
    postController.getPostById,
)

router.post('/comment',

    userMiddleware.authUser,
    postMiddleware.validateComment,
    postController.commentOnPost
)


export default router;