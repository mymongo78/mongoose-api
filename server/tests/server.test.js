const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos',()=>{
    it('should create a new todo',(done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e)=>done());
            });
    });

    it('should not create todo with invalid data',(done)=>{
        var text = '';
        request(app)
            .post('/todos')
            .send({text})
            .expect(400)
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e)=>done(e));
            });
    });
});

describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos:id',()=>{
    it('should return todo doc',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });
    it('should return 404 if todo not found',(done)=>{
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 for non-object ids',(done)=>{
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id',()=>{
    it('should remove a todo',(done)=>{
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                //query database using findById toNotExist
                //expect(null).toNotExist();
                Todo.findById(hexId).then((todo)=>{
                    expect(todo).toNotExist();
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('should return 404 if todo not found',(done)=>{
        var hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if objectID is inValid',(done)=>{
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id',()=>{
    it('should patch and return todo',(done)=>{
        var hexId = todos[1]._id.toHexString();
        var body = {
            text:'patch this todo 1',
            completed: true
        }
        request(app)
            .patch(`/todos/${hexId}`)
            .send(body)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(body.text);
                expect(res.body.completed).toBe(true);
                expect(res.body.completedAt).toBeA('number');
            })
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                Todo.findById(hexId).then((todo)=>{
                    if (!todo){
                        return res.status(404).send();
                    }
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBe(true);
                    expect(todo.completedAt).toBeA('number');
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('should clear completedAt when todo is not completed',(done)=>{
        var hexId = todos[1]._id.toHexString();
        var body = {
            text:'patch this todo 2',
            completed: false
        }
        request(app)
            .patch(`/todos/${hexId}`)
            .send(body)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(body.text);
                expect(res.body.completed).toBe(false);
                expect(res.body.completedAt).toNotExist();
            })
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                Todo.findById(hexId).then((todo)=>{
                    if (!todo){
                        return res.status(404).send();
                    }
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch((e)=>done(e));
            });
    });
});

describe('GET /users/me',()=>{
    it('should return user if authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });
    it('should return 401 if not authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users',()=>{
    it('should create a user',(done)=>{
        var email = 'example@example.com'
        var password = '123mnb!';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err)=>{
                if(err){
                    return done(err);
                }
                User.findOne({email}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                });
            });
    });
    it('should return validation errors if request invalid',(done)=>{
        var email = 'invalid';
        var password = 'invalid';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end(done);
    });
    it('should not create user if email in use',(done)=>{
        var email = 'andrew@example.com';
        var password = '123mnb!';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end(done);
    })
});

describe('POST /users/login',()=>{
    it('should login user and return auth token',(done)=>{
        request(app)
            .post('/users/login')
            .send({
                email:users[1].email,
                password:users[1].password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                User.findById(users[1]._id).then((user)=>{
                    expect(user.tokens[0]).toInclude({
                        access:'auth',
                        token:res.headers['x-auth']
                    });
                    done();
                }).catch((e)=>done(e));
            });
    });
    it('should reject invalid login',(done)=>{
        request(app)
            .post('/users/login')
            .send({
                email:users[1].email,
                password:users[1].password + '1'
            })
            .expect(400)
            .expect((res)=>{
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                User.findById(users[1]._id).then((user)=>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e)=>done(e));
            });
    });
});

describe('DELETE /users/me/token',()=>{
    it('should remove auth token on logout',(done)=>{
        request(app)
            .delete('/users/me/token')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                User.findById(users[0]._id).then((user)=>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e)=>done(e));
            });
    });
});