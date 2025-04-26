import {Router} from 'express';
import generateContent  from '../services/ai.service.js';


const router=Router();

router.get('/',async (req,res)=>{

    const prompt=req.query.prompt;
    const response=await generateContent(prompt);
    
    res.status(200).json({response});
});
       



export default router;