var request = require('request');
var LibraryRepository = require('../lib/library').LibraryRepository;
var repository = new LibraryRepository('http://localhost:8082');

// Write images files to public directory on save 
var fs = require('fs');

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

exports.image = function(req, res){
  console.log("GET - /image/:id" + req.params.id);
  repository.getItem(req.params.id, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }

    else {
      // defaults to html for string 
      //res.set('Content-Type', 'text/html');
      if (data.image) {
        res.status(200).send('<img  width="300" height="200" src="' + data.image + '">');
        
      }
      else {
        console.log('no image');
        res.status(404).send('');
      }
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
    createdBy: req.body.createdBy,
    external: req.body.external,
    user: req.body.user,
    image: req.body.image
  };

  

  repository.addItem(item, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      /* this didn't work. 
      var image_path = 'public/images/'+data.id + '.png';
      fs.writeFile(image_path, data.image);
      */
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
    modifiedBy: req.body.modifiedBy,
    external: req.body.external,
    user: req.body.user,
    image: req.body.image,

  };

  repository.updateItem(item, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      /* this no work :( )
      var image_path = 'public/images/'+data.id + '.png';
      fs.writeFile(image_path, data.image);
      */
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
