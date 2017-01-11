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


exports.all = configuration;
exports.exporters = configuration.exporters;
exports.valueSetServices = configuration.valueSetServices;