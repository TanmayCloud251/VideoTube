import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, uploadVideoOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const skip = (page - 1) * limit
    const filter = {}

    if(query) {
        filter.title = { $regex: query, $options: "i" }
    }

    if(userId){
        filter.owner = userId
    }

    const sortOptions = {}
    
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "fullName username avatar")
    
    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    console.log("Upload Request Received:");
    console.log("- Title:", title);
    console.log("- Files received:", req.files ? Object.keys(req.files) : "None");

    if(
        [title, description].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "Title and description are required")
    }

    if( !req.files?.videoFile || !req.files?.thumbnail) {
        console.error("Missing files in request:", {
            videoFile: !!req.files?.videoFile,
            thumbnail: !!req.files?.thumbnail
        });
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    //get
    const videoPath = req.files.videoFile[0].path;
    const thumbnailPath = req.files.thumbnail[0].path;
    
    console.log("- Video Path:", videoPath);
    console.log("- Thumbnail Path:", thumbnailPath);

    //cloudinary upload
    let videoUpload;
    let thumbnailUpload;

    try {
        console.log("Uploading to Cloudinary...");
        videoUpload = await uploadVideoOnCloudinary(videoPath)
        console.log("Video uploaded successfully");
        thumbnailUpload = await uploadOnCloudinary(thumbnailPath)
        console.log("Thumbnail uploaded successfully");
    } catch (error) {
        console.error("Cloudinary Error in Controller:", error);
        throw new ApiError(500, error.message || "Failed to upload to Cloudinary")
    }
    
    if (!videoUpload || !thumbnailUpload) {
        throw new ApiError(500, "Cloudinary upload returned null without throwing error")
    }

    //create video
    try {
        const newVideo = await Video.create({
            title,
            description,
            videoFile: videoUpload?.secure_url || videoUpload?.url,
            thumbnail: thumbnailUpload?.secure_url || thumbnailUpload?.url,
            duration: videoUpload?.duration || 0,
            owner: req.user._id
        })
        console.log("Video created in DB:", newVideo._id);
        return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"))
    } catch (dbError) {
        console.error("Database Save Error:", dbError);
        throw new ApiError(500, `Database Error: ${dbError.message}`);
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video= await Video.findById(videoId).populate("owner", "fullName username avatar")
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const { title, description } = req.body

    if(title) video.title = title
    if(description) video.description = description

    if(req.files?.thumbnail){
        const thumbnailPath = req.files.thumbnail[0].path
        const thumbnailUpload = await uploadOnCloudinary(thumbnailPath)
        video.thumbnail = thumbnailUpload?.secure_url
    }

    await video.save()

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    
    if(video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorised to Toggle Publish Status")
    }
    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
