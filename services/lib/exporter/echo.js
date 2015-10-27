'use strict';

var EchoExporter = function() {
}

EchoExporter.prototype.echo = function(data) {
	return data;
}


exports.EchoExporter = EchoExporter;