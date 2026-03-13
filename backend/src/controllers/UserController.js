const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, role_id, language_preference } = req.body;


    if (!full_name || !password) {
      return res.status(400).json({ message: "Full name and password are required" });
    }
    if (!email && !phone_number) {
      return res.status(400).json({ message: "Either email or phone number must be provided" });
    }


    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone_number ? { phone_number } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email or phone number already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.users.create({
      data: {
        full_name,
        email: email || null,
        phone_number: phone_number || null,
        password_hash: hashedPassword,
        role_id: role_id || null,
        language_preference: language_preference || null,
      },
      include: { roles: true },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({ include: { roles: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;

    if (!password || (!email && !phone_number)) {
      return res.status(400).json({ message: "Password and either email or phone number are required" });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone_number ? { phone_number } : undefined,
        ].filter(Boolean),
      },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role_id: user.role_id,
        language_preference: user.language_preference,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    let id = Number(req.params.id);
    const { full_name, email, phone_number, password, role_id, language_preference } = req.body;


    const existingUser = await prisma.users.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ message: "User not found" });


    const data = {};
    if (full_name) data.full_name = full_name;
    if (email) data.email = email;
    if (phone_number) data.phone_number = phone_number;
    if (password) data.password_hash = await bcrypt.hash(password, 10);
    if (role_id) data.role_id = role_id;
    if (language_preference) data.language_preference = language_preference;

    const updatedUser = await prisma.users.update({ where: { id }, data });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.users.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    await prisma.users.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  loginUser,
  updateUser,
  deleteUser,
};