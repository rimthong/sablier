
/*
 * GET home page.
 */

var Activity = require('../models/activity.js');

exports.index = function(req, res){
  console.log("invoking index");
  res.render('index', { title: 'Express' });
};

exports.activity = function(req, res){
  console.log("invoking activities");
  res.render('activity', {title:'Add Activity'});
};

exports.listActivities = function(req,res){
  //insert into mongo db
  Activity.find(function(err, activities){
    res.send(activities);
  });
};

exports.addActivity = function(req,res){
  //Parse string
  console.log(req.body.activity);
  
  //Parse out the tags
  var tagpat = /#(\w+)/g;
  var tagMatches = req.body.activity.match(tagpat);

  var timespent = 0;

  //Locate time hints
  var hourspat = /(\d) hour[s]?/;
  var timeMatches = req.body.activity.match(hourspat);
  var time = 0;

  if(timeMatches != null){
    time+=timeMatches[1];
  }

  new Activity({activity: req.body.activity, user:"alex", tags: tagMatches, hours:time}).save();
  res.send("ok");
};
