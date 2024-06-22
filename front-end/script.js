// const { todo } = require("node:test")

const todoContainer = document.querySelector(".todo-container")
const inputTodo = document.getElementById("input-todo")
const addTodo = document.getElementById("add-todo")
const modal = document.querySelector(".modal-background")
const closeModal = document.getElementById("close-modal")
const saveModal = document.getElementById("save-todo")
const editTodoName = document.getElementById("edit-todo-name")
const editTodoCompleted = document.getElementById("edit-todo-completed")
const darkModeBtn = document.querySelector(".DarkMode-btn")
let todoArray = []

const backendURL = "http://localhost:8088/todos"


/*
* Get all todos elements
*
*/
async function get_todos() {
    try {
        const resp = await fetch(backendURL);       
        const data = await resp.json();
        console.error("Fetched data is not an array:", data);
        return data;
    } catch (error) {
        console.error("Error fetching todos:", error);
        return []; // Return an empty array in case of error
    }
}

get_todos().then((todoArr) => {
  todoArray =todoArr
  display_Todos(todoArray)
}).catch((err) => {
  console.log(err)
});



/*
* Display all todos elements by creating them
* @param {array} todoArr - all todos elements
*
*/
function display_Todos(todoArr) {
  console.log(todoArr)
  todoArr.forEach((todoElem) => {

    // Parent
    let todo = document.createElement("div");
    todo.classList.add("todo");

    // Children
    let todoInfo = document.createElement("div");
    todoInfo.classList.add("todo-info");
    let todoBtn = document.createElement("form");
    todoBtn.classList.add("todo-btn");

    // Grand Children
    let todoCompleted = document.createElement("input");
    todoCompleted.classList.add("todo-completed");
    todoCompleted.setAttribute("type", "checkbox");
    todoCompleted.checked = todoElem.completed;
    let todoName = document.createElement("p");
    todoName.classList.add("todo-name");
    todoName.innerHTML = todoElem.name;

    let todoEdit = document.createElement("button");
    todoEdit.classList.add("todo-edit");
    todoEdit.innerHTML = "Edit";
    todoEdit.addEventListener("click", (e) => {
      e.preventDefault();
      open_modal(todoElem);
    });
    let todoDel = document.createElement("button");
    todoDel.classList.add("todo-delete");
    todoDel.innerHTML = "Delete";
    todoDel.addEventListener("click", (e) => {
      e.preventDefault();
      del_Todo(todoElem);
    });

    todoInfo.appendChild(todoCompleted);
    todoInfo.appendChild(todoName);
    todoBtn.appendChild(todoEdit);
    todoBtn.appendChild(todoDel);

    todo.appendChild(todoInfo);
    todo.appendChild(todoBtn);

    todoContainer.appendChild(todo);
  });
}

/*
* Call POST request to add a todo element
*
*/
async function post_todos(){
  try {
    let options = {
      method: "POST",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        todoElement: JSON.stringify({
          id: "",
          name: inputTodo.value,
          completed: false,
        }),
      }),
    }
    const resp = await fetch(backendURL,options)
    const data = await resp.json()
    return data 
  } catch (err) {
    return err
  }
}

// get the result of the post request on + button click
addTodo.addEventListener("click", () => {

  if (inputTodo.value != "") {
    inputTodo.value = post_todos();
  window.location.reload(); 

  }
})

/*
* Call the DELETE request to delete a todo element
* @param todoElem - the todo element that will be delete
*/
async function del_Todo(todoElem){
  try {
    console.log("delete", todoElem.id)
    let options = {
      method: "DELETE"
    }
    const resp = await fetch(backendURL + `/${todoElem.id}`,options)

    const data = await resp.json()

    window.location.reload();
    return data 
  } catch (err) {
    console.log(err)
      window.location.href = 'http://localhost:8088/auth/loginPage'
  }
}

/*
* Open modal panel and add event listener to the save button 
* @param todoElem - the todo element selected to be modify 
*
*/
function open_modal(TodoElem){
  modal.style.display = "flex";
  saveModal.addEventListener("click", () => {
 edit_Todos(TodoElem).then(data =>{
  if (data == "AuthProblem"){
    window.location.href = 'http://localhost:8088'
 }else {
  modal.style.display = "none";
  window.location.reload(); 
 }}
)

 })}

/*
* Call the PUT request to modify a specific todo element  
* @param todoElem - the todo element selected to be modify 
*
*/
async function edit_Todos(TodoElem) {
  try {
    if (editTodoName.value == ""){
      editTodoName.value = TodoElem.name
    }
    let options = {
      method: "PUT",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editTodoName.value,
        completed: editTodoCompleted.checked,
      }),
    }
    
    const resp = await fetch(backendURL + `/${TodoElem.id}`, options);
    let result;

    if (resp.url === "http://localhost:8088/auth/loginPage") {
      result = "AuthProblem";
    } else {
      result = await resp.json();
    }
    return result
 
  } catch (err) {
    return err    
  }
}


// close modal on click 
closeModal.addEventListener("click", () =>
 {
  modal.style.display = "none";
 })

 
// DarkMode button part 
darkModeBtn.addEventListener("click",() => {
  if(darkModeBtn.style.backgroundColor == "whitesmoke"){
    darkModeBtn.style.backgroundColor = "slategray"
    darkModeBtn.value = "Dark Mode"
    document.getElementsByTagName('body')[0].style.backgroundColor = "whitesmoke";
  }else {
    darkModeBtn.style.backgroundColor = "whitesmoke"
    darkModeBtn.value = "Light Mode"
    document.getElementsByTagName('body')[0].style.backgroundColor = "slategray";
  }
})