class Todo {
    constructor(todo) {
      this.id = todo.id;
      this.name = todo.name;
      this.completed = todo.completed;
    }
    
    setTodoId(id){
        this.id = id
    }
    
  }

 module.exports = Todo;