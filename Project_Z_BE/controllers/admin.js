const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Course = require("../models/course"); // Import the Course model

const adminController = {
  // Prime Admin Login
  primeLogin: async (req, res) => {
    const { email, password } = req.body;

    // Validate prime admin credentials
    if (
      email !== process.env.PRIME_ADMIN_EMAIL ||
      password !== process.env.PRIME_ADMIN_PASSWORD
    ) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      { email, role: "prime-admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token as a cookie
    res.cookie("token", token, { httpOnly: true, secure: true }); // Set secure to true in production
    res.json({ message: "Logged in successfully" });
  },
  primeLogout: (req, res) => {
    // Clear the cookie that stores the token
    res.clearCookie("token", { httpOnly: true, secure: true });

    res.json({ message: "Logged out successfully" });
  },

  // Prime Admin Registration Route
  primeRegister: async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if the requesting admin is a prime admin
    if (req.user.role !== "prime-admin") {
      return res
        .status(403)
        .send("You do not have permission to add an admin.");
    }

    // Prevent prime admin from registering another prime admin
    if (role === "prime-admin") {
      return res.status(400).send("Cannot register another prime admin.");
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      await newUser.save();
      res.status(201).send("User registered successfully!");
    } catch (error) {
      res.status(400).send("Error registering user: " + error.message);
    }
  },

  // Normal Admin Login
  subLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      // Generate a token for the normal admin
      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set the token as a cookie
      res.cookie("token", token, { httpOnly: true, secure: true });
      res.json({ message: "Logged in successfully" });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  subLogout: (req, res) => {
    // Clear the cookie that stores the token
    res.clearCookie("token", { httpOnly: true, secure: true });

    res.json({ message: "Logged out successfully" });
  },

  // Add User
  addUser: async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if the logged-in user is allowed to add users
    if (req.user.role !== "admin" && req.user.role !== "prime-admin") {
      return res.status(403).send("You do not have permission to add a user.");
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      await newUser.save();
      res.status(201).send("User added successfully");
    } catch (error) {
      res.status(400).send("Error adding user: " + error.message);
    }
  },

  // Add Course, SubCourse, Topic, Test, or Question
  addCourse: async (req, res) => {
    // Only prime-admin or admin can add courses
    if (req.user.role !== "prime-admin" && req.user.role !== "admin") {
      return res.status(403).send("You do not have permission to add courses.");
    }

    try {
      const { title, subCourses } = req.body;

      const newCourse = new Course({
        title,
        subCourses, // Array of sub-courses, which contain topics, tests, etc.
      });

      await newCourse.save();
      res.status(201).send("Course added successfully!");
    } catch (error) {
      res.status(400).send("Error adding course: " + error.message);
    }
  },

  // Get All Courses
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.find();
      res.json(courses);
    } catch (error) {
      res.status(500).send("Error retrieving courses: " + error.message);
    }
  },

  // Get All Users for Prime Admin
  getAllUsers: async (req, res) => {
    // Prime admin can view all users
    if (req.user.role !== "prime-admin") {
      return res.status(403).send("You do not have permission to view users.");
    }

    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).send("Error retrieving users: " + error.message);
    }
  },

  // Get Users for Normal Admin
  getNormalUsers: async (req, res) => {
    // Normal admin can view only users with the role 'user'
    if (req.user.role !== "admin") {
      return res.status(403).send("You do not have permission to view users.");
    }

    try {
      const users = await User.find({ role: "user" });
      res.json(users);
    } catch (error) {
      res.status(500).send("Error retrieving users: " + error.message);
    }
  },
};

module.exports = adminController;
