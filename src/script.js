const getJSON = function() {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('get', 'http://localhost:3000/todos/', true);

        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 200 || status === 201) {
                resolve(xhr.response);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
}

const createJSON = function(data) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('post', 'http://localhost:3000/todos/', true);
        xhr.setRequestHeader(
            'Content-type', 'application/json; charset=utf-8'
        );

        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 201 || status === 200) {
                resolve(xhr.response);
            } else {
                reject('Status ' + status);
            }
        };
        xhr.onerror = function(e) {
            reject("Error fetching " + 'http://localhost:3000/todos/');
        };
        xhr.send(data);
    });
}

const updateJSON = function(id, data) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('put', 'http://localhost:3000/todos/'+id, true);
        xhr.setRequestHeader(
            'Content-type', 'application/json; charset=utf-8'
        );

        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 201 || status === 200) {
                resolve(xhr.response);
            } else {
                reject('Status ' + status);
            }
        };
        xhr.onerror = function(e) {
            reject("Error fetching " + 'http://localhost:3000/todos/');
        };
        xhr.send(data);
    });
}

const deleteJSON = function (id) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('delete', 'http://localhost:3000/todos/'+id, true);
        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 200) {
                resolve('Task deleted');
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
}

class TodoList {
    constructor(el) {
        this.el = el;
        this.todos = [];
        this.list = el.children[1];
        this.input = el.children[0].children[1];

        this.el.addEventListener('click', (event) => {
            let action = event.target.dataset.action;
            let item = event.target;

            switch (action) {
                case 'create-task':
                    if (this.input.value !== '') {
                        this.addTodo();
                    }
                    this.input.value = '';
                    break;
                case 'change-status':
                    this.changeStatus(+(item.closest('li').dataset.id));
                    break;
                case 'delete-task':
                    this.removeTodo(item.closest('li').dataset.id);
                    break;
            }
        })
    }

    async getTodos() {
        try {
            this.todos = await getJSON();
            this.renderTodos(this.todos);
            return this.todos;
        } catch (error) {
            console.warn(error);
        }
    }

    renderTodos(todos = []) {
        let list = '';
        for (let element of todos) {
            if (!element) {
                return;
            }
            let status = !element.status ? 'in-progress' : 'done';
            list += `<li class="${status}" data-id="${element.id}">${element.task}<button data-action="change-status">Change status</button><button data-action="delete-task">Delete</button></li>`;
        }
        this.list.innerHTML = list;
    }


    async addTodo() {
        try {
            let todo = JSON.stringify({
                task: this.input.value,
                status: false
            })
            let newTodo = await createJSON(todo);
            this.todos.push(newTodo);
            this.renderTodos(this.todos);
        } catch (error) {
            console.warn(error);
        }
    }

    async changeStatus(id) {
        try {
            let index = this.todos.findIndex(element => element.id === id);
            this.todos[index].status = !this.todos[index].status;
            await updateJSON(`${id}`, JSON.stringify({
                task: this.todos[index].task,
                status: !!this.todos[index].status
            }));
            this.renderTodos(this.todos);
        } catch (error) {
            console.warn(error);
        }
    }

    async removeTodo(id) {
        try {
            this.todos = this.todos.filter((el) => el.id !== id);
            await deleteJSON(`${id}`);
            await this.getTodos();
        } catch (error) {
            console.warn(error);
        }
    }
}

const list = document.getElementById('todo-List');
const todo1 = new TodoList(list);

todo1.getTodos();