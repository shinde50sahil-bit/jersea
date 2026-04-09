const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { signToken } = require("../utils/tokens");

const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.validated.body;

  const existingUser = await User.findOne({
    where: {
      email: email.toLowerCase()
    }
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    phone,
    passwordHash
  });

  const token = signToken({
    userId: user.id,
    role: user.role,
    email: user.email
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({
    where: {
      email: email.toLowerCase()
    }
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    email: user.email
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = {
  register,
  login,
  me
};
