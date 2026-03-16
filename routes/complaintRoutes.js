const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint,
  getAnalytics,
} = require("../controllers/complaintController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/", protect, getComplaints);
router.post("/create", protect, upload.single("image"), createComplaint);
router.get("/:id", protect, getComplaintById);
router.patch("/:id/status", protect, adminOnly, updateStatus);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
