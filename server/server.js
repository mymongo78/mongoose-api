var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://192.168.0.5:27017/TodoApp');

var Todo = mongoose.model('Todo',{
    text:{
        type: String
    },
    completed:{
        type: Boolean
    },
    completedAt:{
        type: Number
    }
});

// var newTodo = new Todo({
//     text:'Cook dinner'
// });

// newTodo.save().then((doc)=>{
//     console.log('Saved todo',doc);
// },(e)=>{
//     console.log('Unable to save todo');
// });

var anotherTodo = new Todo({
    text:'Eat dinner',
    completed:true,
    completedAt: 12345
});

anotherTodo.save().then((doc)=>{
    console.log('Saved Todo',doc);
},(e)=>{
    console.log('Unable to save todo')
});