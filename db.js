const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
);

const blackListSchema = mongoose.Schema(
  {
    token: { type: String },
  },
  { versionKey: false }
);

const blackListModel = mongoose.model("blacklists", blackListSchema);
const userModel = mongoose.model("users", userSchema);
module.exports = { userModel, blackListModel };
