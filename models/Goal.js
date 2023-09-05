const mongoose = require("mongoose");

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

module.exports = Goal;
