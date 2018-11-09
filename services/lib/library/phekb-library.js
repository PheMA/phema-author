'use strict';
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


// Must connect this way to have multiple connections in one node js app 
var libconn = mongoose.createConnection(process.env.PHEKB_LIBRARY_DB_URL);
var LibraryRepository = libconn.model('LibraryItem', LibraryItem);

exports.LibraryRepository = LibraryRepository;