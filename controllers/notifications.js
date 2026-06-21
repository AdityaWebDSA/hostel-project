const Notification = require("../models/notification.js");

module.exports.list = async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.render("notifications/index.ejs", { notifications });
};

// Used by the navbar bell to fetch unread count via fetch()
module.exports.unreadCount = async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ count });
};

module.exports.markRead = async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (notification && notification.user.equals(req.user._id)) {
        notification.read = true;
        await notification.save();
    }
    res.redirect(notification ? notification.link : "/notifications");
};

module.exports.markAllRead = async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    req.flash("success", "All notifications marked as read.");
    res.redirect("/notifications");
};