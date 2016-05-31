/* phekb_library.js 
 * copied from the library apps /services/routes/library.js an tweaked to send data to phekb 

Test sending items via:

var xmlhttp = new XMLHttpRequest();
xmlhttp.open("POST", "/api/library");
xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xmlhttp.send(JSON.stringify({name:"Test", description:"Test item"}));

var xmlhttp = new XMLHttpRequest();
xmlhttp.open("DELETE", "/api/library/54bd1c12f22d3d5b00e437d1");
xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xmlhttp.send();
*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var request = require('request');

var phekb_url = 'http://local.phekb.org';
//var phekb_url = 'https://phekb.org';


function nameValidator (v) {
  if (!v || typeof v === 'undefined') {
    return false;
  }

  return v.length >= 4;
}

var LibraryItem = new Schema({
  name: {
    type: String,
    require: true,
    //validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  description: {
    type: String
  },
  definition: {
    type: Schema.Types.Mixed
  },
  created: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String
  },
  modified: {
    type: Date
  },
  modifiedBy: {
    type: String
  },
  deleted: {
    type: Date
  },
  deletedBy: {
    type: String
  },
  external: {
    type: Schema.Types.Mixed
  },
  user: { 
    type: Schema.Types.Mixed
  },
  image: {
    type: String
  }
});

function formatItemForReturn(item) {
  return {
    id: item._id.toHexString(),
    name: item.name,
    description: item.description,
    definition: item.definition,
    created: item.created,
    createdBy: item.createdBy,
    modified: item.modified,
    modifiedBy: item.modifiedBy,
    deleted: item.deleted,
    deletedBy: item.deletedBy,
    image: item.image,
    user : item.user,
    external: item.external
    
  };
}
// Must connect this way to have multiple connections in one node js app 
var libconn = mongoose.createConnection('mongodb://localhost/phema-library');
var LibraryRepository = libconn.model('LibraryItem', LibraryItem);

// MongoDB configuration
/*mongoose.connect(LIBRARY_CONNECTION, function(err) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});
*/

function saveToPhekb(item, params, res)
{
  // Params has all the form fields for a new item that are not saved in the mongo local 
  
  // If phekb save to phekb 
  // Todo -- add default groups 
    var id = 0;
    var phekb_save_url = phekb_url + '/services/phenotypes/node';
    if (item._id)
    {
      id = item._id.toHexString();
    }
    if (!item.user || !item.user.session)
    {
      console.log("No user to save to phekb.");
      res.send(formatItemForReturn(item)); // So we don't throw an error if phekb is out
      return false;
    }
    // It is possible that phekb initiated the authoring , in which case , we will have an nid in the item
    // We need to send this back to phekb so it can update 
    var nid = 0; // phekb's id 
    var uid = item.user.uid;
    
    if (!item.external ) { 
      item.external = {nid : 0 , url: phekb_url};
    }
    if (!item.name) {item.name = 'No Name'; }
    if (!item.description) {item.description = 'No Description'; }

    // Make drupal node for phekb 
    var nid = item.external.nid;
    var lang = 'und';
    console.log("Calling pheno access in save");
    var access = _get_pheno_access_type(item.user, nid);
    console.log("Saved access ", access);
    
    // Set up the drupal node.  For updates we just send the phema id and the image
    var node = { 
      "field_phema_author_id": {"und": [{"value": item.id}] },
    }
    var method = null; // For create it is POST , update it is PUT
    if (!nid) {
      // New phenotype gets all the required properties 
      method = 'POST';
      node = {
        "field_phema_author_id": {"und": [{"value": item.id}] },
        "title": item.name, 
        "type": 'phenotype',
        "language": 'und',
        "field_p_status": {"und": params.status},
        "field_owner_pgroup":{"und":{}}, 
        "field_view_pgroup": {"und": {}},
        "body":{"und":[{"summary":"","value":item.description, "format":"filtered_html"}]},
      };
      node.field_owner_pgroup.und[params.owner_group] = params.owner_group; 
      node.field_view_pgroup.und[params.view_group] = params.view_group; 
    }

    if (item.image) {
      node.field_phema_image = {"und": [{"value": item.image}]};
    }

    // If we have a nid then this is an update
    if (nid) {
      node.nid = nid;
      phekb_save_url = phekb_save_url + '/' + nid;
      method = 'PUT';
    }

    // Must get a token from drupal services 
    request.get({url: phekb_url + '/services/session/token', headers: { Cookie: item.user.session}}, 
      function (error, response, body) {
        console.log(error, body);
        if (!error) {
          // We got a token and we can Save node 
          var token = body;
          
          request({method: method, url: phekb_save_url, headers: { 'Content-type': 'application/json', 'Accept':'application/json', 
              'X-CSRF-Token': token, 'Cookie': item.user.session}, 
            json:{'node': node} }, 
            function (error, response, body) {
              //console.log("Saved Phenotype" , error, body); 
              
              if (!error && response.statusCode == 200) {
                // Drupal returns {nid: 222, uri: http://phekb.org/phenotype/.... } the phekb nid and url and such 
                item.external.nid  = body.nid; 
                item.external.url = phekb_url  + '/phenotype/'+item.external.nid;
                item.save(function(err) {
                  if(!err) { 
                   // In case phekb service is down we don't want app depending on it 
                   res.statusCode = 200;
                   res.send(formatItemForReturn(item));
                   return true;
                  } 
                  else { 
                    console.log("Error saving phekb return nid : " + err);
                    res.statusCode = 200;
                    res.send(formatItemForReturn(item)); // don't error out
                    return false;
                  }
                });
              }
            });
          }
          else {
            console.log("error getting token. Could not ", error);
            res.send(formatItemForReturn(item));
            return false;
          }
        } 
      );

    
  
}



