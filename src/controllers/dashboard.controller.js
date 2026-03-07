import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id

    const videoStats = await Video.aggregate([
        {
            $mattch: {owner: mongoose.Types.ObjectId(channelId)}
        },
        {
            $group:{
                _id: null,
                totalViews: {$sum: "$views"},
                totalVideos: {$sum: 1},
                totalLikes: {$sum: "$likesCount"}
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({channel: channelId})

    const videos = await Video.find({ owner: channelId }).select("_id")

    const videoIds = videos.map(v => v._id)

        
    const totalLikes = await Like.countDocuments({
            video: { $in: videoIds }
    })

    const stats = {
            totalVideos: videoStats[0]?.totalVideos || 0,
            totalViews: videoStats[0]?.totalViews || 0,
            totalSubscribers,
            totalLikes
        }

    res.status(200).json(new ApiResponse (200, "Stats succesfully collected", stats))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user._id

    const video = await Video.find({owner: channelId}).sort({createdAt: -1})

    res.stats(200).json(new ApiResponse(200,"Videos fetched successfully", video))
})

export {
    getChannelStats, 
    getChannelVideos
    }