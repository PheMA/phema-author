var request = require('request');
//var phekbModule = require('../../../phekb-configuration');
var config = require('../../../config/phekb.json');
/* This is weird . Wasn't a phekbModule.UserRepository
var UserRepo = phekbModule.UserRepository;
Maybe this is better : */
var UserRepo = require('../../lib/user/phekb-user').UserRepository;
// Return a user if one is logged in -- the app sends the cookie which is stored with
// a user when they login. We find user with that cookie and return it.
exports.details= function(req,res){
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

};

exports.update = function(req, res) {
  res.status(501).send();
};

exports.add = function(req, res) {
  res.status(501).send();
};

exports.resources = function(req, res){
  var session = req.body.session;
  var uid = req.body.uid;
  var path = req.body.path;
  var url = config.phekbUrl + '/' +  path;
  request({url: url, headers: { Cookie: session} }, function(error, response, body) {
    if (!error) {
      if (body.length) {
        var data = JSON.parse(body);
        res.status(200).send(data);
      }
      else {
        res.status(200).send('Error: No data receieved');
      }
    }
    else {
      console.log("Error getting phekb resource:", error);
      res.status(200).send(error);
    }
  });
};
