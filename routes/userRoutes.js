const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getAllStudents, banUser, unbanUser } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/students", protect, adminOnly, getAllStudents);
router.patch("/:id/ban", protect, adminOnly, banUser);
router.patch("/:id/unban", protect, adminOnly, unbanUser);

module.exports = router;
