const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.authenticate = async function (username, plainPassword) {
  const user = await this.findOne({ username: (username || '').trim().toLowerCase() }).select('+password');
  if (!user) return { success: false, error: 'username' };
  const match = await bcrypt.compare(plainPassword || '', user.password);
  if (!match) return { success: false, error: 'password' };
  return { success: true, user: { _id: user._id, username: user.username } };
};

const User = mongoose.model('User', userSchema);
module.exports = User;
