const { verify } = require("jsonwebtoken");
const  UserDatabase  = require("./UserDataBase");
const path = require('path');

const loginURL = "http://localhost:8088/auth/loginPage";

// Path to the directory where user data will be stored
const userDataDirectory = path.join(__dirname, "../database.db");
const userDB = new UserDatabase(userDataDirectory);

const secured = async (req, res, next) => {
  // get the token from the header
  const authorization = req.cookies.accessToken;

  // if we don't have a token, redirect to login page
  if (!authorization)
    return res.redirect(loginURL);

  // verify the access token
  let userId;
  try {
    const decodedToken = verify(authorization, process.env.ACCESS_TOKEN_SECRET);
    userId = decodedToken.username;
  } catch {
    return res.redirect(loginURL);
  }
  // if the token is invalid or user doesn't exist, redirect to login page
  if (!userId || !(await userDB.getUserByUsername(userId))){
    return res.redirect(loginURL);

  }

  // if the user exists, add the user object to the request
  req.user = await userDB.getUserByUsername(userId);
  next();
};

module.exports =  {secured} ;
