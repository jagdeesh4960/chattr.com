import mongoose from "mongoose";

const messageSchema=mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"sender is required"]
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,"receiver is required"]
    },
    text:{
        type:String,
        required:[true,"text is required"],
    }
})

const messageModel=mongoose.model('message',messageSchema)

export default messageModel;