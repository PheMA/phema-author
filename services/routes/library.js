/*
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

var request = require('request');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LibraryItem = new Schema({
  name: {
    type: String,
    require: true
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
  modified: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
})

var LibraryRepository = mongoose.model('LibraryItem', LibraryItem);

// MongoDB configuration
mongoose.connect('mongodb://localhost/phema-library', function(err, res) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});

exports.index = function(req, res){
  LibraryRepository.find({deleted: false }, function(err, items) {
    if (!err) {
      var formattedList = [];
      for (var index = 0; index < items.length; index++) {
        formattedList.push({ id: items[index]._id, name: items[index].name, description: items[index].description });
      }
      return res.send(formattedList);
    } else {
      res.statusCode = 500;
      console.log('Internal error(%d): %s',res.statusCode,err.message);
    return res.send({ error: 'Server error' });
    }
  });
};

/**
 * Finds a library item by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  //res.status(404).send({message: 'The API does not support this operation'});
  console.log("GET - /library/:id");
  return LibraryRepository.findOne({_id: req.params.id, deleted: false }, function(err, item) {
    if(!item) {
      console.log('Not found');
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    if (!err) {
      console.log('Found');;
      console.log(item);
      res.statusCode = 200;
      return res.send({ id: item._id, name: item.name, description: item.description, definition: item.definition });
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

  console.log(req.body);

  var item = new LibraryRepository({
    name: req.body.name,
    description: req.body.description,
    definition: req.body.definition,
  });

  item.save(function(err) {
    if (err) {
      console.log('Error while saving library item: ' + err);
      res.send({ error:err });
      return;
    }
    else {
      console.log("Library item created");
      return res.send({ status: 'OK', item:item });
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

    if (req.body.name != null) {
      item.name = req.body.name;
    }
    if (req.body.description != null) {
      item.description = req.body.description;
    }

    if (req.body.definition != null) {
      item.definition = req.body.definition;
    }

    return item.save(function(err) {
      if(!err) {
        console.log('Updated');
        return res.send({ status: 'OK', item:item });
      } else {
        if(err.name == 'ValidationError') {
          res.statusCode = 400;
          res.send({ error: 'Validation error' });
        } else {
          res.statusCode = 500;
          res.send({ error: 'Server error' });
        }
        console.log('Internal error(%d): %s',res.statusCode,err.message);
      }
      res.send(item);
    });
  });
};

exports.delete = function(req, res) {
  return LibraryRepository.findById(req.params.id, function(err, item) {
    if (!item) {
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }

    item.deleted = true;

    return item.save(function(err) {
      if(!err) {
        console.log('Deleted');
        return res.send({ status: 'OK' });
      } else {
        if(err.name == 'ValidationError') {
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