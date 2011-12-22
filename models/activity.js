  var mongoose = require('mongoose');

  var Schema = mongoose.Schema;

  var activitySchema = new Schema({
    user : String
    ,  activity   : String
    , date    : { type: Date, default: Date.now }
    , tags  : [String]
    , hours : Number
  });

  module.exports = mongoose.model('Activity', activitySchema);
