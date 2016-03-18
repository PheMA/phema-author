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

//var phekb_url = 'http://local.phekb.org';
var phekb_url = 'https://phekb.org';


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

function saveToPhekb(item)
{
  // If phekb save to phekb 
  // Todo -- add default groups 
    var id = 0;
    var phekb_save_url = phekb_url + '/phema-author/ws/save';
    if (item._id)
    {
      id = item._id.toHexString();
    }
    // It is possible that phekb initiated the authoring , in which case , we will have an nid in the item
    // We need to send this back to phekb so it can update 
    var nid = 0; // phekb's id 
    var uid = 0;
    if (item.user) { 
      uid = item.user.uid;
    }
    else
    {
      console.log("No user when saving to phekb ");
    }
    if (!item.external ) { 
      item.external = {nid : 0 };
    }

    if (!item.name) {item.name = 'No Name'; }
    if (!item.description) {item.description = 'No Description'; }

    var phekb_data = {name: item.name, description: item.description, id: id , nid: item.external.nid, uid: uid};
    
    if (item.image) phekb_data.image = item.image;

    request.post({url: phekb_save_url, formData:phekb_data }, function (error, response, body) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        console.log("error parsing phekb response to saving phenotype ", e);
      }
     
      if (!error && response.statusCode == 200) {
        // Save the phekb nid and url and such 
        item.external.nid  = body.nid; 
        item.external.url = phekb_url + '/phenotype/'+item.external.nid;
        item.save(function(err) {
          if(!err) { 
           // In case phekb service is down we don't want app depending on it 
           //res.statusCode = 200;
           //res.send(formatItemForReturn(item));
           return true;
          } 
          else { 
            console.log("Error saving phekb return nid : " + err);
            //res.statusCode = 400;
            //res.send({ error:err });
            return true;
          }
        });
      }
    });
  
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
      console.log("Library item created");
      // phekb custom -- send to phekb and save phekb data back in the item 
      saveToPhekb(item);
      res.send(formatItemForReturn(item));

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
        saveToPhekb(item);
       	res.send(formatItemForReturn(item));


      
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


