import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(
        [title, description].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "Title and description are required")
    }
    if( !req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }
    //get
    const videoPath = req.files.videoFile[0].path;
    const thumbnailPath = req.files.thumbnail[0].path;
    //cloudinary upload
    const videoUpload = await uploadOnCloudinary(videoPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailPath)
    

    //create video
    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoUpload?.secure_url,
        thumbnail: thumbnailUpload?.secure_url,
        duration: videoUpload?.duration,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(true, newVideo, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
