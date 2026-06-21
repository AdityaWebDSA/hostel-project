const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
    },
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    avatar: {
        url: {
            type: String,
            default: "",
        },
        filename: {
            type: String,
            default: "",
        },
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);