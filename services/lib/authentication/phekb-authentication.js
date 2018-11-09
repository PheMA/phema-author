'use strict';

var request = require('request');
var UserRepo = require('../user/phekb-user').UserRepository;


/* login with phekb
 *  We pass the user name and password to phekb.org login service. On success we get back a  user object and session id we can
 * store in the cookie on the front end. The angular app can request current_user($session)
 */
function inArray(needle, haystack) {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if(haystack[i] === needle) return true;
  }
  return false;
}

function user_in_role(role, roles) {
  for (var key in roles) {
    if (roles[key] === role) { return true; }
  }
  return false;
}

function login_phekb(res,email, password) {
  var url = process.env.PHEKB_URL + '/services/remote_login/login';
  // If we are logging in via a sid , a long hash , passed in from drupal then the url is login_sid
  var data = {username: email, api_key: process.env.PHEKB_API_KEY};
  if (password.length > 36) {
    // We're logging in with a user session id instead of password
    url += '_sid';
    data.sid = password;
  }
  else {
    data.password = password;
  }

  request.post({url: url, formData: data}, function(error, response, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      console.log('Error parsing phekb response ', e)
      res.status(500).send({error_msg: 'An internal error occurred on PheKB. Please try again later.' } );
      return;
    }

    if (body.sessid) {
      // This is the format that drupal wants it in the cookie for authenticated requests
      var session = body.session_name + '=' + body.sessid;
      var admin = false;
      if ( user_in_role('administrator', body.user.roles) ) { admin = true; }

      // Temporary -- must be a phema_author or deny
      /*if ( ! user_in_role('phema_author', body.user.roles) ) {
        res.status(403).send('Forbidden not a phema_author');
        return;
      }
      */

      var user_data = {session: session , sessid: body.sessid, session_name: body.session_name, admin: admin,
        uid: body.user.uid, fullName: body.user.field_full_name.und[0].value, email: body.user.mail, fromSite: 'phekb.local',
        data : { roles: body.user.roles,  groups: body.user.field_user_pgroups.und, institution: body.user.field_user_institution.und[0].tid }
      };

      // Set admin if admin on phekb
      UserRepo.findOne({email: email}, function(err, cur_user) {
        if (cur_user) {
          // Record login
          cur_user.lastLogin = Date.now();
          cur_user.session = user_data.session;
          cur_user.fromSite = 'phekb.local';
          cur_user.uid = user_data.uid;
          cur_user.data = user_data.data; // update their roles and such
          cur_user.save(function(err) {
            if (err) {
              console.log('Login -- could not save user login time. Error: ', err);
            }
            else {
              console.log('Saved phekb login user');
            }
            res.status(200).send({user: cur_user });
          });
        }
        else {
          // Add user
          var new_user = new UserRepo(user_data);
          new_user.save(function(err) {
            if (!err) {
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
      console.log('No sessid from phekb. Login failed: ', body);
      if (body.error) {
        res.status(200).send({user: null, error: body.error});
      }
      else {
        res.status(200).send({user: null, error: 'Unknown error'});
      }
    }
  });
}

exports.initialize = function() {
  // This function purposely left empty
}

exports.login = function(req, res){
  res.set('Content-Type', 'application/json');
  var user_data = {email: req.body.email, password: req.body.password};
  login_phekb(res,user_data.email, user_data.password);
};

exports.logout = function(req, res){
  console.log('In logout.');
  console.log(req.body);
  res.set('Content-Type', 'application/json');
  var retdata = {user: null };
  res.status(200).send(retdata);
};
