// createTodoRouter.js
const express = require('express');
const path = require('path');
const { secured } = require('../utils/dbprotected');
const uuid = require('uuid');
const {
  httpRequestDurationMicroseconds,
  numberOfRequests,
  inProgressRequests,
  dbQueryDurationMicroseconds,
  numberOfTodo,
} = require('../utils/metrics'); // Adjust the path as necessary

const createTodoRouter = (TodoDatabase) => {
  const router = express.Router();
  const dbPath = path.join(__dirname, "../database.db");
  const Todo = new TodoDatabase(dbPath);
  const goodPath = path.join(__dirname, "../../front-end/views/index.html");

  const wrap = (fn) => (...args) => fn(...args).catch(args[2]);

  router.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    inProgressRequests.inc();
    res.on('finish', () => {
      end({ route: req.route?.path || '', code: res.statusCode, method: req.method });
      inProgressRequests.dec();
      numberOfRequests.inc({ route: req.route?.path || '', code: res.statusCode, method: req.method });
    });
    next();
  });

  router.get("/", (req, res) => {
    res.sendFile(goodPath);
  });

  router.get("/todos/:id", wrap(async (req, res) => {
    const end = dbQueryDurationMicroseconds.startTimer();
    const todoId = req.params.id;
    const todo = await Todo.getTodoById(todoId);
    end();
    res.json(todo);
  }));

  router.get("/todos", wrap(async (req, res) => {
    const end = dbQueryDurationMicroseconds.startTimer();
    const todos = await Todo.getAllTodos();
    end();
    res.json(todos);
  }));

  router.post("/todos", wrap(async (req, res) => {
      console.log("add todo")
    try {
      const todoJson = req.body.todoElement;
      const todoElem = TodoDatabase.deserialize(todoJson);
      console.log("add todo", todoElem)

      todoElem.setTodoId(uuid.v4());
      const todo = await Todo.addTodo(todoElem);
      numberOfTodo.inc(); 
   

      res.json(todo);
    } catch (err) {
      res.status(400).json({ error: "Invalid todo data" });
    }
  }));

  router.delete("/todos/:id", secured, wrap(async (req, res) => {
    const todo = await Todo.deleteTodoById(req.params.id);
    res.json(todo);
  }));

  router.put("/todos/:id", secured, wrap(async (req, res) => {
    const todo = await Todo.updateTodo(
      req.params.id,
      req.body.name,
      req.body.completed
    );
    res.json(todo);
  }));

  return router;
};

module.exports = createTodoRouter;
