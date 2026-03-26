const User = require("../models/User");

exports.getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");

    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = (user.notifications || [])
      .slice()
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load notifications" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");
    if (!user) return res.status(404).json({ message: "User not found" });

    for (const n of user.notifications || []) {
      n.read = true;
    }

    await user.save();
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update notifications" });
  }
};

