const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userController = {
  userLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      // Generate a token for the normal admin
      const token = jwt.sign(
        { id: user._id,email: user.email, role: user.role },
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

  getProfile: async (req, res) => {
  try {
    console.log("User ID from token:", req.user.id); // Debug log
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).send("User not found");

    res.json(user); // Send user details (excluding password)
  } catch (error) {
    console.error(error); // Log the error for better understanding
    res.status(500).send("Server error");
  }
},


  // Update Profile - Allow user to update missing fields
  updateProfile: async (req, res) => {
    const { phone, address, gender, dob, age, parentsInfo, about } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).send("User not found");

      // Update user details
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
        console.error(error);
      res.status(500).send("Server error");
    }
  },

  userLogout: (req, res) => {
    // Clear the cookie that stores the token
    res.clearCookie("token", { httpOnly: true, secure: true });

    res.json({ message: "Logged out successfully" });
  },
};

module.exports = userController;
