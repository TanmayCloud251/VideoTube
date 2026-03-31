import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


const configureCloudinary = () => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        configureCloudinary()
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        console.error("Cloudinary upload error:", error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}

const uploadVideoOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        configureCloudinary()
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "video",
            timeout: 120000 // Increase timeout to 2 minutes for videos
        })
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        console.error("Cloudinary video upload error:", error);
        throw new Error(`Cloudinary video upload failed: ${error.message}`);
    }
}

export {uploadOnCloudinary, uploadVideoOnCloudinary}