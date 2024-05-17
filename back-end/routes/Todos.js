const express = require("express")
const mongoose = require("mongoose")
const path = require('path'); 
const { secured } = require("../utils/protected");
const app = express()
const router = express.Router();
const uuid = require("uuid")

const TodoSchema = new mongoose.Schema({
    id: String,
    name: String,
    completed: Boolean,
  });
const Todo = mongoose.model("Todo", TodoSchema);

const goodPath = path.join(__dirname, "../../front-end/views/index.html");

router.get("/", (req,res ) => {
    res.sendFile(goodPath);
       
})


//get 1 particular todo element 
router.get("/todos/:id", async (req, res) => {
    const todo = await Todo.findOne({id: req.params.id});
    res.json(todo);
  });

//get all todos elements 
router.get("/todos",  async (req, res) => {
    const todos = await Todo.find({});
    res.json(todos);
  });
  

//create a todo element
router.post("/todos", async (req, res) => {
  const todo = await Todo.create({id: uuid.v4(), ...req.body});
  res.json(todo);
});

//delete a todo element
router.delete("/todos/:id", secured, async (req, res) => {
    
    const todo = await Todo.findOneAndDelete({id: req.params.id});
    res.json(todo);
  });

//modify 1 particular todo element  
router.put("/todos/:id", secured,  async (req, res) => {
    const todo = await Todo.findOneAndUpdate({id: req.params.id}, req.body);
    res.json(todo);
  });

module.exports = router;