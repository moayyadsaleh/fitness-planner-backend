const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB (make sure you have MongoDB installed and running)
mongoose.connect("mongodb://127.0.0.1:27017/workoutDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define a user model (assuming you have a User schema)
const User = require("./models/User"); // Import the User model
const Workout = require("./models/Workout"); // Import the Workout model
const Goal = require("./models/Goal"); // Import the Workout model

app.get("/", (req, res) => {
  res.render("/");
});

// API route for user registration
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user
    const user = new User({ name, email, password });
    await user.save();

    // You can generate a JWT token for user authentication here if needed

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Save the workout details from the workout planner
// Define an API route for saving workout details
app.post("/workouts", async (req, res) => {
  try {
    // Parse workout data from the request body
    const {
      date,
      training,
      exerciseName,
      sets,
      restIntervals,
      tempo,
      cardioType,
      duration,
      level,
      calories,
      notes,
    } = req.body;

    // Create a new workout instance
    const workout = new Workout({
      date,
      training,
      exerciseName,
      sets,
      restIntervals,
      tempo,
      cardioType,
      duration,
      level,
      calories,
      notes,
    });

    // Save the new workout document to the database
    await workout.save();

    res.status(201).json({ message: "Workout details saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Save goals
// Define an API route for saving goal details
app.post("/goals", async (req, res) => {
  try {
    // Parse goal data from the request body
    const { type, target, targetDate, comment } = req.body;

    // Create a new goal instance
    const goal = new Goal({
      type,
      target,
      targetDate,
      comment,
    });

    // Save the new goal document to the database
    await goal.save();

    res.status(201).json({ message: "Goal details saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
