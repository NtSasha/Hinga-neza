const bcrypt = require("bcrypt");
const prisma = require("../config/db"); 


const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, role_id } = req.body;

    
    if (!full_name || !password) {
      return res.status(400).json({
        message: "Names and password are required",
      });
    }

    
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone_number: phone_number || undefined },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone number already exists",
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await prisma.users.create({
      data: {
        full_name,
        email: email || null,
        phone_number: phone_number || null,
        password_hash: hashedPassword,
        role_id: role_id || null,
      },
      include: { roles: true }, 
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
};