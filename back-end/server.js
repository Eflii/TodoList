const express = require("express");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

// Importing the routes
const createTodoRouter = require("./routes/Todos");
const authRouter = require("./routes/dbAuth");
const TodoDatabase = require("./utils/TodoDatabase");
const pictureRouter = require("./routes/pictures");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
const todoRouter = createTodoRouter(TodoDatabase);
app.use("/", todoRouter);
app.use("/auth", authRouter);
app.use("/", pictureRouter);
// Static files
app.use(express.static(path.join(__dirname, '../front-end')));

module.exports = app;
