define(['Util'],
  function(Util) {

    DataTypes = {
      Uint: 0,
      Int: 1,
      Byte: 2,
      UTF8: 3,
      Double: 4,
      Float: 5
    };

    function MockJavaClassReader() {
      this.data = [];
      this.offset = 0;
      this.index = 0;
    }

    MockJavaClassReader.prototype.addUint = function(numBytes, value) {
      this.addField(DataTypes.Uint, numBytes, value);
    };

    MockJavaClassReader.prototype.addInt = function(numBytes, value) {
      this.addField(DataTypes.Int, numBytes, value);
    };

    MockJavaClassReader.prototype.addUTF8String = function(string) {
      //TODO: string length != byte length for utf8.
      this.addField(DataTypes.UTF8, value.length, value);
    };

    MockJavaClassReader.prototype.getOffset = function() {
      return this.offset;
    };

    MockJavaClassReader.prototype.addFloatField = function(numBytes, value) {
      this.addField(DataTypes.Float, numBytes, value);
    };

    MockJavaClassReader.prototype.addDoubleField = function(numBytes, value) {
      this.addField(DataTypes.Double, numBytes, value);
    };

    MockJavaClassReader.prototype.addField = function(type, numBytes, value) {
      this.data.push({'type': type, 'value': value, 'numBytes': numBytes});
    };

    MockJavaClassReader.prototype.getField = function(fieldType, fieldLength) {
      var field = this.data[this.offset];
      this.offset += fieldLength;
      this.index++;
      Util.assert(field.type === fieldType);
      Util.assert(field.numBytes === fieldLength);
      return field;
    };

    MockJavaClassReader.prototype.getUTF8Field = function(fieldLength) {
      return this.getField(DataTypes.UTF8, fieldLength);
    };

    MockJavaClassReader.prototype.getIntField = function(fieldLength) {
      return this.getField(DataTypes.Int, fieldLength);
    };

    MockJavaClassReader.prototype.getDoubleField = function(fieldLength) {
      return this.getField(DataTypes.Double, fieldLength);
    };

    MockJavaClassReader.prototype.getFloatField = function(fieldLength) {
      return this.getField(DataTypes.Float, fieldLength);
    };

    MockJavaClassReader.prototype.getUintField = function(fieldLength) {
      return this.getField(DataTypes.Uint, fieldLength);
    };

    return MockJavaClassReader;
  }
);