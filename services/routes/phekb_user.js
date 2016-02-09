// Phekb_user routes 
var request = require('request');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var MONGO_CONNECTION = 'mongodb://localhost/phema-user';

var Schema = mongoose.Schema;


function nameValidator (v) {
  if (!v || typeof v === 'undefined') {
    return false;
  }

  return v.length >= 4;
}


var PhemaUser = new Schema({
  firstName: {
    type: String,
    require: false,
    //validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  lastName: {
    type: String,
    require: false,
    //validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  fullName: {
    type: String,
    require: false,
    //validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  email: {
    type: String,
    require: true,
  },
  password: { 
    type: String,
    require: true,
    default: 'abc123'
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
  }
  
});

// Phekb variables 
var ws_url = 'http://local.phekb.org';
var appid = 'phema_author';

var UserRepo = mongoose.model('PhemaUser', PhemaUser);

// MongoDB configuration
mongoose.connect(MONGO_CONNECTION, function(err) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});


function formatItemForReturn(item) {
    item.id =  item._id.toHexString();
    return item;
}



// callback has this signature : callback(error, result) 
function findUser(data, callback)
{
  var search = data;
  console.log(search);
  UserRepo.findOne(search, callback);
}

function addUser(data, callback) { 
  console.log("adding user to db"); 
  var item = new UserRepo(data);
  item.save(function(err, user) { 
    callback(err, formatItemForReturn(user));
  });
}



exports.login = function(req, res){
  res.set('Content-Type', 'application/json');
  var user_data = {email: req.body.email, password: req.body.password};
  login_phekb(res,user_data.email, user_data.password);
};

exports.register = function(req, res){
  console.log("In Register on Server . Set cookie and session");
   var user = null;
   var user_data = 
    {email: req.body.email, password: req.body.password, firstName: req.body.firstName, lastName: req.body.lastName};
   UserRepo.findOne({email: user_data.email}, function(err, cur_user) { 
    if (cur_user == null){ 
      var new_user = new UserRepo(user_data);
      new_user.save(function(err) { 
        if (err){
          console.log("Error registering: " + err);
          res.send({error: err, user: null})
        }
        else{
          var registration = {error: null, user: formatItemForReturn(new_user)};
          console.log("Regitsered user . Returning object: ", registration);
          res.send(registration);
        }
      });
    }
    else {
      var registration =  {error: "Email already registered", user: null};
      console.log("Error registering: ", registration)
      res.send(registration);
    }
   });
 };
    

exports.logout = function(req, res){
  console.log("In logout.");
  console.log(req.body);
  res.set('Content-Type', 'application/json');
  var retdata = {user: null };
  res.status(200).send(retdata);
    

};
// Return a user if one is logged in
exports.current_user= function(req,res){
  console.log('auth_user', req.body);
  var session = req.body.session;

  if (session) { 
    UserRepo.findOne({session: session}, function(err, cur_user) { 
      if (cur_user) { 
          res.send({user: cur_user});
      }
      else
      {
        console.log("No user for auth user ");
        res.send({user: null});
      }
    });
  }
  else {
    res.send({user: null});
  }
  
}



exports.phekb_resource = function(req, res){
  var session = req.body.session;
  var uid = req.body.uid;
  var path = req.body.path;
  var url = ws_url + '/' +  path;
  console.log("phekb_resource path: " + url);
  request({url: url, headers: { Cookie: session} }, function(error, response, body) {
    if (!error){
      console.log("Got phekb response ",body);
      if (body.length)
      {
        var data = JSON.parse(body); 
        console.log(data);
        res.status(200).send(data);
      }
      else
      {
        res.status(200).send('Error: No data receieved');
      }
      
    }
    else { 
      console.log("Error getting phekb resource:", error);
      res.status(200).send(error);
    }
          
  });
  
  // Returns {user: user, id:phenotype_id }
  
  /*

  console.log("In new phekb. Set cookie and session");
  console.log(req);
  var user_data = {email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName};
  var nid = req.body.nid;
  function start_new_phekb(err, user) {
    console.log("Start new phekb nid: " + nid + " User: ");
    console.log(user);
    res.redirect('/api/library/');
  }
  UserRepo.findOne({email: user_data.email}, function(err, user){
    if (user) {
      // Is nid available here? 
      console.log("Nid in find one callback " + nid);
      start_new_phekb(err,user);
    }
    else {
      addUser(user_data, start_new_phekb);
    }
  });
  */
/*
   res.set('Content-Type', 'application/json');
   var retdata = {user: { firstName: 'Peter', lastName: 'Peltz'}, id: null};
   res.status(200).send(retdata);
    */

};

function login_phekb(res,email, password)
{
  
  var url = ws_url + '/services/user/login';

  request.post({url: url, formData: {username: email, password: password}}, function(error, response, body) {
     
    body = JSON.parse(body);
    if (body.sessid)
    {
      console.log("Logged in in phekb", body.sessid);
      var session = body.session_name + "=" + body.sessid;
      var user_data = {session: session , sessid: body.sessid, session_name: body.session_name, uid: body.user.uid, email: email, fromSite: 'phekb.org', fullName: body.user.field_full_name.und[0].value};
      UserRepo.findOne({email: email}, function(err, cur_user) {
        console.log("Find user: ", err, cur_user);
        if (cur_user)
        { 
          // Record login 
          cur_user.lastLogin = Date.now();
          cur_user.session= user_data.session;
          cur_user.fromSite = 'phekb.org';
          cur_user.uid = user_data.uid;
          cur_user.save(function(err){
            if (err)
            {
              console.log("Login -- could not save user login time. Error: ", err);
            }
            else { 
              //console.log("Saved phekb login user ");
            }
            res.status(200).send({user: cur_user });
          });
        }
        else {
          // Add user 
          var new_user = new UserRepo(user_data);
          new_user.save(function(err) { 
            if (!err){
              res.status(200).send({user: new_user });
            }
            else {
              res.status(200).send({user:null});
            }
          });
        }
      });
    }
    else {
      console.log("No sessid");
      res.status(200).send({user: null });
    }
  });
}




