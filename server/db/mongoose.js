var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://192.168.0.5:27017/TodoApp');

module.exports ={mongoose};