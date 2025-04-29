import { Server } from 'socket.io';
import mongoose from 'mongoose';
import userModel from '../models/user.js';
import messageModel from '../models/message.model.js';

function initSocket(server) {

//     io.use(async (socket,next)=>{
//        try{
//          const token=socket.handshake.headers.token;
//         if(!token){
//             return next(new Error('Token is required'));
//         }
        
        
//         const decodedToken=userModel.verifyToken(token);
//         const user=await userModel.findById(decodedToken.id);
//         if(!user){
//             return next(new Error('User not found'));
//         }
//         socket.user=user;
//         next();

//     }

// catch(err){
// next(err);
// }
// })


  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      socket.disconnect();
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.user = user;
    socket.join(userId);
    console.log('User connected:', user.username);

    socket.on("chat-message", async (msg) => {
      const { receiver, text, sender } = msg;

      if (!receiver || !text) return;

      const newMsg = await messageModel.create({ sender, receiver, text });

      io.to(receiver).emit("chat-message", {
        sender,
        text,
        receiver
      });
    });

    socket.on("load-messages", async ({ sender, receiver }) => {
      const messages = await messageModel.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      }).sort({ createdAt: 1 });

      socket.emit("messages-history", messages);
    });



    // 📞 Video Call Request
    socket.on("call-user", ({ to, from, name }) => {
      io.to(to).emit("call-made", { from, name });
    });

    // ✅ Call Accepted
    socket.on("accept-call", ({ to, from }) => {
      io.to(to).emit("call-accepted", { from });
    });

    // ❌ Call Rejected
    socket.on("reject-call", ({ to }) => {
      io.to(to).emit("call-rejected");
    });

    // Optional: clean-up on disconnect (not required, but helps debugging)
    socket.on("disconnect", () => {
      console.log("User disconnected:", user.username);
    });


    // 📴 Call Ended
socket.on("end-call", ({ to }) => {
  io.to(to).emit("end-call");
});


    socket.on("disconnect", () => {
      console.log("User disconnected:", user.username);
    });
  });

  console.log("Socket.IO initialized.");
}

export default initSocket;
