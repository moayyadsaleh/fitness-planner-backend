const mongoose = require("mongoose");

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
    type: String, // Store Google authentication ID
  },
  facebookId: {
    type: String, // Store Facebook authentication ID
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
