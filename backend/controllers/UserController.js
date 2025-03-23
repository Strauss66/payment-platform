const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/permission");
const bcrypt = require("bcrypt");

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });

    if (!Array.isArray(users)) {
      console.error("Unexpected response from DB:", users);
    }

    res.status(200).json(users || []); // Ensure response is always an array
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to retrieve users", details: error.message });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: Role });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user", details: error.message });
  }
};

// Create User
const createUser = async (req, res) => {
  try {
    const { email, username, password, role_id } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, and password are required" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ error: "Username already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      role_id: role_id || null, // Allow users without a role
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", details: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { email, username, role_id, password } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedFields = { email, username, role_id };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await User.update(updatedFields, { where: { id: req.params.id } });

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", details: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", details: error.message });
  }
};

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve roles", details: error.message });
  }
};

// Create Role
const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const role = await Role.create({ name });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: "Failed to create role", details: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    await Role.update({ name }, { where: { id: req.params.id } });

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update role", details: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    await Role.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role", details: error.message });
  }
};

// Get All Permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve permissions", details: error.message });
  }
};

// Create Permission
const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Permission name is required" });

    const permission = await Permission.create({ name, description });
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: "Failed to create permission", details: error.message });
  }
};

// Update Permission
const updatePermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Permission.update({ name, description }, { where: { id: req.params.id } });

    res.status(200).json({ message: "Permission updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update permission", details: error.message });
  }
};

// Delete Permission
const deletePermission = async (req, res) => {
  try {
    await Permission.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete permission", details: error.message });
  }
};

// Export all functions
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission
};