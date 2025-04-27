import { generateCaptionFromImageBuffer } from "../services/ai.service.js";
import { uploadFile } from "../services/cloudStorage.service.js";
import postModel from "../models/post.model.js";
import likeModel from "../models/like.model.js";
import commentModel from "../models/comment.model.js";
import userModel from "../models/user.js";

export const createPost = async (req, res, next) => {
  try {
    const imageBuffer = req.file?.buffer;
    
    if (!imageBuffer) {
      return res.status(400).json({ msg: "Image is required" });
    }

    const [caption, fileData] = await Promise.all([
      generateCaptionFromImageBuffer(imageBuffer),
      uploadFile(imageBuffer),
    ]);
     
    const user=req.user;
    const newPost = await postModel.create({
      caption,
      media: fileData,
      author: req.user._id,
      authorName:user.username
    });
 
    res.redirect('/post/my-posts')
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const likePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postModel.isValidPostId(postId)) {
      return res.status(400).json({ msg: "Invalid postId" });
    }
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isAlreadyLiked = await likeModel.findOne({
      post: postId,
      user: req.user._id,
    });

    if (isAlreadyLiked) {
      return res.status(400).json({ msg: "You have already liked this post" });
    }

    await likeModel.create({
      post: postId,
      user: req.user._id,
    });
  
    await post.increamentLikeCount();

    res.status(200).json({ message: "Post liked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


export const removeLikePost = async (req, res, next) => {
    try {
      const postId = req.params.postId;
      if (!postModel.isValidPostId(postId)) {
        return res.status(400).json({ msg: "Invalid postId" });
      }
      const post = await postModel.findById(postId);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
   
      const userLikedPost=await likeModel.findOne({
        post:postId,
        user: req.user._id
      })
    


      if(!userLikedPost){
        return res.status(200).json({msg: "You haven't liked this post yet"});

      }

      await likeModel.findOneAndDelete({
        post:postId,
        user:req.user._id
    });

   await post.decrementLikeCount();


  res.status(200).json({ message: "Post unliked successfully" });

}
catch(err){
    console.error(err);
    res.status(500).send("Internal Server Error");
  
}
}

export const getAllPosts=async (req, res) => {
    try{
        const limit=req.query.limit ||10;
        const skip=req.query.skip ||0;
        const recentPosts=await postModel.getRecentPosts(limit,skip);
        res.status(200).json({posts:recentPosts});

    }
    catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

export const getPostById=async (req, res) => {
    try{
        const postId=req.params.postId;
        if(!postId){
            return res.status(400).json({msg: "PostId is required"});
        }
        if(!postModel.isValidPostId(postId)){
            return res.status(400).json({msg: "Invalid postId"});
        }
        const post=await postModel.findById(postId).populate('author');
        if(!post){
            return res.status(404).json({msg: "Post not found"});
        }
        res.status(200).json({post});
    }
    catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

export const commentOnPost=async (req, res, next) => {
  try{
   
         
    let comment=null;
    const {postId,text,parentComment} = req.body;
    const userId= req.user._id;
    const currentPost=await postModel.findById(postId)
    const username=await userModel.findById(userId);
    if(!currentPost){
      return res.status(404).json({msg: "Post not found"});
    }

    // if(parentComment){
    //   const isparentCommentExists=await commentModel.findById(parentComment)
    //   comment=isparentCommentExists 

    //   if(!isparentCommentExists){
    //     return res.status(404).json({msg: "Parent comment not found"});
    //   }
    // }

   const newComment=await commentModel.create({
    post:postId,
    text,
    user:req.user._id,
    username:username.username
    // parentComment:comment.parentComment||text
   })

   await currentPost.incrementCommentCount();
 res.redirect('/home')

  }
  catch(err){
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
}