const mongoose = require("mongoose");

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

module.exports = Workout;
