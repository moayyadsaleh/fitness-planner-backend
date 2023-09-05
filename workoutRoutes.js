//workoutRoutes.js;
const express = require("express");
const router = express.Router();
const Workout = require("./workout"); // Adjust the path based on your project structure

const workoutRoutes = require("./workoutRoutes"); // Adjust the path based on your project structure

// Define routes for creating, reading, updating, and deleting workouts
router.post("/workouts", async (req, res) => {
  try {
    // Create a new workout using the Workout schema
    const newWorkout = new Workout(req.body);
    await newWorkout.save();

    res.status(201).json({ message: "Workout data saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new workout
router.post("/workouts", async (req, res) => {
  try {
    const newWorkout = new Workout(req.body);
    await newWorkout.save();
    res.status(201).json({
      message: "Workout data saved successfully",
      workout: newWorkout,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Get all workouts
router.get("/workouts", async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single workout by ID
router.get("/workouts/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json(workout);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Update a workout by ID
router.put("/workouts/:id", async (req, res) => {
  try {
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json({
      message: "Workout updated successfully",
      workout: updatedWorkout,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a workout by ID
router.delete("/workouts/:id", async (req, res) => {
  try {
    const deletedWorkout = await Workout.findByIdAndRemove(req.params.id);
    if (!deletedWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json({
      message: "Workout deleted successfully",
      workout: deletedWorkout,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
