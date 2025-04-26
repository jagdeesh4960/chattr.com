import mongoose from "mongoose";

const likeSchema=new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post',
        required:[true,"Post is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"user is required"]
    }
},
    {timestamps:true} 
)

const likeModel=mongoose.model('like', likeSchema);

export default likeModel;