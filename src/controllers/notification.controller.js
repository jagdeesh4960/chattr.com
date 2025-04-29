import userModel from "../models/user.js";


export const getNotification=async (req,res)=>{
       try {
         const followUserId = req.params.userId;
         const currentUserId = req.user._id;
         const followUser=await userModel.findById(followUserId);
         const currentUser = await userModel.findById(currentUserId).populate('requests');
         const AcceptedReq = await userModel.findById(currentUserId).populate('AcceptedReq');
         const RejectedReq = await userModel.findById(currentUserId).populate('RejectedReq');
        
         const notifications=currentUser.requests;
         const acceptedRequests=AcceptedReq.AcceptedReq; 
         const rejectedRequests=RejectedReq.RejectedReq; 
   
         res.render('notifications',{notifications,acceptedRequests,rejectedRequests})
   
       } catch (error) {
         console.error(error);
         res
           .status(500)
           .json({ error: "Something went wrong to notifications !" });
       }
    
     }

export const acceptNotification=async (req, res) => {
    try {
      const senderId = req.params.senderId;
      const currentUserId = req.user._id;
  
      // Find sender and receiver
      const sender = await userModel.findById(senderId);
      const receiver = await userModel.findById(currentUserId);
  
      if (!sender || !receiver) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // 1. Push receiverId into sender's followers list if not already
      if (!sender.followers.includes(currentUserId)) {
        sender.followers.push(currentUserId);
      }
  
      // 2. Push senderId into receiver's followers list if not already
      if (!receiver.followers.includes(senderId)) {
        receiver.followers.push(senderId);
      }
  
      // 3. Remove senderId from receiver's requests array
      receiver.requests = receiver.requests.filter(id => id.toString() !== senderId.toString());
  
      // 4. Push receiverId into sender's acceptedRequests array if not already
      
      if (!sender.AcceptedReq.includes(currentUserId)) {
        sender.AcceptedReq.push(currentUserId);
      }
  
      // Save both updated documents
      await sender.save();
      await receiver.save();
  
      
  
       
      res.redirect('/notifications');
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong in notifications!" });
    }
  }     

export const rejectNotification=   async (req, res) => {
     try {
       const senderId = req.params.senderId;
       const currentUserId = req.user._id;
   
       // Find current user (receiver)
       const receiver = await userModel.findById(currentUserId);
       const sender = await userModel.findById(senderId);
   
       if (!receiver) {
         return res.status(404).json({ error: "User not found" });
       }
   
       // 1. Remove senderId from receiver's requests array
       receiver.requests = receiver.requests.filter(id => id.toString() !== senderId.toString());
   
       // 2. Push senderId into receiver's rejectedReq array if not already
      
       if (!sender.RejectedReq.includes(currentUserId)) {
         sender.RejectedReq.push(currentUserId);
       }
   
       // Save updated receiver
       await receiver.save();
       await sender.save();
   
       // Redirect back to notifications page
       res.redirect('back');
   
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: "Something went wrong while rejecting notification!" });
     }
   }  

export const removeNotification=async (req, res) => {
     try {
       const currentUserId = req.user._id;
       const senderId = req.params.senderId;
   
       // Find current user (receiver)
       const receiver = await userModel.findById(currentUserId);
       const sender = await userModel.findById(senderId);
   
       if (!receiver) {
         return res.status(404).json({ error: "User not found" });
       }
   
       // 1. Remove senderId from receiver's requests array
       receiver.AcceptedReq = receiver.AcceptedReq.filter(id => id.toString() !== senderId.toString());
   
       // Save updated receiver
       await receiver.save();
       await sender.save();
   
       // Redirect back to notifications page
       res.redirect('back');
   
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: "Something went wrong while rejecting notification!" });
     }
   }
   
export const removeRejectNotification= async (req, res) => {
     try {
       const currentUserId = req.user._id;
       const senderId = req.params.senderId;
   
       // Find current user (receiver)
       const receiver = await userModel.findById(currentUserId);
       const sender = await userModel.findById(senderId);
   
       if (!receiver) {
         return res.status(404).json({ error: "User not found" });
       }
   
       // 1. Remove senderId from receiver's requests array
       receiver.RejectedReq = receiver.RejectedReq.filter(id => id.toString() !== senderId.toString());
   
       // Save updated receiver
       await receiver.save();
       await sender.save();
   
       // Redirect back to notifications page
       res.redirect('back');
   
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: "Something went wrong while rejecting notification!" });
     }
   }   