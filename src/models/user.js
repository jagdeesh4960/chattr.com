import mongoose, { Query } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import config from "../config/config.js"


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        unique:[true,"username is already exists"],
        trim:true,
        lowercase:true,
        minLength:[3,"username must be atleast 3 characters"],
        maxLength:[15,"username must be atlmost 15 characters"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:[true,"email is already exists"],
        trim:true,
        lowercase:true
    },
    profileImage:{
        type:String,
        default:"https://ts2.mm.bing.net/th?id=OIP.1Agw8tPi1oidtC_q4U4ZdgHaHa&pid=15.1"
    },
    password:{
        type:String,
        select:false
        
    }
    ,followers:[{
       type: mongoose.Schema.Types.ObjectId,
       ref: "user",
    }]

    ,requests:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
     }]
     ,AcceptedReq:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
     }]
     ,RejectedReq:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
     }]
 
 

})

userSchema.statics.hashPassword=async function(password){
    if(!password){
        throw new Error('password must be required');
    }
    const salt=await bcrypt.genSalt(10);
    return bcrypt.hash(password,salt);
}

userSchema.methods.comparePassword=async function(password){
    if(!password){
        throw new Error('password must be required');
    }

    if(!this.password){
        throw new Error('password must be required');
    }

    return bcrypt.compare(password,this.password);
}

userSchema.methods.generateToken=async function(){
  const token=await jwt.sign({id:this._id,
        username:this.username,
        email:this.email
    },
        config.JWT_SECRET,
        {
            expiresIn:config.JWT_EXPIRES_IN 
        })
    return token}

userSchema.statics.verifyToken=function(token){
    if(!token){
        throw new Error('token must be provided');
    }
     
    return jwt.verify(token,config.JWT_SECRET)
}        

const userModel=mongoose.model('user',userSchema);
export default userModel