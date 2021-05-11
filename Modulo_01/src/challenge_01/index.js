const { request } = require('express');
const express = require('express')
const { v4: uuidv4 } = require("uuid")

const app = express();
const listOfUsers = []

app.use(express.json());

function checkExistsUserAccount(request, response, next){
    const { username } = request.headers;
    const user = listOfUsers.find((user) => user.username == username);

    if(!user)
        return response.status(404).json({ error: "User not found!"});

    request.user = user;

    return next();
}

app.post("/users", (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = listOfUsers.some((user) => user.username === username);

    if(userAlreadyExists)
        return response.status(400).json({ error: "Username already exists!"});

    listOfUsers.push({
        id: uuidv4(),
        name, 
        username, 
        todos: []
    });

    return response.status(201).send();
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const {user } = request;
    const todoOperation = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }

    user.todos.push(todoOperation);

    return response.status(201).json(user.todos);
})

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const {user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if(!todo)
        return response.status(404).json({ error: "Todo not found!"})

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo);
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const {user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if(!todo)
        return response.status(404).json({ error: "Todo not found!"})

    todo.done = true;

    return response.json(todo);
});

app.delete("/todo:id", checkExistsUserAccount, (request, response) => {
    const {user } = request;
    const { id } = request.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    if(todoIndex == -1)
        return response.status(404).json({ error: "Todo not found!"})

    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
})



app.listen(3333);