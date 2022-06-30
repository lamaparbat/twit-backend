// importing packages
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// use defined packages
require("./dbModel/DB_Connection");
const validateCache = require("./middleware/auth");
const userModel = require("./dbModel/User");
const auth = require("./middleware/auth");

// server instances || config
const server = express();
const PORT = process.env.PORT || 8080;


// middlewares
server.use(cors());
server.use(express.json());
server.use(session({
 secret: "portpro",
 resave: false,
 saveUninitialized: true,
 cookie: { secure: false }
}));
server.use(passport.initialize());
server.use(passport.session());
passport.use(new LocalStrategy((username, password, done) => {
  userModel.findOne({ email: username }, function (err, user) {
   if (err) { return done(err); }
   if (!user) { return done(null, false, {message:"Username didnt matched !"}); }
   if (!user.password === password) { return done(null, false, { message: "Password didnt matched !" }); }
   return done(null, user);
  });
 }
));
passport.serializeUser((user, done) => {
 if (user) {
  return done(null, user.id);
 }
 return done(null, false);
})
passport.deserializeUser((id, done) => {
 userModel.findById(id, (err, user) => {
  if (err) return done(null, false)
  return done(null, user);
 })
})


// routes endpoints
server.get("/", (req, res) => {
 console.log("server started...")
 res.status(200).send("Server has started succesfully ! ");
});

server.post("/twitter/signup",async (req, res) => {
 const { username, password } = req.body;
 
 try {
  const data = await new userModel({
   username: username,
   password: password,
   createdOn:new Date().toLocaleDateString()
  });
  const result = data.save();
  res.status(200).send({
   message: "User registered successfully !!"
  });
 } catch (error) {
  res.status(500).send({
   message: "Failed to registered user !!"
  });
 }
});

server.post("/twitter/login", passport.authenticate('local'), (req, res) => {
 res.status(200).send({
  token: auth.generateToken1(req.user.username, req.user.password),
  message: "Login successfully !!"
 });
});

server.post("/twitter/socialAuth", async (req, res) => {
  const { username } = req.body
  
try {
  const result = await userModel.findOne({ username: username });
  res.status(200).send({
    token: auth.generateToken2(username),
    message: "Login successfully !!"
  });
} catch (error) {
  res.status(404).send({
    token: null,
    message: "Failed to login !!"
  });
}
  
})

server.get("/twitter/validateCache", auth.verifyToken, (req, res) => {
 res.status(200).send("User verified !!");
});

server.get("/twitter/logout", auth.clearToken, (req, res) => {
 res.status(200).send("Logout succesfully !!");
});



// port listening
server.listen(PORT, () => {
 console.log(`Listening to the port ${PORT}`);
})

