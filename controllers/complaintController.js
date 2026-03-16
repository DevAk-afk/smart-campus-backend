const Complaint = require("../models/Complaint");

// POST /api/complaints/create  (student)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      image,
      owner: req.user._id,
    });

    await complaint.populate("owner", "name email rollNumber");
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints  (student → own, admin → all)
const getComplaints = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { owner: req.user._id };
    const complaints = await Complaint.find(filter)
      .populate("owner", "name email rollNumber department")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("owner", "name email rollNumber department");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Students can only view their own
    if (req.user.role !== "admin" && complaint.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/complaints/:id/status  (admin only)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("owner", "name email");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Status updated", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/complaints/:id  (owner or admin)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (req.user.role !== "admin" && complaint.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await complaint.deleteOne();
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/analytics  (admin only)
const getAnalytics = async (req, res) => {
  try {
    const [byStatus, byCategory, recent] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Complaint.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    res.json({ byStatus, byCategory, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint,
  getAnalytics,
};
