var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var PhemaUser = new Schema({
  fullName: {
    type: String,
    require: false,
    //validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  email: {
    type: String,
    require: true,
  },
  fromSite: {
    type: String,
    default: 'phema',
  },
  created: {
    type: Date,
    default: Date.now
  },
  admin: {
    type: Boolean
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  session: {
    type: String,
    default: ''
  }, 
  uid: {
    // User id from phekb or other system 
    type: Number,
    default: 0
  },
  data: {
    type: [Schema.Types.Mixed]
  }
  // 
});

// Must connect this way to have multiple connections in one node js app 
var userconn = mongoose.createConnection(process.env.PHEKB_USER_DB_URL);
var UserRepo = userconn.model('PhemaUser', PhemaUser);

exports.UserRepository = UserRepo;