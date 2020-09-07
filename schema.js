// The shapeType must be defined as either 'shape' or 'polygon'
global.shapeType = "shape";

const schema = {
  settings: require('./settings')(),
  mappings: require('./mappings/document'),
};

module.exports = schema;
