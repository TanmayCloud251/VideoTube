import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, uploadVideoOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    
    const pipeline = []

    if (query) {
        pipeline.push({
            $match: {
                title: { $regex: query, $options: "i" }
            }
        })
    }

    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    )

    const sortOptions = {}
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1
    pipeline.push({ $sort: sortOptions })

    const skip = (parseInt(page) - 1) * parseInt(limit)
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) })

    const videos = await Video.aggregate(pipeline)
    
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
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Increment views
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"))
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
        // Delete old thumbnail
        if (video.thumbnail) {
            const publicId = video.thumbnail.split("/").pop().split(".")[0]
            await deleteFromCloudinary(publicId)
        }
        
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

    // Delete files from cloudinary
    if (video.videoFile) {
        const videoPublicId = video.videoFile.split("/").pop().split(".")[0]
        await deleteFromCloudinary(videoPublicId, "video")
    }
    if (video.thumbnail) {
        const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0]
        await deleteFromCloudinary(thumbnailPublicId)
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
