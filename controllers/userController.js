const User = require("../models/User");

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpiry -resetToken -resetTokenExpiry");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, pushToken } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (department !== undefined) user.department = department;
    if (pushToken !== undefined) user.pushToken = pushToken;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber, department: user.department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/students (admin only)
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password -otp -otpExpiry -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/ban (admin only)
const banUser = async (req, res) => {
  try {
    const { banReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: banReason || "Policy violation" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User banned", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/unban (admin only)
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: "" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unbanned", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, getAllStudents, banUser, unbanUser };
