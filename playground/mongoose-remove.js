const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((res)=>{
//     console.log(res.result.ok);
//     console.log(res.result.n);    
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id:'589eae00303ac31dc4b6719c'}).then((doc)=>{
    console.log(doc);
});

Todo.findByIdAndRemove('589eae00303ac31dc4b6719c').then((doc)=>{
    console.log(doc);
});