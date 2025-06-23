const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByNIP, createUser } = require('../models/userModel');

const saltRounds = 10;

const register = async (req, res) => {
  try {
    const { NIP, nama, email, password, role, dept } = req.body;

    if (!NIP || !nama || !email || !password || !role || !dept) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user with NIP already exists
    const existingNIPUser = await findUserByNIP(NIP);
    if (existingNIPUser) {
      return res.status(400).json({ message: 'NIP already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await createUser({ NIP, nama, email, password: hashedPassword, role, dept });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { NIP, password } = req.body;

    if (!NIP || !password) {
      return res.status(400).json({ message: 'NIP and password are required' });
    }

    const user = await findUserByNIP(NIP);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, NIP: user.NIP, nama: user.nama, role: user.role, dept: user.dept },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login
};
