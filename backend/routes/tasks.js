const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(auth);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post("/", async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = new Task({
      title,
      description: description || "",
      userId: req.user.id,
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Server error during task creation" });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks with search, filter, and pagination
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { q, status, page = 1, limit = 6 } = req.query;

    // Build query object
    const query = { userId: req.user.id };

    // Search filter
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Pagination configuration
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch total matching tasks count
    const totalTasks = await Task.countDocuments(query);

    // Fetch matching tasks
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limitNumber);

    // Fetch overall user stats (not filtered by query or page)
    const totalUserTasks = await Task.countDocuments({ userId: req.user.id });
    const completedUserTasks = await Task.countDocuments({ userId: req.user.id, status: "completed" });
    const pendingUserTasks = await Task.countDocuments({ userId: req.user.id, status: "pending" });

    res.json({
      tasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
      currentPage: pageNumber,
      totalTasks,
      stats: {
        total: totalUserTasks,
        completed: completedUserTasks,
        pending: pendingUserTasks,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Server error retrieving tasks" });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get single task error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({ message: "Server error retrieving task details" });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", async (req, res) => {
  const { title, description, status } = req.body;

  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Update task error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({ message: "Server error during task update" });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle completion status of a task
// @access  Private
router.patch("/:id/toggle", async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = task.status === "completed" ? "pending" : "completed";
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Toggle task error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({ message: "Server error during task toggle" });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, userId: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task removed successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({ message: "Server error during task deletion" });
  }
});

module.exports = router;
