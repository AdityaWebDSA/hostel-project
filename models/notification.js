const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["new_review", "booking_request", "booking_status"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // where clicking the notification should take you
        default: "/",
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);