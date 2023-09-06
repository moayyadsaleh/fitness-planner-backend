// Load environment variables from a .env file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const passportFacebook = require("passport-facebook");
const { body, validationResult } = require("express-validator");
const bodyParser = require("body-parser");
const router = express.Router();
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
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

//Set up Passport and use local strategy.This is used in scenarios where you want to
//handle authentication based on manual input of username (usually email) and password
passport.use(User.createStrategy());
const FacebookStrategy = passportFacebook.Strategy;

// When dealing with manual input of a username (usually email) and password for local authentication, you need to implement serialization
// and deserialization of user objects. This is necessary to manage user sessions and authentication state.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

//After finishing config, use the passport strategy. In this case Google and Facebook.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // Alternative profile URL since google+ is deprecated
      callbackURL: "http://localhost:3000/auth/google/workout",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
//Add Facebook authentication
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/workout",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

//Handle google authentication on both routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, you can redirect the user to a profile page or perform other actions.
    res.redirect("/workout");
  }
);
//Handle Facebook authentication on both routes
app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, you can redirect the user to a profile page or perform other actions.
    res.redirect("/workout");
  }
);

//Handle Manual registration both () Signup and sign in)
//Sign up route
// Handle Manual registration (Signup)
app.post("/signup", (req, res) => {
  // Create a new user with the provided username and email
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });

  // Use Passport.js's `register` method to handle user registration
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      // Passport.js will handle existing user checks and other registration errors
      return res.redirect("/signup"); // Redirect back to registration page on error
    }

    // If registration is successful, authenticate the user
    passport.authenticate("local")(req, res, () => {
      res.redirect("/workout"); // Redirect to the workout page after successful registration
    });
  });
});

// Login route
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.status(200).json({ message: "Login successful" });
    });
  })(req, res, next);
});

app.post("/login", function (req, res) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error(err);
      return res.redirect("/login"); // Redirect to login page on error
    }
    if (!user) {
      // Authentication failed, redirect to login page with a message
      return res.redirect("/login?message=Authentication failed");
    }

    req.login(user, function (err) {
      if (err) {
        console.error(err);
        return res.redirect("/login"); // Redirect to login page on error
      }

      // Authentication successful, redirect to the workout page
      return res.redirect("/workout");
    });
  })(req, res);
});

// Allow authenticated users fill out their workout info and submit the workout planner form
app.get("/workout", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("workout"); // Render the "secret" template
  } else {
    res.redirect("/login"); // Redirect to login page if user is not authenticated
  }
});
// Once the user is authenticated and their session gets saved, their user details are saved to req.user.
app.post("/workout", async (req, res) => {
  // Check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized"); // Return a 401 Unauthorized status if the user is not authenticated
  }

  const submittedWorkout = req.body.workout;

  try {
    const foundUser = await User.findById(req.user.id);

    if (foundUser) {
      foundUser.workouts.push(submittedWorkout);
      await foundUser.save();
      res.redirect("/workout");
    } else {
      res.status(404).send("User not found"); // Handle case when user doesn't exist
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred"); // Handle general error
  }
});

// Create a new goal
router.post("/goals", async (req, res) => {
  try {
    const newGoal = new Goal(req.body);
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Render the "goals" page if the user is authenticated
app.get("/goals", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("goals"); // Render the "goals" page if the user is authenticated
  } else {
    res.redirect("/login"); // Redirect to the login page if the user is not authenticated
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

// Render the "view-goals" page if the user is authenticated
app.get("/view-goals", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("view-goals"); // Render the "view-goals" page if the user is authenticated
  } else {
    res.redirect("/login"); // Redirect to the login page if the user is not authenticated
  }
});

// Define the GET route for viewing goals
app.get("/view-goals", async (req, res) => {
  try {
    // Assuming you have user authentication and the user's ID is available in req.user
    const userId = req.user._id; // Replace with your actual user ID retrieval logic

    // Query the database for the user's goals based on their ID
    const userGoals = await Goal.find({ userId });

    // Return the user's goals as JSON
    res.status(200).json(userGoals);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Define isAuthenticated middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If the user is authenticated, continue to the next middleware or route handler
    return next();
  }
  // If the user is not authenticated, redirect them to the login page or send a 401 Unauthorized status
  res.status(401).send("Unauthorized");
}
// Render the "workouts-history" page if the user is authenticated
app.get("/workouts-history", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("workouts-history"); // Render the "workouts-history" page if the user is authenticated
  } else {
    res.redirect("/login"); // Redirect to the login page if the user is not authenticated
  }
});

// Define an API route for saving workout details
app.post("/workouts-history", isAuthenticated, async (req, res) => {
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

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logout successful" });
});

app.post("/signup", (req, res) => {
  // Access signup data from req.body
  const { name, email, password } = req.body;

  // Replace this with your signup logic (e.g., database insertion and validation)
  console.log("Received signup data:", { name, email, password });

  // Respond with a success status code (e.g., 201)
  res.status(201).json({ message: "Signup successful" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
