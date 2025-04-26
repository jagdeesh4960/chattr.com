import {Server} from 'socket.io'
import userModel from '../models/user.js';
import mongoose from 'mongoose'
import messageModel from '../models/message.model.js'

function initSocket(server){
    console.log("Socket.io initialized");
    
    const io=new Server(server);

    io.use(async (socket,next)=>{
       try{
         const token=socket.handshake.headers.token;
        if(!token){
            return next(new Error('Token is required'));
        }
        
        
        const decodedToken=userModel.verifyToken(token);
        const user=await userModel.findById(decodedToken.id);
        if(!user){
            return next(new Error('User not found'));
        }
        socket.user=user;
        next();

    }

catch(err){
next(err);
}
})

    io.on('connection', (socket) => {
        
        socket.join(socket.user.id.toString())


        socket.on("chat-message",async (msg) => {
         try {
            
            const {receiver,text}=msg; 
           
            if(!receiver||!text||!receiver.trim()||!text.trim()){
                return;
            }

            
           const sender=socket.user;
           

           const isValidReceiver=mongoose.Types.ObjectId.isValid(receiver);
           if(!isValidReceiver){
                return;
            }
            const counterPart=await userModel.findById(receiver)
            if(!counterPart){
                return;
            }
            await messageModel.create({
                sender:sender.id,
                receiver:counterPart,
                text
            })
            
            io.to(receiver).emit("chat-message", {
                sender, 
                text,
                receiver:counterPart
            });
         } catch (error) {
             console.error(error)
             return  io.to(socket.id).emit("error", error.message);
         
         }
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
            socket.leave(socket.user.id.toString());
        });
        
        console.log('a user connected');

        });

      
}

export default initSocket;