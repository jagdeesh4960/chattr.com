import mongoose from 'mongoose';

const commentSchema=mongoose.Schema({
   text:{
        type:String,
        required:[true,"comment text is required"],
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post',
        required:[true,"post is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"user is required"]
    },
    username:{
        type:String,
        required:[true,"user is required"]
    },
    parentComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment',
    }
})

const commentModel=mongoose.model('comment',commentSchema)
export default commentModel