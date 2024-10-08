const express = require("express");
const auth = require("../middleware/auth");
const adminController = require("../controllers/admin");

const router = express.Router();

// Prime Admin Login
router.post("/prime/login", adminController.primeLogin);
// Prime Admin Logout - changed to GET
router.get("/prime/logout", auth, adminController.primeLogout);
// Prime Admin Registration Route
router.post("/prime/register", auth, adminController.primeRegister);

// Normal Admin Login
router.post("/sub/login", adminController.subLogin);
// Normal Admin Logout - changed to GET
router.get("/sub/logout", auth, adminController.subLogout);
// Add User
router.post("/sub/add-user", auth, adminController.addUser);

// Get All Users for Prime Admin
router.get("/prime/users", auth, adminController.getAllUsers);

// Get Users for Normal Admin
router.get("/sub/users", auth, adminController.getNormalUsers);

module.exports = router;
