const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ THE FIX: Add .default to the very end of this line!
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);