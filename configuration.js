var configuration = {
  exporters: {
    "hqmf" : {
      name: "HQMF (XML)",
      description: "HL7 Health Quality Measure Format (HQMF)"
    },
    "hds-json" : {
      name: "HQMF (JSON)",
      description: "A JSON format (based on HQMF) that is supported by the Health Data Standards library"
    },
    "phema-json" : {
      name:"PhEMA (JSON)",
      description: "Native format created by the authoring tool"
    }
  },

  // You can add as many CTS2 endpoints as you want, but only one should be writable
  valueSetServices: {
    'vsac' : {
      title: 'NLM VSAC',
      writable: false
    },
    'phema' : {
      title: 'Local Value Sets',
      writable: true
    }
  }
};


/*
  The exported interfaces uses functions which make a copy each time it's called.  This way a caller
  may get the configuration data and further annotate it with internal details.

  Anything put in this file will be sent to the client, so don't include any potentially sensitive
  information or internal configurations (e.g., database passwords).

  For example, the exporters service will get the basic exporter configuration and then adds in path 
  and configuration information for how the exporter is called.  We never want that exposed, so we
  don't include it in this basic file.
*/

exports.all = function() {
  return JSON.parse(JSON.stringify(configuration));
};

exports.exporters = function() {
  return JSON.parse(JSON.stringify(configuration.exporters));
};

exports.valueSetServices = function() {
  return JSON.parse(JSON.stringify(configuration.valueSetServices));
};
