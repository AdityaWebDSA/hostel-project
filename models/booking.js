const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    tenant: { // the user requesting to book
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    owner: { // denormalized for fast "owner inbox" queries without populating listing every time
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    billingPlan: {
        type: String,
        required: true,
    },
    moveInDate: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "rejected", "cancelled"],
        default: "pending",
    },
    // Reserved for Part C2 (payment) - not used yet
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid",
    },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);