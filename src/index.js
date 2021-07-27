const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  return next();
}

function checksExistsUserTask(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const tasks = user.todos;

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return response.status(404).json({error: "Task not found."});
  }

  request.task = task;
  
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const task = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  };

  request.user.todos.push(task);

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, checksExistsUserTask, (request, response) => {
  const { title, deadline } = request.body;
  const { task } = request;

  task.title = title;
  task.deadline = new Date(deadline);

  return response.json(task)
});

app.patch("/todos/:id/done", checksExistsUserAccount, checksExistsUserTask, (request, response) => {
  const { task } = request;

  task.done = true;

  return response.status(201).json(task);
});

app.delete("/todos/:id", checksExistsUserAccount, checksExistsUserTask, (request, response) => {
  const { user, task } = request;

  user.todos.splice(task.id, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
