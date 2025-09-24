import User from '../models/userModel.js';
import Department from '../models/departmentModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = async (req, res) => {
  const { type, name, email, password, departmentName, location } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing required fields.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      type,
      isAdmin: type === 'government',
    });

    let department = null;

    if (type === 'government') {
      if (!departmentName || !location)
        return res.status(400).json({ message: 'Department and location required.' });

      // Create department with latitude & longitude (fix notNull issue)
      department = await Department.create({
        name: departmentName,
        latitude: location.lat,
        longitude: location.lng,
        description: departmentName + " at " + location.name,
      });

      newUser.departmentId = department.id;
      await newUser.save();
    }

    const token = generateToken(newUser.id);
    res.status(201).json({ ...newUser.toJSON(), token, department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sign up failed' });
  }
};


// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Department, as: 'department' }],
    });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user.id);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      isAdmin: user.isAdmin,
      department: user.department || null,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
