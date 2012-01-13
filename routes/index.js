
/*
 * GET home page.
 */
var openid = require('openid');
var user;
var Activity = require('../models/activity.js');
var extensions = [new openid.UserInterface(), 
                  new openid.SimpleRegistration(
                      {
                        "nickname" : true, 
                        "email" : true, 
                        "fullname" : true,
                        "dob" : true, 
                        "gender" : true, 
                        "postcode" : true,
                        "country" : true, 
                        "language" : true, 
                        "timezone" : true
                      }),
                  new openid.AttributeExchange(
                      {
                        "http://axschema.org/contact/email": "required",
                        "http://axschema.org/namePerson/first": "required",
                        "http://axschema.org/namePerson/last": "required"
                      })];
var relyingParty = new openid.RelyingParty(
    'http://sablier.herokuapp.com/', // Verification URL (yours)
    null, // Realm (optional, specifies realm for OpenID authentication)
    false, // Use stateless verification
    false, // Strict mode
    extensions); // List of extensions to enable and include

exports.activity = function(req, res){
  relyingParty.verifyAssertion(req, function(error, result){
    if(error){
      console.log('auth failed activity, error:'+JSON.stringify(error));
      res.render('login', {title: 'Please Provide Authentication'});
    } else {
      user = result;
      console.log('auth achieved activity, result:'+JSON.stringify(result));
      res.render('activity', {title:'Add Activity'});
    }
  });
};

exports.updateActivity = function(req,res){
  if(!user){
    console.log('update activity auth failed, error:'+JSON.stringify(error));
    res.render('login', {title: 'Authentication Failed'});
  } else {
    Activity.findOne({_id:req.body._id},function(err, activity) {
      if(activity){
        // do your updates here
        activity.hours = req.body.hours;
        activity.activity = req.body.activity;
        activity.date = req.body.date;

        activity.save(function(err) {
        });
      }
    });
    res.send('ok');
  }
};

exports.listActivities = function(req,res){
   if(!user){
    console.log('auth failed list activities, error:'+JSON.stringify(error));
    res.render('login', {title: 'Authentication Failed'});
  } else {
    console.log('auth list activities achieved, result:'+JSON.stringify(user));
    Activity.find({user:user.email}).sort('date',-1).execFind(function(err, activities){
      res.send(activities);
    });
  }
};

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

exports.deleteActivity = function(req,res){
  if(!user){
    console.log('delete activity auth failed, error:'+JSON.stringify(error));
    res.render('login', {title: 'Authentication Failed'});
  } else {
    Activity.findOne({_id:req.body._id},function(err, activity) {
      console.log('deleteing activity:'+JSON.stringify(activity))
      activity.remove();
    });
    res.send('ok');
  }
};

exports.addActivity = function(req,res){
  //Parse string
    if(!user){
      console.log('add activity auth failed, error:'+JSON.stringify(error));
      res.render('login', {title: 'Authentication Failed'});
    } else {
      console.log('add activity auth achieved, result:'+JSON.stringify(user));
      //Parse out the tags
      var tagpat = /#(\w+)/g;
      var tagMatches = req.body.activity.match(tagpat);

      var timespent = 0;

      //Locate time hints
      var hourspat = /(\d?\.?\d+) hour[s]?/;
      var hoursMatches = req.body.activity.match(hourspat);
      var time = 0;

      if(hoursMatches != null){
        time+=timeMatches[1];
      }

      new Activity({activity: req.body.activity, user:user.email, tags: tagMatches, hours:time}).save();
      res.send("ok");
    }
};
