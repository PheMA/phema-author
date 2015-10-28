'use strict';

//-----------------------------------------------------------------------------
// EchoExporter
// This is a _very_ simple exporter, which just takes the data it's given and
// delivers it right back.  This is used for when we want to allow the user
// to export the file in its original format.
//
// The reason we go through this hassle is so that we fit within the exporter
// framework, which typically will call external functions or processes.
//-----------------------------------------------------------------------------

var EchoExporter = function() {
}

EchoExporter.prototype.echo = function(data) {
	return data;
}


exports.EchoExporter = EchoExporter;