const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL, {
 useNewUrlParser: true,
 useUnifiedTopology: true
}).then(() => console.log("Database connection successfull."))
 .catch(() => console.log("Failed to connect Database"));
