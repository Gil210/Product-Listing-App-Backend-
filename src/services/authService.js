const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const safeUser = (user) => {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
};

const registerUser = async ({ name, email, password, phone, role }) => {
  const user = await User.create({ name, email, password, phone, role: role === 'owner' ? 'owner' : 'user' });
  return { user: safeUser(user), token: generateToken(user._id) };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(password))) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  return { user: safeUser(user), token: generateToken(user._id) };
};

module.exports = { safeUser, registerUser, loginUser };
