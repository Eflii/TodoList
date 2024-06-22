const sqlite3 = require('sqlite3').verbose();
const Todo = require("../models/todo")

class TodoDatabase {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath);
    this.createTable();
  }

  createTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id STRING,
        name TEXT NOT NULL ,
        completed BOOLEAN DEFAULT 0
      )
    `);
  }

async addTodo(todo) {
  const { id, name, completed } = todo;
  return new Promise((resolve, reject) => {
    this.db.run(
      'INSERT INTO todos (id, name, completed) VALUES (?, ?, ?)',
      [id, name, completed ? 1 : 0],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

  async getTodoById(id){ 
    const uuidSchema = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$.")
    if (uuidSchema.test(id)){
        return new Promise((resolve, reject) => { 
            this.db.get( 
              'SELECT * FROM todos WHERE id = ?', 
              [id], 
              (err, row) => { 
               if (err) { 
                  reject(err); 
                } else { 
                  resolve(row); 
                } 
              } 
            ); 
      
          }); 
    } else{
        throw new Error('id is not in good format ')
    }

   

  } 

  async getAllTodos(){
    return new Promise((resolve, reject) => {
        this.db.all(
            'SELECT * FROM todos',
            (err,row) => {
                if(err){
                    reject(err)
                }else {
                    resolve(row);
                }
            }
        );
    });
  }

  async deleteTodoById(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM todos WHERE id = '${id}'`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve("todo deleted");
          }
        }
      );
    });
  }

  async updateTodo(id, name, completed){
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE todos SET name = '${name}', completed = ${completed ? 1 : 0} WHERE id = '${id}'`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve("todo updated");
          }
        }
      );
    });
  }

  // Sérialize an objet Todo in JSON
  static serialize(todo) {
    return JSON.stringify(todo);
  }

  // Whitelisted classes pour la désérialisation
  static get allowedClasses() {
    return {
      Todo
    };
  }


  // Deserialization protection 
  static deserialize(json) {
    const data = JSON.parse(json); // Parse the JSON string

    const className = 'Todo'; 
    if (className && this.allowedClasses[className]) {
      return new this.allowedClasses[className](data);
    } else {
      throw new Error('Invalid class for deserialization');
    }
  }
}

module.exports = TodoDatabase;
