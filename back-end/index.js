const express = require("express")
const uuid = require("uuid")
const app = express()

const port = 8081

const todos = [{
    id: 1,
    name: "Create a todo App ", 
    completed: true,
},
{
    id: 2,
    name: "Eat something in a few hours",
    completed: false,
},
{
    id:3,
    name: "Be better as a software engineer at the end of Erasmus ",
    completed: "false"
}]

app.use(express.json());

app.get("/", (req,res ) => {
    res.json({msg: "Todo List Home Page"});
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

//create all todo element
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