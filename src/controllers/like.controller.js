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

    const userId = req.user._id

    const existingLike = await Like.findOne({likedBy: userId, video: videoId})
    
    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.json(new ApiResponse(200, {}, "Video unliked"))
    }

    const newLike = await Like.create({likedBy: userId, video: videoId})
    res.json(new ApiResponse(200, newLike, "Video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const userId = req.user._id

    const existingLike = await Like.findOne({likedBy: userId, comment: commentId})

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.json(new ApiResponse(200, {}, "Comment unliked"))
    }

    const newLike = await Like.create({likedBy: userId, comment: commentId})
    res.json(new ApiResponse(200, newLike, "Comment liked"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const userId = req.user._id

    const existingLike = await Like.findOne({likedBy: userId, tweet: tweetId})

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.json(new ApiResponse(200, {}, "Tweet unliked"))
    }

    const newLike = await Like.create({likedBy: userId, tweet: tweetId})
    res.json(new ApiResponse(200, newLike, "Tweet liked"))

}
) 

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {$ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
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
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ])
    res.json(new ApiResponse(200, likedVideos, "Liked videos fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}