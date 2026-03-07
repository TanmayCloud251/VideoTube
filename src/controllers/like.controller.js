import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const user = req.user._id

    const existingLike = await Like.findOne({user, video: videoId})
    
    if(existingLike) {
        await existingLike.remove()
        return res.json(new ApiResponse(true, "Video unliked"))
    }

    const newLike = await Like.create({user, video: videoId})
    res.json(new ApiResponse(true, "Video liked", newLike))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const user = req.user._id

    const existingLike = await Like.findOne({user, comment: commentId})

    if(existingLike) {
        await existingLike.remove()
        return res.json(new ApiResponse(true, "Comment unliked"))
    }

    const newLike = await Like.create({user, comment: commentId})
    res.json(new ApiResponse(true, "Comment liked", newLike))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const user = req.user._id

    const existingLike = await Like.findOne({user, tweet: tweetId})

    if(existingLike) {
        await existingLike.remove()
        return res.json(new ApiResponse(true, "Tweet unliked"))
    }

    const newLike = await Like.create({user, tweet: tweetId})
    res.json(new ApiResponse(true, "Tweet liked", newLike))

}
) 

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(user),
                video: {$ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ])
    res.json(new ApiResponse(true, "Liked videos fetched", likedVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}