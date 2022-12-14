const User = require("../models/user");
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "charbelmansour005@gmail.com", //must be a gmail account ( service = gmail )
    pass: "encxvodkkuczlxdv", //must use app password generated from google
  },
});

/**
 * Logging the user in
 * using mongoose findOne( ) to find an email that matches the input
 */
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email }) // searching database for matching email
    .then((user) => {
      if (!user) {
        const error = new Error("");
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return res.status(401).json({ Error: "Wrong password." });
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
      // res.status(200).json({ token: token });
      console.log("signed in");
    })
    .catch((err) => {
      console.log(err);
      res
        .status(404)
        .json({ Error: "A user with this email could not be found." });
    });
};

/**
 * User signs up and a welcome message gets send to him
 */
exports.putSignup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation FAILED, Password or Email format is incorrect",
      error: errors.array(),
    });
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  User.findOne({ email: email }) // new user's email must be unique
    .then((userDoc) => {
      if (userDoc) {
        res.status(409).json({
          Conflict:
            "An existing Email address was found, please sign up using a different one.",
        });
        return console.log("Failed");
      }
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const authenticatedUser = new User({
          name: name,
          email: email,
          password: hashedPassword,
        });
        return authenticatedUser.save();
      });
    })
    .then(() => {
      res.status(200).json({
        Success: "Signed up!",
      });
      return transporter.sendMail({
        to: email,
        from: "employees@node-complete.com",
        html: "<h1>Welcome! Thank you for choosing us.</h1>",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};
