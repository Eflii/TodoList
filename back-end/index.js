const express = require("express")
const uuid = require("uuid")
const app = express()
const cors = require("cors")
const path = require('path'); 
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")
dotenv.config()

const PORT = 8088

//connection to MongoDB 
  
const connectionString =
  "mongodb+srv://admin:admin@todolistapp.tsfjlsw.mongodb.net/?retryWrites=true&w=majority&appName=TodoListApp";

  mongoose
  .connect(connectionString)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Got an error", err));

// importing the routes
const todosRouter = require("./routes/Todos");
const authRouter = require("./routes/auth");

app.use(express.json());
app.use(cors())

app.use(express.static(path.join(__dirname, '../front-end')));

goodPath = path.join(__dirname, "../front-end/views/index.html");
console.log(goodPath)
app.get("/", (req,res ) => {
    // res.json({msg: "Todo List Home Page"});
    res.sendFile(goodPath);
       
})

//get 1 particular todo element 
app.get("/todos/:id", (req,res) => {
    let todo = todos.filter((todo) => todo.id == req.params.id)
    res.json({msg: "get the todo : ", data: todo})
})

//get all todos elements 
app.get("/todos", (req,res) => {
    res.json(todos)
})

//create a todo element
app.post("/todos", (req,res) => {
    console.log(req.body);
    todos.push({id: uuid.v4(), ...req.body})
    res.json({msg: "create todo element", data: todos})
})

//delete a todo element
app.delete("/todos/:id", (req,res) => {
    let index = todos.findIndex((todo) => todo.id == req.params.id)
    todos.splice(index,1)
    res.json({msg:"delete todo element ", data: todos})
})

//modify 1 particular todo element  
app.put("/todos/:id", (req,res) => {
    let todo = todos.find((todo) => todo.id == req.params.id)

    if(todo) {
        todo.name = req.body.name;
        todo.completed = req.body.completed
        res.json({msg: "todo successfully modified ! 🥳", data: todos})
    }else{
        res.json({msg: "todo not found"})
    }
})

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})