exports.index = function(req, res){
  LibraryRepository.find({deleted: undefined }, function(err, items) {
    if (!err) {
      var formattedList = [];
      for (var index = 0; index < items.length; index++) {
        formattedList.push(formatItemForReturn(items[index]));
      }
      res.statusCode = 200;
      return res.send(formattedList);
    } else {
      res.statusCode = 500;
      console.log('Internal error(%d): %s',res.statusCode,err.message);
    return res.send({ error: 'Server error' });
    }
  });
};

exports.my_phenotypes = function(req, res) {

}
exports.group_phenotypes = function(req, res) {
	
}

/**
 * Finds a library item by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  console.log("GET - /library/:id");
  return LibraryRepository.findOne({_id: req.params.id, deleted: undefined }, function(err, item) {
    if(!item) {
      console.log('Not found');
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    if (!err) {
      res.statusCode = 200;
      return res.send(formatItemForReturn(item));
    }
    else {
      res.statusCode = 500;
      console.log('Internal error(%d): %s', res.statusCode, err.message);
      return res.send({ error: 'Server error' });
    }
  });
};

exports.image = function(req, res){
  console.log("GET - /image/:id");
  return LibraryRepository.findOne({_id: req.params.id, deleted: undefined }, function(err, item) {
    if(!item) {
      console.log('Not found');
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    if (!err) {
      res.statusCode = 200;
      if (item.image) {
        res.status(200).send('<img  width="1024" height="960" src="' + item.image + '">');
      }
      else {
        console.log('no image');
        res.status(404).send('');
      }
    }
    else {
      res.statusCode = 500;
      console.log('Internal error(%d): %s', res.statusCode, err.message);
      return res.send({ error: 'Server error' });
    }
  });
};

/**
 * Adds a library item
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.add = function(req, res) {
  console.log('POST - /library');
  var item = new LibraryRepository({
  });


  if (req.body.name)
  {
    item.name = req.body.name;
  }
  else 
  {
    item.name = "No Name";
  }
  if (req.body.description)
  {
    item.description = req.body.description;
  }
  else
  {
    item.description = "No description";
  }
  
  if (req.body.phekb)
  {
    item.phekb = req.body.phekb;
  }
  if (req.body.description)
  {
    item.description = req.body.description;
  }
  if (req.body.definition)
  {
    item.definition = req.body.definition;
    
  }
  if (req.body.external)
  {
    item.external = req.body.external;
    
  }
  if (req.body.user)
  {
    item.user = req.body.user;
  }
  if (req.body.image)
  {
    item.image = req.body.image;
  }
  
  if (req.body.createdBy !== null && (typeof req.body.createdBy) !== 'undefined') {
    item.createdBy = req.body.createdBy;
  }
  else {
    item.createdBy = '(Unknown)';
  }

  item.save(function(err) {
    if (err) {
      console.log('Error while saving library item: ' + err);
      res.statusCode = 400;
      res.send({ error:err });
      return;
    }
    else {
      
      // phekb custom -- send to phekb and save phekb data back in the item 
      saveToPhekb(item, req.body, res);

    }
  });
};

/**
 * Update a library item by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.update = function(req, res) {
  console.log("PUT - /library/:id");
  return LibraryRepository.findById(req.params.id, function(err, item) {
    if (!item) {
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    if (req.body.name !== null && (typeof req.body.name) !== 'undefined') {
      item.name = req.body.name;
    }
    if (req.body.description !== null && (typeof req.body.description) !== 'undefined') {
      item.description = req.body.description;
    }
    if (req.body.definition !== null && (typeof req.body.definition) !== 'undefined') {
      item.definition = req.body.definition;
    }
    if (req.body.modifiedBy !== null && (typeof req.body.modifiedBy) !== 'undefined') {
      item.modifiedBy = req.body.modifiedBy;
    }
    else {
      item.modifiedBy = '(Unknown)';
    }
    if (req.body.external)
    {
      item.external = req.body.external;
      
    }
    if (req.body.user)
    {
      item.user = req.body.user;
    }
    if (req.body.image)
    {
      item.image = req.body.image;
    }
    item.modified = Date.now();

    return item.save(function(err) {
      if(!err) {
        // phekb custom  send data to phekb and save phekb data in item 
        saveToPhekb(item,req.body,res);
       	


      
      } else {
        console.log('Internal error(%d): %s',res.statusCode,err.message);

        if(err.name === 'ValidationError') {
          res.statusCode = 400;
          return res.send({ error: 'Validation error' });
        } else {
          res.statusCode = 500;
          return res.send({ error: 'Server error' });
        }
      }
    });
  });
};

exports.delete = function(req, res) {
  console.log("DELETE - /library/:id");
  return LibraryRepository.findById(req.params.id, function(err, item) {
    if (!item) {
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    item.deleted = Date.now();
    if (req.body.deletedBy !== null && (typeof req.body.deletedBy) !== 'undefined') {
      item.deletedBy = req.body.deletedBy;
    }
    else {
      item.deletedBy = '(Unknown)';
    }

    return item.save(function(err) {
      if(!err) {
        console.log('Deleted');
        res.statusCode = 204;
        return res.send({ status: 'OK' });
      } else {
        if(err.name === 'ValidationError') {
          res.statusCode = 400;
          return res.send({ error: 'Validation error' });
        } else {
          res.statusCode = 500;
          return res.send({ error: 'Server error' });
        }
        console.log('Internal error(%d): %s',res.statusCode,err.message);
      }
      res.send({});
    });
  });
};


exports.properties = function(req,res) {
  
  console.log("Properties - api/library-properties");
  var session = req.query.session;
  //var token = req.body.token;
  
  if (! session) 
  {
    res.statusCode = 400;
    return res.send({error: 'No user session. You must login.'})
  }
  var terms_url = phekb_url + '/services/phenotypes/taxonomy_term'; 

  // Required properties and options for saving a phenotype to the phekb library
  var properties = {
    type: 'phenotype',
    owner_groups : [],
    view_groups : [],
    status : []
  }
  
  // Must get a token from drupal services 
  request.get({url: phekb_url + '/services/session/token', headers: { Cookie: session}}, 
    function (error, response, body) {
      if (error) {
        res.status(400).send({error: error});
        return;
      }
      var token = body;
      var headers = {
        'X-CSRF-Token': token, 
        'Cookie': session,
        'Content-Type': 'application/json'
      }

      var query = {parameters:{vid:'10'}} ; // Vocabulary id 10 is the phenotyping groups 
      request.get({url: terms_url, qs: query, headers: headers},
        function (error, response, body) {
          if (error) {
            res.status(400).send({error: error});
            return;
          }
          try{
            body = JSON.parse(body);
          } catch(e){
            console.log("Error parsing phekb response ", e)
            res.status(500).send({error_msg: "Error parsing phekb response " , error: e} );
            return;
          }
          body.sort(
            function(a,b) { 
              if (a.name < b.name ) return -1; 
              else if ( a.name > b.name ) return 1; 
              else return 0;
            });
          properties.owner_groups = body;
          properties.view_groups = body;
          
          // Get status 
          query.parameters.vid = 3;
          request.get({url: terms_url, qs: query, headers: headers},
            function (error, response, body) {
              if (error) {
                res.status(500).send({error: error});
                return;
              }
              try{
                body = JSON.parse(body);
              } catch(e){
                console.log("Error parsing phekb response ", e)
                res.status(500).send({error_msg: "Error parsing phekb response " , error: e} );
                return;
              }
              properties.status = body;

              res.status(200).send(properties);
            });
        });
    });
       
};

/* phema access to phenotype */
exports.pheno_access_type = function(req, res){

  var user = req.body.user;
  var nid = req.body.library_id;

  if (!user) {
      res.status(200).send({can_edit: false, error: 'Missing user'});
      return;
  }
  if (!nid) {
      res.status(200).send({can_edit: false, error: 'Missing node id : nid'});
      return;
  }
  

  if (!user.session){
    console.log("No user logged in");
    res.status(200).send({can_edit: false, error: 'User not logged in'});
  }

  // Must get a token from drupal services 

  request.get({url: phekb_url + '/services/session/token', headers: { Cookie: user.session}}, 
    function (error, response, body) {
      console.log("token response: " , error, body);
      if (!error) {
        // We got a token and we can Save node 
        var token = body;
        var method = 'POST';
        var phekb_access_url = phekb_url + '/services/phenotypes/phema_access/phema_access_type'
        //request({method: method, url: phekb_access_url, headers: { 'Content-type': 'application/json', 'Accept':'application/json', 
        var headers = { 
         //'Accept':'application/json', 
         'X-CSRF-Token': token, 
         'Cookie': user.session
        };
        request.post({ url: phekb_access_url, headers: headers, 
          formData:{'nid': nid} }, 
          function (error, response, body) {
            console.log("Got response from access" , error, body); 
            if (!error) {
              console.log('Access from phekb ', body);
              res.status(200).send(body);
              return;
            }
            else {
              console.log("Error response: " , error);
              res.status(500).send(error);
            }
            
          });
      }
      else {
        console.log("error getting token. Could not ", error);
        res.status(500).send(error);
        //return {can_edit: false, error: "Server error getting token"};
      }
    });
            
}
