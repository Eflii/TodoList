const todoContainer = document.querySelector(".todo-container")
const inputTodo = document.getElementById("input-todo")
const addTodo = document.getElementById("add-todo")
const modal = document.querySelector(".modal-background")
const closeModal = document.getElementById("close-modal")
const saveModal = document.getElementById("save-todo")
const editTodoName = document.getElementById("edit-todo-name")
const editTodoCompleted = document.getElementById("edit-todo-completed")

let todoArray = []

const URL = "http://localhost:8081/todos"


//get all todos at every reload 
async function get_todos() {
    try{
        const resp = await fetch(URL)
        const data = await resp.json()
        return data
    } catch (error){
        return error
    }
    
}

get_todos().then((todoArr) => {
  todoArray = todoArr
  console.log(todoArray)
  display_Todos(todoArray)
}).catch((err) => {
  console.log(err)
});



/*
* Display all todos elements
* @param {array} todoArr - all todos elements
*
*/
function display_Todos(todoArr) {
  todoArr.forEach((todoElem) => {
    console.log(todoElem);

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
      console.log("Open modal");
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
* Add a todo element
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
        name: inputTodo.value,
        completed: false,
      }),
    }
    const resp = await fetch(URL,options)
    const data = await resp.json()
    return data 
  } catch (err) {
    return err
    
  }
}

// get the result of the post request on + button click
addTodo.addEventListener("click", () => {
  inputTodo.value != "" ? post_todos() : null 

}


)

/*
* Delete a todo element
* @param todoElem - the todo element that will be delete
*/
async function del_Todo(todoElem){
  try {
    let options = {
      method: "DELETE"
    }
    const resp = await fetch(URL + `/${todoElem.id}`,options)
    const data = await resp.json()
    window.location.reload();
    return data 

  } catch (err) {
    return err
  }
}

function open_modal(TodoElem){
  modal.style.display = "flex";
  console.log(TodoElem)
  saveModal.addEventListener("click", () => {
    edit_Todos(TodoElem)
    modal.style.display = "none";
    window.location.reload();   
 }
)
}

async function edit_Todos(TodoElem) {
  try {
    editTodoName.value == "" ? editTodoName.value = TodoElem.name : null

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
    const resp = fetch(URL + `/${TodoElem.id}`, options)
    const data = resp.json()
    
    return data
  } catch (err) {
    return err
  }
  
}


// close modal on click 
closeModal.addEventListener("click", () =>
 {
  modal.style.display = "none";
 })