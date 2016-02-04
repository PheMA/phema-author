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
    require: true,
    validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  lastName: {
    type: String,
    require: true,
    validate: [nameValidator, 'The name must be at least 4 characters long']
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
  cookie: {
    type: String,
    default: ''
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
  /*UserRepo.findOne(user_data, function(err, cur_user) {
    console.log("Find user: ", err, cur_user);
    if (cur_user)
    { 
      // Record login 
      cur_user.lastLogin = Date.now();
      cur_user.save(function(err){
        if (err)
        {
          console.log("Login -- could not save user login time. Error: ", err);
        }
        else {
          console.log("saved user ");
        }
        res.status(200).send({user: cur_user });
      });
      
    }
    else {
      user_data.password = '';
      res.status(200).send({user:null});
    }

  });
*/
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
exports.auth_user= function(req,res){
  console.log('auth_user', req.body);
  var email = req.body.email;
  UserRepo.findOne({email: email}, function(err, cur_user) { 
    if (cur_user.cookie) { 
      console.log(cur_user.cookie);
      get_logged_in_user(res, cur_user.cookie);
    }
    else
    {
      res.send({user: null});
    }
  });
}

exports.new_phekb = function(req, res){
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
    console.log("Got phekb login ");
   console.log(body);
   body = JSON.parse(body);
   console.log("parsed body ", body);
   console.log(body.user.field_full_name);
    if (body.sessid)
    {
      console.log("Logged in in phekb", body.sessid);
      var cookie = body.session_name + "=" + body.sessid;
      var user_data = {cookie: cookie , sessid: body.sessid, session_name: body.session_name, email: email, fromSite: 'phekb.org', fullName: body.user.field_full_name.und[0].value};
      UserRepo.findOne({email: email}, function(err, cur_user) {
        console.log("Find user: ", err, cur_user);
        if (cur_user)
        { 
          // Record login 
          cur_user.lastLogin = Date.now();
          cur_user.cookie= user_data.cookie;
          cur_user.fromSite = 'phekb.org';
          cur_user.save(function(err){
            if (err)
            {
              console.log("Login -- could not save user login time. Error: ", err);
            }
            else { console.log("Saved phekb login user ");}
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

function get_logged_in_user(res,cookie)
{
  
  var url = ws_url + '/services/user/retrieve';

  request.post({url: url, headers: { Cookie: cookie} , formData: {username: email, password: password}}, function(error, response, body) {
   console.log("Got phekb user ");
   console.log(body);
    
  res.status(200).send({user: body});
          
  });
}
    
    /*if (response.error)
    {
      console.log(response.error);
      return response.error;
    }
    else
    {
      console.log("Success phekb login");
      service.currentUser = response.data.user;
      return service.currentUser;
    }*/


