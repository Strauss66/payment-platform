const User = require("../models/User");
const Role = require("../models/role");
const Permission = require("../models/permission");
const bcrypt = require("bcrypt");

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: Role });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create User
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, username, password, role_id } = req.body;

    if (!first_name || !last_name || !email || !username || !password || !role_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      username,
      password: hashedPassword,
      role_id,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, email, username, role_id, password } = req.body;

    const updatedFields = { first_name, last_name, email, username, role_id };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await User.update(updatedFields, { where: { id: req.params.id } });

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    await Role.update({ name }, { where: { id: req.params.id } });

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    await Role.destroy({ where: { id: req.params.id } });
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

// Update Permission
const updatePermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Permission.update({ name, description }, { where: { id: req.params.id } });

    res.json({ message: "Permission updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Permission
const deletePermission = async (req, res) => {
  try {
    await Permission.destroy({ where: { id: req.params.id } });
    res.json({ message: "Permission deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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