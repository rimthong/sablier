
/*
 * GET home page.
 */
var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

var openid = require('openid');
var user;
var Activity = require('../models/activity.js');
var extensions = [new openid.UserInterface(), 
                  new openid.SimpleRegistration(
                      {
                        "email" : true
                      }),
                  new openid.AttributeExchange(
                      {
                        "http://axschema.org/contact/email": "required"
                      })];

var relyingParty = new openid.RelyingParty(
    'http://sablier.herokuapp.com/', // Verification URL (yours)
    null, // Realm (optional, specifies realm for OpenID authentication)
    false, // Use stateless verification
    false, // Strict mode
    extensions); // List of extensions to enable and include


//Activity Rendering
exports.activity = function(req, res){
  relyingParty.verifyAssertion(req, function(error, result){
    if(error){
      res.render('login', {title: 'Please Provide Authentication'});
    } else {
      user = result;
      res.render('activity', {title:'Add Activity'});
    }
  });
};

//Update Activity
exports.updateActivity = function(req,res){
  if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
    var tags = [];
    if(req.body.tags){
      var tagstring = req.body.tags;
      tags = _.map(tagstring.toString().split(","), function(tag){ return _.trim(tag," #"); });
    }
    Activity.findOne({_id:req.body._id},function(err, activity) {
      if(activity){
        //Updating object
        activity.hours = req.body.hours;
        activity.activity = req.body.activity;
        activity.date = req.body.date;
        activity.tags = tags;
        activity.save(function(err) {
        });
      }
    });
    res.writeHead(200)
  }
};

//List activities
exports.listActivities = function(req,res){
   if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
    Activity.find({user:user.email}).sort('date',-1).execFind(function(err, activities){
      res.send(activities);
    });
  }
};

//List tags
exports.listTags = function(req,res){
   if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
    console.log('auth list activities achieved, result:'+JSON.stringify(user));
    Activity.collection.distinct('tags', {user:user.email},function(error, tags){
        res.send(tags);
    });
  }
};

//List filtered activities
exports.listFilteredActivities = function(req,res){
   if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
    console.log('filtered activities, tags:#'+req.params.tags);
    var tag = _.trim(req.params.tags, " #");
    console.log('treated tag:'+tag);
    //TODO support AND and OR see advanced queries
    Activity.find({user:user.email, tags:tag}).sort('date',-1).execFind(function(err, activities){
      res.send(activities);
    });
  }
};

//Report view of filtered activities
exports.reportFilteredActivities = function(req,res){
   if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
      res.render('report', {title:'Report', tags: req.params.tags});
  }
};

//Authenticate filter
exports.authenticate = function(req,res){
  var identifier = req.query['openid_identifier'];
  relyingParty.authenticate(identifier, false, function(error, authUrl){
    if(error){
      res.writeHead(200);
      res.end('Authentication failed');
    } else if (!authUrl){
      res.writeHead(200)
    } else {
      res.writeHead(302, { Location: authUrl });
      res.end();
    }
  });
};

//Delete Activity
exports.deleteActivity = function(req,res){
  if(!user){
    res.render('login', {title: 'Authentication Failed'});
  } else {
    Activity.findOne({_id:req.body._id},function(err, activity) {
      console.log('deleteing activity:'+JSON.stringify(activity))
      activity.remove();
    });
    res.writeHead(200)
    res.end();
  }
};

//Add activity
exports.addActivity = function(req,res){
  //Parse string
    if(!user){
      res.render('login', {title: 'Authentication Failed'});
    } else {
      console.log('add activity auth achieved, result:'+JSON.stringify(user));
      //Parse out the tags
      var tagpat = /#(\w+)/g;
      var tagMatches = _.map(req.body.activity.match(tagpat), function(tag){ return _.trim(tag," #"); });
      var timespent = 0;

      //Locate time hints
      var hourspat = /(\d?\.?\d+) hour[s]?/;
      var hoursMatches = req.body.activity.match(hourspat);
      var time = 0;

      if(hoursMatches == null){
        //try in french instead
        hourspat = /(\d?\.?\d+) heure[s]?/;
        hoursMatches = req.body.activity.match(hourspat);
      }

      if(hoursMatches != null){
        time+=hoursMatches[1];
      }

      new Activity({activity: req.body.activity, user:user.email, tags: tagMatches, hours:time}).save();
      res.writeHead(200)
    }
};
