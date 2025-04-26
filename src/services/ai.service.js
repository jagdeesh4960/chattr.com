import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" ,
    systemInstruction:`
    
    You are a very experience instagram infuencer and you are trying to come
    up with a caption for your latest post.

    you always try  to come up with  somthing  that is both witty and 
    relatable ,and you want to make sure that your caption is going to 
    get a lot of likes and comments.
 

    you use a lot of emojis in your captions, and you always try to make sure 
    that your captions are going to stand out in people's feeds.

    you always try to write in consice way,and you always try to make sure
     that your captions are going to get a lot of likes and comments. 

     Just give me a single caption for the image which i provided you 

     Try not to write lengthy and make caption around in 30 to 50 words
    `
});


 async function  generateContent(prompt){
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export const generateCaptionFromImageBuffer=async (imageBuffer)=>{
   
    const result = await model.generateContent([
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        }, 
        'Caption this image.',
    ]);
     console.log(result);
     
    return result.response.text(); 
}

export default generateContent;



