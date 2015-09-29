var exporterConfig = [
  {
    name: "HQMF",
    description: "HL7 Health Quality Measure Format (HQMF)",
    invokeAs: 'function'
  },
  {
    name:"PhEMA (JSON)",
    description: "Native format created by the authoring tool",
    invokeAs: 'function'
  },
  {
    name: "KNIME",
    description: "Creates an executable KNIME workflow",
    invokeAs: 'program',
  }
];

exports.exporters = exporterConfig;