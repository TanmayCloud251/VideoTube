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

const deleteFromCloudinary = async (publicId, resourceType="image") => {
    try {
        if (!publicId) return null;
        configureCloudinary();
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
}

export {uploadOnCloudinary, uploadVideoOnCloudinary, deleteFromCloudinary}