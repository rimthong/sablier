
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var mongoose = require('mongoose');

mongoose.connect('process.env.MONGOHQ_URL');

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

app.get('/', routes.activity);
app.get('/authenticate', routes.authenticate);

app.post('/activity', routes.addActivity);
app.post('/activities', routes.addActivity);
app.delete('/activity', routes.deleteActivity);
app.delete('/activities', routes.deleteActivity);

app.get('/activity', routes.listActivities);
app.get('/activities', routes.listActivities);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
