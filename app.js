const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const countEl = document.getElementById("count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");

let todos = loadTodos();
let filter = "all";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addTodo(title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  todos.push({ id: makeId(), title: trimmed, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function editTodo(id, newTitle) {
  const trimmed = newTitle.trim();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  if (!trimmed) {
    deleteTodo(id);
    return;
  }
  todo.title = trimmed;
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function getFilteredTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function startEditing(li, todo) {
  const titleEl = li.querySelector(".title");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "title-input";
  editInput.value = todo.title;
  titleEl.replaceWith(editInput);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    if (commit) editTodo(todo.id, editInput.value);
    else render();
  };

  editInput.addEventListener("blur", () => finish(true));
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
}

function render() {
  const filtered = getFilteredTodos();
  list.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;
    title.addEventListener("dblclick", () => startEditing(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", "削除");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, title, deleteBtn);
    list.appendChild(li);
  });

  emptyState.hidden = filtered.length !== 0;

  const remaining = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${remaining} 件残り`;

  clearCompletedBtn.hidden = todos.every((t) => !t.completed);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
