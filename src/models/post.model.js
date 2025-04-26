import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    caption: {
      type: String,
    },
    media: {
      type: Object,
      required: [true, "Media is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Auther is required"],
    },
    authorName:{
      type:String,
      required:true
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.statics.getAuthorPosts = async function (authorId) {
  if (!authorId) {
    throw new Error("Author id is required");
  }
  const posts = await this.find({ author: authorId });
  return posts;
};

postSchema.methods.updateCaption = async function (caption) {
  if (!caption) {
    throw new Error("Caption is required");
  }
  this.caption = caption;
  await this.save();
  return this;
};

postSchema.statics.getRecentPosts = async function (limit, skip = 0) {
  if (!limit) {
    throw new Error("Limit is required");
  }
  const posts = await this.find()
    .sort({ createdAt: -1 })
    .limit(limit>10?10:limit)
    .skip(skip)
    .populate('author');
  return posts;
};

postSchema.statics.isValidPostId = async function (postId) {
  if (!postId) {
    throw new Error("Post id is required");
  }

  const isValidPostId = await mongoose.Types.ObjectId.isValid(postId);
  return isValidPostId;
};

postSchema.methods.increamentLikeCount = async function () {
  this.likesCount++;
  await this.save();
  return this;
};

postSchema.methods.decrementLikeCount = async function () {
  this.likesCount--;
  await this.save();
  return this;
};

postSchema.methods.incrementCommentCount = async function () {
  this.commentCount++;
  await this.save();
  return this;
};

postSchema.methods.decrementcommentCount=async function(){
  this.commentCount--;
  await this.save();
  return this;
}




const postModel = mongoose.model("post", postSchema);

export default postModel;
