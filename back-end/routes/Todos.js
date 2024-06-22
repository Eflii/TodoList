const express = require("express");
const path = require("path");
const { secured } = require("../utils/dbprotected");
const uuid = require("uuid");

const createTodoRouter = (TodoDatabase) => {
  const router = express.Router();
  const dbPath = path.join(__dirname, "../database.db");
  const Todo = new TodoDatabase(dbPath);
  const goodPath = path.join(__dirname, "../../front-end/views/index.html");

  router.get("/", (req, res) => {
    res.sendFile(goodPath);
  });

  router.get("/todos/:id", async (req, res) => {
    const todoId = req.params.id;
    const todo = await Todo.getTodoById(todoId);
    res.json(todo);
  });

  router.get("/todos", async (req, res) => {
    const todos = await Todo.getAllTodos();
    res.json(todos);
  });

  router.post("/todos", async (req, res) => {
    try {

      const todoJson = req.body.todoElement;
      const todoElem = TodoDatabase.deserialize(todoJson);
      todoElem.setTodoId(uuid.v4());
      const todo = await Todo.addTodo(todoElem);
      res.json(todo);
    } catch (err) {
      console.error("Error creating todo:", err);
      res.status(400).json({ error: "Invalid todo data" });
    }
  });

  router.delete("/todos/:id", secured, async (req, res) => {
    const todo = await Todo.deleteTodoById(req.params.id);
    res.json(todo);
  });

  router.put("/todos/:id", secured, async (req, res) => {
    const todo = await Todo.updateTodo(
      req.params.id,
      req.body.name,
      req.body.completed
    );
    res.json(todo);
  });

  return router;
};

module.exports = createTodoRouter;
