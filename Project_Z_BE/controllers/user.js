const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Course = require("../models/course");
const TestResult = require("../models/testresult"); // Import the TestResult model

const userController = {
  getTestsForCourse: async (req, res) => {
    const { courseId } = req.params; // Get courseId from URL parameters

    try {
      // Find the course by ID and populate its sub-courses and topics
      const course = await Course.findById(courseId).populate({
        path: "subCourses",
        populate: {
          path: "topics.tests",
          model: "Test", // Ensure this matches the model name for tests
        },
      });

      if (!course) {
        return res.status(404).send("Course not found");
      }

      // Gather all tests from sub-courses and topics
      const tests = course.subCourses.reduce((acc, subCourse) => {
        subCourse.topics.forEach((topic) => {
          acc.push(...topic.tests);
        });
        return acc;
      }, []);

      res.json(tests); // Send the tests as the response
    } catch (error) {
      console.error("Error retrieving tests:", error);
      res.status(500).send("Server error");
    }
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      // Generate a token for the user
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set the token as a cookie
      res.cookie("token", token, { httpOnly: true, secure: true });
      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error); // Log the error
      res.status(500).send("Server error");
    }
  },

  getProfile: async (req, res) => {
    try {
      console.log("User ID from token:", req.user.id); // Debug log
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).send("User not found");

      res.json(user); // Send user details (excluding password)
    } catch (error) {
      console.error("Get profile error:", error); // Log the error
      res.status(500).send("Server error");
    }
  },

  submitTest: async (req, res) => {
    const { courseId, testId, answers } = req.body; // courseId and testId

    try {
      // Fetch the course and its tests
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).send("Course not found");
      }

      // Find the test within the course
      const test = course.subCourses
        .flatMap((subCourse) => subCourse.topics)
        .flatMap((topic) => topic.tests)
        .find((t) => t._id.toString() === testId);

      if (!test) {
        return res.status(404).send("Test not found");
      }

      // Calculate score
      let score = 0;
      test.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) {
          score++;
        }
      });

      // Save test result
      const testResult = new TestResult({
        user: req.user._id,
        test: testId,
        score: score,
      });

      await testResult.save();
      res.json({ score }); // Send back the score
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).send("Error submitting test: " + error.message);
    }
  },

  // Update Profile - Allow user to update missing fields
  updateProfile: async (req, res) => {
    const { phone, address, gender, dob, age, parentsInfo, about } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).send("User not found");

      // Update user details only if provided
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.gender = gender || user.gender;
      user.dob = dob || user.dob;
      user.age = age || user.age;
      user.parentsInfo = parentsInfo || user.parentsInfo;
      user.about = about || user.about;

      await user.save();
      res.json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Update profile error:", error); // Log the error
      res.status(500).send("Server error");
    }
  },
  
  getCourses: async (req, res) => {
    try {
      const courses = await Course.find(); // This should work if the import is correct
      res.json(courses); // Send the list of courses
    } catch (error) {
      console.error("Error retrieving courses:", error); // Log the error
      res.status(500).send("Error retrieving courses: " + error.message);
    }
  },
submitTest: async (req, res) => {
  const { courseId, testId, answers } = req.body; // courseId and testId

  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).send("User not authenticated");
    }

    // Fetch the course and its tests
    const course = await Course.findById(courseId).populate('subCourses');
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Find the test within the course
    const test = course.subCourses
      .flatMap((subCourse) => subCourse.topics)
      .flatMap((topic) => topic.tests)
      .find((t) => t._id.toString() === testId);

    if (!test) {
      return res.status(404).send("Test not found");
    }

    // Calculate score
    let score = 0;
    test.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        score++;
      }
    });

   
    // Create a TestResult object with required fields
    const testResult = new TestResult({
      user: req.user._id, // Ensure this is set correctly
      course: courseId, // Ensure this is set correctly
      subCourse: test.subCourse, // Ensure this is set correctly
      topic: test.topic, // Ensure this is set correctly
      testTitle: test.title, // Ensure this is set correctly
      score: score, // Ensure this is set correctly
      attempt: 1, // You can implement logic to track attempts
    });

    await testResult.save();
    res.json({ score}); // Send back the score
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).send("Error submitting test: " + error.message);
  }
},
  userLogout: (req, res) => {
    // Clear the cookie that stores the token
    res.clearCookie("token", { httpOnly: true, secure: true });
    res.json({ message: "Logged out successfully" });
  },
};

module.exports = userController;
