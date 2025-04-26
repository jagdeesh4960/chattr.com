import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config.js'
import {Readable} from 'stream'

cloudinary.config({ 
    cloud_name:config.CLOUD_NAME, 
    api_key:config.API_KEY, 
    api_secret: config.API_SECRET // Click 'View API Keys' above to copy your API secret
});

export const uploadFile=(fileBuffer)=>{
    return new Promise((resolve, reject) => {

        const uploadStream =cloudinary
        .uploader
        .upload_stream({folder:"Instagram"},
            (err,fileData)=>{
                resolve({
                    asset_id:fileData.asset_id,
                    public_id:fileData.public_id,
                    url:fileData.url,
                    format:fileData.format,
                    
                });
            }
        )
        Readable.from(fileBuffer).pipe(uploadStream)
})}