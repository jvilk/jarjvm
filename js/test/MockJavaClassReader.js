define(['util/Util', '../test/StructDataTypes', 'vm/Primitives'],
  function(Util, StructDataTypes, Primitives) {

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
      Util.typeValidation(type, value);
      name = name === undefined ? '' : name;
      var numBytes = type === 'utf8' ? value.length : StructDataTypes[type];
      Util.assert(numBytes > 0);

      //We convert these to a Long object, since we need to simulate them. :(
      if (type === 'long') {
        value = Primitives.getLongFromNumber(value);
      }

      this.data.push({'type': type, 'value': value, 'numBytes': numBytes, 'name': name});
    };

    MockJavaClassReader.prototype.getField = function(fieldType, fieldLength) {
      Util.assert(fieldLength > 0);
      var field = this.data[this.index];
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
      Util.assert(fieldLength < 8);
      return this.getField('i' + fieldLength, fieldLength);
    };

    MockJavaClassReader.prototype.getDoubleField = function() {
      return this.getField('double', 8);
    };

    MockJavaClassReader.prototype.getFloatField = function() {
      return this.getField('float', 4);
    };

    MockJavaClassReader.prototype.getUintField = function(fieldLength) {
      return this.getField('u' + fieldLength, fieldLength);
    };

    MockJavaClassReader.prototype.getLongField = function() {
      return this.getField('long', 8);
    };

    MockJavaClassReader.prototype.isEndOfFile = function() {
      return this.index === this.data.length;
    };

    return MockJavaClassReader;
  }
);