const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 username: String,
 password: String,
 createdOn: String
});

module.exports = new mongoose.model("users", userSchema);