define(['util/Util', '../test/StructDataTypes'],
  function(Util, StructDataTypes) {

    function MockJavaClassReader() {
      this.data = [];
      this.offset = 0;
      this.index = 0;
    }

    MockJavaClassReader.prototype.getOffset = function() {
      return this.offset;
    };

    MockJavaClassReader.prototype.addField = function(type, value, name) {
      Util.assert(type in StructDataTypes && 'addField is only used for primitives.');
      name = name === undefined ? '' : name;
      var numBytes = type === 'utf8' ? value.length : StructDataTypes[type];
      this.data.push({'type': type, 'value': value, 'numBytes': numBytes, 'name': name});
    };

    MockJavaClassReader.prototype.getField = function(fieldType, fieldLength) {
      var field = this.data[this.offset];
      this.offset += fieldLength;
      this.index++;
      Util.assert(field.type === fieldType);
      Util.assert(field.numBytes === fieldLength);
      return field.value;
    };

    MockJavaClassReader.prototype.getUTF8Field = function(fieldLength) {
      return this.getField('utf8', fieldLength);
    };

    MockJavaClassReader.prototype.getIntField = function(fieldLength) {
      return this.getField('i' + fieldLength, fieldLength);
    };

    MockJavaClassReader.prototype.getDoubleField = function(fieldLength) {
      return this.getField('double', fieldLength);
    };

    MockJavaClassReader.prototype.getFloatField = function(fieldLength) {
      return this.getField('float', fieldLength);
    };

    MockJavaClassReader.prototype.getUintField = function(fieldLength) {
      return this.getField('u' + fieldLength, fieldLength);
    };

    return MockJavaClassReader;
  }
);