// Load environment variables from a .env file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const router = express.Router();
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Start the session using express-session
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "ILovePizza",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
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

//Define First Schema//User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
});

//Add plugins to the Schema (passportLocalMongoose, find one and create).
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

//Define Second Schema//
const goalSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
  },
});

const Goal = mongoose.model("Goal", goalSchema);
//Define Third Schema
// Define a Mongoose schema for the Workout data
const workoutSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  training: {
    type: String,
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  sets: [
    {
      weight: {
        type: String,
        required: true,
      },
      reps: {
        type: String,
        required: true,
      },
    },
  ],
  restIntervals: {
    type: String,
  },
  tempo: {
    type: String,
  },
  cardioType: {
    type: String,
  },
  duration: {
    type: String,
  },
  level: {
    type: String,
  },
  calories: {
    type: String,
  },
  notes: {
    type: String,
  },
});
// Create a Mongoose model for the Workout schema
const Workout = mongoose.model("Workout", workoutSchema);
passport.use(User.createStrategy());

// Define a route to handle the creation of workout data
app.post("/workouts", (req, res) => {
  // Assuming you have defined your Workout model
  const Workout = mongoose.model("Workout");

  // Create a new workout instance with data from the request body
  const newWorkout = new Workout({
    date: req.body.date,
    training: req.body.training,
    exerciseName: req.body.exerciseName,
    sets: req.body.sets,
    restIntervals: req.body.restIntervals,
    tempo: req.body.tempo,
    cardioType: req.body.cardioType,
    duration: req.body.duration,
    level: req.body.level,
    calories: req.body.calories,
    notes: req.body.notes,
  });

  // Save the new workout to the database
  newWorkout
    .save()
    .then(() => {
      console.log("Workout data saved successfully");
      res.status(201).json({ message: "Workout data saved successfully" });
    })
    .catch((err) => {
      console.error("Error saving workout data:", err);
      res.status(500).json({ error: "Error saving workout data" });
    });
});

//Get Workout by ID
app.get("/workouts/:id", (req, res) => {
  const Workout = mongoose.model("Workout");

  Workout.findById(req.params.id)
    .then((workout) => {
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      res.json(workout);
    })
    .catch((err) => {
      console.error("Error fetching workout data:", err);
      res.status(500).json({ error: "Error fetching workout data" });
    });
});
//Update workout
app.put("/workouts/:id", (req, res) => {
  const Workout = mongoose.model("Workout");

  Workout.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedWorkout) => {
      if (!updatedWorkout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      console.log("Workout data updated successfully");
      res.json(updatedWorkout);
    })
    .catch((err) => {
      console.error("Error updating workout data:", err);
      res.status(500).json({ error: "Error updating workout data" });
    });
});

//Delete a workout
app.delete("/workouts/:id", (req, res) => {
  const Workout = mongoose.model("Workout");

  Workout.findByIdAndRemove(req.params.id)
    .then((deletedWorkout) => {
      if (!deletedWorkout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      console.log("Workout data deleted successfully");
      res.json({ message: "Workout data deleted successfully" });
    })
    .catch((err) => {
      console.error("Error deleting workout data:", err);
      res.status(500).json({ error: "Error deleting workout data" });
    });
});

// Define a route to retrieve all workouts
app.get("/workouts", (req, res) => {
  const Workout = mongoose.model("Workout");

  // Query the database to retrieve all workouts
  Workout.find()
    .then((workouts) => {
      res.status(200).json(workouts); // Return all workout data as JSON response
    })
    .catch((err) => {
      console.error("Error retrieving workouts:", err);
      res.status(500).json({ error: "Error retrieving workouts" });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
