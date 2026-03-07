import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const skip = (page - 1) * limit

    const comments = await Comment.find({video: videoId})
        .populate("owner", "name email")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
    
    if(!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video")
    }

    res.status(200).json(new ApiResponse(true, "Comments fetched successfully", comments))


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    
    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    res.status(201).json(new ApiResponse(true, "Comment added successfully", comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, req.body, {new: true})

    res.status(200).json(new ApiResponse(true, "Comment updated successfully", updatedComment))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }
    
    await Comment.findByIdAndDelete(commentId)

    res.status(200).json(new ApiResponse(true, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}
