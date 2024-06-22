const request = require("supertest");
const express = require("express");
const createTodoRouter = require("../routes/Todos"); // Adjust the path if necessary
const TodoDatabase = require("../utils/TodoDatabase");
const { sign } = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Todo = require("../models/todo")
jest.mock("../utils/TodoDatabase", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAllTodos: jest.fn(),
      getTodoById: jest.fn(),
      addTodo: jest.fn(),
      deleteTodoById: jest.fn(),
      updateTodo: jest.fn(),
    };
  });
});

describe("Todo Endpoints", () => {
  let app;
  let accessToken;
  let refreshToken;

  const createAccessToken = (username) => {
    return sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "60m",
    });
  };

  const createRefreshToken = (username) => {
    return sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "90d",
    });
  };

  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test_secret";
    process.env.REFRESH_TOKEN_SECRET = "refresh_secret";
  });

  beforeEach(() => {
    const todoItem = new Todo({ id: "1", name: "Test Todo", completed: false })

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    const todoRouter = createTodoRouter(TodoDatabase);
    app.use("/", todoRouter);
    TodoDatabase.mockClear();
    TodoDatabase.mockImplementation(() => {
      return {
        getAllTodos: jest.fn().mockResolvedValue([{ id: "1", name: "Test Todo", completed: false },{ id: "2", name: "new Todo", completed: false }]), // Corrected mock
        getTodoById: jest.fn().mockResolvedValue({ id: "1", name: "Test Todo", completed: false }),
        addTodo: jest.fn().mockResolvedValue({ id: "1", name: "New Todo", completed: false }),
        deleteTodoById: jest.fn().mockResolvedValue({ message: "Todo deleted" }),
        updateTodo: jest.fn().mockResolvedValue({ id: "1", name: "Updated Todo", completed: true }),
        deserialize: jest.fn().mockImplementation(() => todoItem)
        // deserialize: jest.fn().mockImplementation(todoData => TodoDatabase.deserialize(todoData)) // Mocking deserialize function

      };
    });
    accessToken = createAccessToken("hugo");
    refreshToken = createRefreshToken("hugo");
    const Tododb = new TodoDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("first test to start", async () => {

   
    expect(true).toBe(true);

  });

  // it("shouldreturn main page", async () => {

  //   const res = await request(app).get("/");
  //   console.log(res.body)

  //   expect(res.status).toBe(200);

  //   expect(Array.isArray(res.body)).toBe(true);
  //   expect(res.body.length).toBeGreaterThan(0);
  // });

  it("should get all todos", async () => {

    const res = await request(app).get("/todos");

    expect(res.status).toBe(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get one todo by id", async () => {
    const todo = { id: "1", name: "Test Todo", completed: false };

    const res = await request(app).get(`/todos/${todo.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(todo);
  });

  it("should create a new todo", async () => {
    const newTodo = { name: "New Todo", completed: false }; // Corrected structure


    const res = await request(app)
      .post("/todos")
      .send({ todoElement: JSON.stringify(newTodo) })
      .set('Content-Type', 'application/json'); // Ensure Content-Type is set

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining(newTodo)); // Adjust for ID being generated
  });

  it("should delete one todo", async () => {
    const responseMessage = { message: "Todo deleted" };

    const res = await request(app)
      .delete("/todos/1")
      .set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(responseMessage);
  });

  it("should update a todo", async () => {
    const updatedTodo = { id: "1", name: "Updated Todo", completed: true };

    const res = await request(app)
      .put("/todos/1")
      .send({ name: "Updated Todo", completed: true })
      .set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTodo);
  });

  it("should redirect to login if no token is provided for delete", async () => {
    const res = await request(app).delete("/todos/1");
    expect(res.status).toBe(302);
    expect(res.header.location).toBe("http://localhost:8088/auth/loginPage");
  });

  it("should redirect to login if no token is provided for update", async () => {
    const res = await request(app).put("/todos/1").send({ name: "Updated Todo", completed: true });
    expect(res.status).toBe(302);
    expect(res.header.location).toBe("http://localhost:8088/auth/loginPage");
  });
});
