const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '589dd748da16ec16540ebb22';

// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Todo.find({
//     _id:id
// }).then((todos)=>{
//     console.log('Todos :', todos);
// });

// Todo.findOne({
//     _id:id
// }).then((todo)=>{
//     console.log('Todo :', todo);
// });

// Todo.findById(id).then(todo=>{
//     if (!todo){
//         return console.log('Id not found');
//     }
//     console.log('Todo :',todo);
// }).catch((e)=>console.log(e));

var id = '589b3decde0b3219086fc284';
if (!ObjectID.isValid(id)){
    console.log('ID not valid');
}

User.findById(id).then((user)=>{
    if (!user){
        return console.log('Id not found');
    }
    console.log('User By Id', user);
}).catch((e)=>console.log(e));