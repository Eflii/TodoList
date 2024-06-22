const express = require("express");
const router = express.Router();
const { hash, compare } = require("bcryptjs");
const UserDatabase  = require("../utils/UserDataBase"); // Importing the UserDatabase class for serialization
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require("../utils/token");
const path = require('path');
const { verify } = require("jsonwebtoken");


// Path to the directory where user data will be stored
const userDataDirectory = path.join(__dirname, "../database.db");
const userDB = new UserDatabase(userDataDirectory);


//loading page request 
const authPath = path.join(__dirname, "../../front-end/views/auth.html");
router.get("/authPage", (req, res) => {
    res.sendFile(authPath)
});

const loginPath = path.join(__dirname, "../../front-end/views/login.html");
router.get("/loginPage", (req, res) => {
    res.sendFile(loginPath)
});

const signupPath = path.join(__dirname, "../../front-end/views/signup.html");
router.get("/signupPage", (req, res) => {
    res.sendFile(signupPath)
});

// Sign Up request
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    // 1. check if user already exists
      const user = await userDB.getUserByUsername(username);

    // if user exists already, return error
    if (user)
      return res.status(500).json({
        message: "User already exists! Try logging in. 😄",
        type: "warning",
      });
    // 2. if user doesn't exist, create a new user
    // hashing the password

    const passwordHash = await hash(password, 10);

    // 3. save the user to the database
    // const newUser = new userDB(username, passwordHash);
    await userDB.addUser(username,passwordHash);

    // 4. send the response
    res.status(200).json({
      message: "User created successfully! 🥳",
      type: "success",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error creating user!",
      error,
    });
  }
});

// Sign In request
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    // 1. check if user exists
    const user = await userDB.getUserByUsername(username);

    // if user doesn't exist, return error
    if (!user)
      return res.status(500).json({
        message: "User doesn't exist! 😢",
        type: "error",
      });
    // 2. if user exists, check if password is correct
    const isMatch = await compare(password, user.password);

    // if password is incorrect, return error
    if (!isMatch)
      return res.status(500).json({
        message: "Password is incorrect! ⚠️",
        type: "error",
      });

    // 3. if password is correct, create the tokens
    const accessToken = createAccessToken(user.username);
    const refreshToken = createRefreshToken(user.username);

    // 4. put refresh token in database
    user.refreshToken = refreshToken;   
        try{
          await userDB.updateUser(user);

        }catch(err){
          console.logg(err)
        }


    // 5. send the response
    sendRefreshToken(res, refreshToken);
    sendAccessToken(req, res, accessToken);
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error signing in!",
      error,
    });
  }
});

// Sign Out request
router.post("/logout", (_req, res) => {
  // clear cookies
  res.clearCookie("refreshToken");
  return res.json({
    message: "Logged out successfully! 🤗",
    type: "success",
  });
});

// Refresh Token request
router.post("/refresh_token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
   
    // if we don't have a refresh token, return error
    if (!refreshToken)
      return res.status(500).json({
        message: "No refresh token! 🤔",
        type: "error",
      });

    // if we have a refresh token, you have to verify it
    const userId = await userDB.verifyRefreshToken(refreshToken);

    // if the refresh token is invalid, return error
    if (!userId)
      return res.status(500).json({
        message: "Invalid refresh token! 🤔",
        type: "error",
      });

    // if the refresh token is valid, create the new tokens
    const accessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);

    // update the refresh token in the database
    await userDB.updateRefreshToken(userId, newRefreshToken);

    // send the new tokens as response
    sendRefreshToken(res, newRefreshToken);
    return res.json({
      message: "Refreshed successfully! 🤗",
      type: "success",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error refreshing token!",
      error,
    });
  }
});

router.get("/getUsername", async (req, res) => {
  try{
    const accessToken  = req.cookies.accessToken;
    if (!accessToken)
      return res.status(500).json({
        type: "error",
        message: "Error getting username! no access token",
        error,
      });

      const username = verify(accessToken, process.env.ACCESS_TOKEN_SECRET).username;

   
    return res.json({
      username: username,
      type: "success",
    });
  }
  catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error getting username!",
      error,
    });
  }
})

module.exports = router;
