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

    const videos = await Video.find(filter).sort(sortOptions).skip(skip).limit(parseInt(limit))
    
    return res.status(200).json(new ApiResponse(true, videos, "Videos fetched successfully"))
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
    const video= await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    return res.status(200).json(new ApiResponse(true, video, "Video fetched successfully"))
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

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video
    });


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

    return res.status(200).json(new ApiResponse(true, video, "Video publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
