const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        trim: true,
        required: true,
        maxlength: 500,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isOwnerReply: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    // Keep ownerReply for backward compatibility with old data
    ownerReply: { type: String, default: null },
    ownerRepliedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Review", reviewSchema);