// Phekb_user routes 
var request = require('request');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//var USER_CONNECTION = 'mongodb://localhost/phema-user';

var Schema = mongoose.Schema;


function nameValidator (v) {
  if (!v || typeof v === 'undefined') {
    return false;
  }

  return v.length >= 4;
}


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
  
});

// Phekb variables  todo config 

var phekb_url = 'http://local.phekb.org';
//var phekb_url = 'https://phekb.org';
// api_key must match the api key specified at phekb.org/admin/phema/config 
var api_key = 'abc123';
// Must connect this way to have multiple connections in one node js app 
var userconn = mongoose.createConnection('mongodb://localhost/phema-user');
var UserRepo = userconn.model('PhemaUser', PhemaUser);
//var UserRepo = mongoose.model('PhemaUser', PhemaUser);
/*
// MongoDB configuration
mongoose.connect(USER_CONNECTION, function(err) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});
*/

function formatItemForReturn(item) {
    item.id =  item._id.toHexString();
    return item;
}



exports.login = function(req, res){
  res.set('Content-Type', 'application/json');
  var user_data = {email: req.body.email, password: req.body.password};
  login_phekb(res,user_data.email, user_data.password);
};


exports.logout = function(req, res){
  console.log("In logout.");
  console.log(req.body);
  res.set('Content-Type', 'application/json');
  var retdata = {user: null };
  res.status(200).send(retdata);
    

};
// Return a user if one is logged in -- the app sends the cookie which is stored with 
// a user when they login. We find user with that cookie and return it.
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
  var url = phekb_url + '/' +  path;
  console.log("phekb_resource path: " + url);
  request({url: url, headers: { Cookie: session} }, function(error, response, body) {
    if (!error){
      //console.log("Got phekb response ",body);
      if (body.length)
      {
        var data = JSON.parse(body); 
        //console.log(data);
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

};

/* login with phekb 
 *  We pass the user name and password to phekb.org login service. On success we get back a  user object and session id we can 
 * store in the cookie on the front end. The angular app can request current_user($session)
 */
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function user_in_role(role, roles) {
  for (var key in roles)
  {
    if (roles[key] == role) { return true;}
  }
  return false;
}
function login_phekb(res,email, password)
{
  console.log("Login phekb : ", email, password);
  
  var url = phekb_url + '/services/remote_login/login';
  // If we are logging in via a sid , a long hash , passed in from drupal then the url is login_sid
  var data = {username: email, api_key: api_key};
  if (password.length > 36) {
      // We're logging in with a user session id instead of password
      url += '_sid';
      data.sid = password;
  }
  else
  {
    data.password = password;
  }
  
  request.post({url: url, formData: data}, function(error, response, body) {
    
    try{
      body = JSON.parse(body);
    } catch(e){
      console.log("Error parsing phekb response ", e)
      res.status(500).send({error_msg: "An internal error occurred on PheKB. Please try again later. " } );
      return;
    }
    if (body.sessid)
    {
      console.log(body);
      // This is the format that drupal wants it in the cookie for authenticated requests
      var session = body.session_name + "=" + body.sessid;
      var admin = false; 
      if ( user_in_role('administrator', body.user.roles) ) { admin = true; }

      // Temporary -- must be a phema_author or deny 
      if ( ! user_in_role('phema_author', body.user.roles) ) {
        res.status(403).send('Forbidden not a phema_author');
      } 

      var user_data = {session: session , sessid: body.sessid, session_name: body.session_name, admin: admin,
        uid: body.user.uid, fullName: body.user.field_full_name.und[0].value, email: body.user.mail, fromSite: 'phekb.org',  
        data : { roles: body.user.roles,  groups: body.user.field_user_pgroups.und, institution: body.user.field_user_institution.und[0].tid }
      };
      
      // Set admin if admin on phekb 
      console.log("user roles: " , user_data.data.roles);
      
      UserRepo.findOne({email: email}, function(err, cur_user) {
        console.log("Find user: ", err, cur_user);
        if (cur_user)
        { 
          // Record login 
          cur_user.lastLogin = Date.now();
          cur_user.session = user_data.session;
          cur_user.fromSite = 'phekb.org';
          cur_user.uid = user_data.uid;
          cur_user.data = user_data.data; // update their roles and such 
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
      }); // end find or add user to local db 
      
    }
    else {
      console.log("No sessid from phekb. Login failed: " , body);
      if (body.error) {
        res.status(200).send({user: null, error: body.error});
      }
      else
      {
        res.status(200).send({user: null, error: "Unknown error"});
      }
    }
  });
}


/* No registration . Register on PheKB.org 
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
 */


