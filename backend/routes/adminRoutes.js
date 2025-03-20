const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// User Management Routes
router.get("/users", UserController.getAllUsers);
router.post("/users", UserController.createUser);
router.get("/users/:id", UserController.getUserById);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

// Role Management Routes
router.get("/roles", UserController.getAllRoles);
router.post("/roles", UserController.createRole);
router.put("/roles/:id", UserController.updateRole);
router.delete("/roles/:id", UserController.deleteRole);

// Permission Management Routes
router.get("/permissions", UserController.getAllPermissions);
router.post("/permissions", UserController.createPermission);
router.put("/permissions/:id", UserController.updatePermission);
router.delete("/permissions/:id", UserController.deletePermission);

module.exports = router;