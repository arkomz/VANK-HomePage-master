// related to database management and sets up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://kurnal:mthstrack2016@ds149984.mlab.com:49984/unite_development';
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

