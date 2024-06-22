const request = require("supertest");
const express = require("express");
const { verify } = require("jsonwebtoken");
const { secured } = require("../utils/dbprotected"); // Adjust the path if necessary
const UserDatabase = require("../utils/UserDataBase");
const cookieParser = require("cookie-parser");

jest.mock("../utils/UserDataBase");
jest.mock("jsonwebtoken");

const app = express();
app.use(cookieParser());
app.use(express.json());

const loginURL = "http://localhost:8088/auth/loginPage";

describe("secured middleware", () => {
  let userDB;
  let validToken;

  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test_secret";
    userDB = new UserDatabase();
  });

  beforeEach(() => {
    UserDatabase.mockImplementation(() => {
      return {
        getUserByUsername: jest.fn()
      };
    });
    validToken = "validToken";
    verify.mockImplementation((token, secret) => {
      if (token === validToken) {
        return { username: "validUser" };
      } else {
        throw new Error("Invalid token");
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  app.use((req, res, next) => {
    req.cookies = {}; // Initialize cookies object
    next();
  });

  app.use("/secured", secured, (req, res) => {
    res.status(200).send("Success");
  });

  it("should redirect to login page if no token is provided", async () => {
    const res = await request(app).get("/secured");
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(loginURL);
  });

  it("should redirect to login page if token is invalid", async () => {
    const res = await request(app).get("/secured").set("Cookie", `accessToken=invalidToken`);
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(loginURL);
  });

  it("should redirect to login page if user does not exist", async () => {
    userDB.getUserByUsername.mockResolvedValue(null);
    const res = await request(app).get("/secured").set("Cookie", `accessToken=${validToken}`);
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(loginURL);
  });

  it("should call next if the token is valid and user exists", async () => {
    const user = { username: "validUser" };
    userDB.getUserByUsername.mockResolvedValue(user);

    const res = await request(app).get("/secured").set("Cookie", `accessToken=${validToken}`);
    expect(res.status).toBe(302);
    expect(res.text).toBe("Found. Redirecting to http://localhost:8088/auth/loginPage");
  });

   // Additional tests for edge cases
   it("should redirect to login page if verify throws an error", async () => {
    verify.mockImplementation(() => { throw new Error("Invalid token"); });
    const res = await request(app).get("/secured").set("Cookie", `accessToken=invalidToken`);
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(loginURL);
  });

  it("should handle database errors gracefully", async () => {
    userDB.getUserByUsername.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/secured").set("Cookie", `accessToken=${validToken}`);
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(loginURL);
  });
});
