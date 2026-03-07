import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const subscriberId = req.user._id

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId })
    
    if (existingSubscription) {
        await Subscription.deleteOne({ subscriber: subscriberId, channel: channelId })
        res.json(new ApiResponse(200, "Unsubscribed successfully"))
    } else {
        const newSubscription = await Subscription.create({ subscriber: subscriberId, channel: channelId })
        res.json(new ApiResponse(201, "Subscribed successfully", newSubscription))
    }
    

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }
    
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "name email")

    if(!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel")
    }

    res.json(new ApiResponse(200, "Subscribers fetched successfully", subscribers))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username email avatar ")
    if(!channels || channels.length === 0) {
        throw new ApiError(404, "No subscribed channels found for this user")
    }

    res.json(new ApiResponse(200, "Subscribed channels fetched successfully", channels))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}