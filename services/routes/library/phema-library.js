var request = require('request');
var LibraryRepository = require('../../lib/library/phema-library').LibraryRepository;
var repository = new LibraryRepository(process.env.PHEMA_LIBRARY_URL);

exports.index = function(req, res){
  repository.getItems(function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

/**
 * Finds a library item by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  console.log("GET - /library/:id");
  repository.getItem(req.params.id, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
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
  var item = {
    name: req.body.name,
    description: req.body.description,
    definition: req.body.definition,
  };

  repository.addItem(item, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
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
  var item = {
    id: req.body.id,
    name: req.body.name,
    description: req.body.description,
    definition: req.body.definition,
  };

  repository.updateItem(item, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

exports.delete = function(req, res) {
  repository.deleteItem(req.params.id, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

/* phema access to phenotype - right now authenticated users have all access */
exports.access = function(req, res){
  var user = req.body.user;
  var nid = req.body.library_id;

  if (!user) {
      res.status(200).send({can_edit: false, error: 'Missing user'});
      return;
  }
  if (!user.session){
    res.status(200).send({can_edit: false, error: 'User not logged in'});
  }

  res.status(200).send({can_edit: true});
  return;
}