
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var mongoose = require('mongoose');

mongoose.connect('mongodb://bushibytes:w00fw00f@staff.mongohq.com:10079/sablier');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/activity', routes.activity);
app.get('/activities', routes.activity);
app.get('/authenticate', routes.authenticate);

app.post('/activity/add', routes.addActivity);
app.post('/activities/add', routes.addActivity);

app.get('/activity/list', routes.listActivities);
app.get('/activities/list', routes.listActivities);

app.listen(PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
