const express = require("express");
const auth = require("../middleware/auth");
const userController = require("../controllers/user");

const router = express.Router();

router.post("/login", userController.userLogin);
router.get("/logout", userController.userLogout);
router.get(
  "/courses/:courseId/tests",
  auth,
  userController.getTestsForCourse
);
router.get("/courses", auth, userController.getCourses);

// Route for submitting a test
router.post("/submittest", auth, userController.submitTest);
router.get("/profile", auth, userController.getProfile);
router.post("/updateprofile", auth, userController.updateProfile);

module.exports = router;
