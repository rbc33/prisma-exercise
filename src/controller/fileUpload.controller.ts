import cloudinary from "../utils/cloudinaryConfig"
import fs from "fs"
import { NextFunction, Request, Response } from "express";


const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Request received');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    
     // Check if the file was provided
    if(!req.file) {
      console.log('No file in request');
      return res.status(400).json({message: 'No file uploaded'});
    }

    console.log('File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    console.log('Uploading to Cloudinary...');
    // Upload file to Cloudinary
    const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto"
    });
   
    console.log("Your file is uploaded on Cloudinary ", cloudinaryUploadResponse.url);
    
    // Delete temporary file
    fs.unlinkSync(req.file.path);
    
    // Return the image URL to frontend
    res.json({
      success: true,
      imageUrl: cloudinaryUploadResponse.secure_url,
      publicId: cloudinaryUploadResponse.public_id
    });
   
    } catch (error) {
      console.error('Upload error:', error);
      if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error)
    }
};
console.log(uploadFile, "uploadfile");

export { uploadFile };