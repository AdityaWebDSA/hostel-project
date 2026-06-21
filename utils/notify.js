const Notification = require("../models/notification.js");

module.exports = async function notify(userId, type, message, link = "/") {
    try {
        await Notification.create({ user: userId, type, message, link });
    } catch (err) {
        // Notifications are non-critical - never let a failure here break the main action
        console.error("Notification creation failed:", err);
    }
};