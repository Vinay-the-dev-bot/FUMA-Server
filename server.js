const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const app = express();
const cors = require("cors");
const { userModel, blackListModel } = require("./db.js");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { isAdmin } = require("./MiddleWares/isAdmin.middleware.js");
const tokenJWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth } = require("./MiddleWares/auth.MiddleWare.js");

app.use(express.json());
app.use(cors());
// app.use(morgan("combined"));
var accesStream = fs.createWriteStream(path.join(__dirname, "/log.txt"), {
  flags: "a",
});
app.use(
  morgan(":method :status :res[content.length] :response-time ms  :date :url", {
    stream: accesStream,
  })
);

app.get("/users", auth, isAdmin, async (req, res) => {
  const heroes = await userModel.find();
  res.send({ msg: heroes });
});

app.get("/users/:userId", async (req, res) => {
  const userID = req.params.userId;
  if (mongoose.Types.ObjectId.isValid(userID)) {
    const user = await userModel.findOne({ _id: userID });
    res.send({ msg: "User Found", user });
  } else {
    res.send({ msg: "Please send proper User ID" });
  }
});

app.get("/", async (req, res) => {
  res.send({ msg: "Welcome to Home" });
});

app.post("/users/register", (req, res) => {
  bcrypt.hash(req.body.password, 5, async (err, hashedPWD) => {
    if (err) {
      res.send({ msg: `${err}` });
    } else {
      try {
        const user = new userModel({ ...req.body, password: hashedPWD });
        await user.save();
        res.send({ msg: `${req.body.name}  was Registered` });
      } catch (error) {
        res.send({ msg: `${error}` });
      }
    }
  });
});

app.delete("/user/:userID", auth, isAdmin, async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete({
      _id: req.params.userID,
    });
    res.send({ msg: `User Deleted : ${user}` });
  } catch (error) {
    res.send({ msg: `${error}` });
  }
});

app.patch("/user/:userID", auth, isAdmin, async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      {
        _id: req.params.userID,
      },
      req.body,
      { new: true }
    );
    res.send({ msg: `User Updated : ${user}` });
  } catch (error) {
    res.send({ msg: `${error}` });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user === null) {
      res.send({ msg: "User Not Found" });
    } else {
      bcrypt.compare(req.body.password, user.password, async (err, result) => {
        if (result) {
          const token = tokenJWT.sign(
            { id: user._id },
            process.env.loginSecret
          );
          res.send({ msg: "Authenticated", user, token });
        } else {
          res.send({ msg: "Check Password Again" });
        }
      });
    }
  } catch (error) {
    res.send({ Error: `${error}` });
  }
  // res.send({ msg: "Authenticated", token: token, user: req.user });
});

app.get("/user/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const blm = new blackListModel({
      token: token,
    });
    await blm.save();
    res.send({ msg: "logged Out" });
  } catch (error) {
    res.send({ msg: `${error}` });
  }
});

app.listen(process.env.SERVER_PORT, async () => {
  await mongoose.connect(process.env.mongoURL);
  console.log(`Conectet to DB`);
  console.log(`Listening at ${process.env.SERVER_PORT}`);
});
