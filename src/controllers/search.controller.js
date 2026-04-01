import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";


export const searchAll = async (req,res) => {
    const query = req.query.q;

    if(!query){
        throw new ApiError(404,"Query not found" )
    }

    // Search videos with likes count and owner info
    const videos = await Video.aggregate([
        {
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
                isPublished: true
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
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
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
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $limit: 10
        }
    ]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } }
      ]
    }).select("username fullName avatar").limit(5);

    const tweets = await Tweet.find({
      content: { $regex: query, $options: "i" },
    }).populate("owner", "username fullName avatar").limit(10);

    const playlists = await Playlist.find({
      name: { $regex: query, $options: "i" },
    }).populate("owner", "username fullName avatar").limit(5);

    res.status(200).json(new ApiResponse(200, { videos, users, tweets, playlists }))
}