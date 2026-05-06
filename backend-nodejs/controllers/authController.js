// controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET; // move to .env later

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User created successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    // token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Password is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }

    res.json({
      success: true,
      message: "Password verified"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.verifyPasswordSignUp = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Password is required"
      });
    }
    const user = await User.findById(process.env.SECRET_ID_SIGNUP);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ // 🔥 400 → 401 better
        error: "Incorrect password"
      });
    }

    res.json({
      success: true,
      message: "Password verified"
    });

  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

exports.addFaceId = async (req, res) => {
  try {
    const { descriptor } = req.body;


    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ error: "Valid face descriptor is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // save face embedding
    user.descriptor = descriptor;

    await user.save();

    res.json({
      message: "Face descriptor saved successfully",
      user: {
        id: user._id,
        hasFace: !!user.descriptor
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.faceLogin = async (req, res) => {
  try {
    const { facialId } = req.body;

    const user = await User.findOne({ facialId });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    // token (same as your normal login)
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Euclidean distance
const getDistance = (desc1, desc2) => {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};

exports.faceLogin = async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor) {
      return res.status(400).json({ error: "Descriptor required" });
    }

    const users = await User.find();

    let bestMatch = null;
    let minDistance = 999;

    users.forEach(user => {
      if (!user.descriptor) return;

      const dist = getDistance(descriptor, user.descriptor);

      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = user;
      }
    });

    let token = ''
    // threshold (IMPORTANT)
    if (minDistance < 0.5) {
      token = jwt.sign(
        { id: bestMatch._id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token
      });
    }
    return res.status(404).json({
      error: "Face not recognized"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};