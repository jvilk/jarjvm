define(
  function() {
    "use strict";

    //Maps structs to byte size. Not utf8, though.
    var StructDataTypes = {
      'u1': 1,
      'u2': 2,
      'u4': 4,
      'u8': 8,
      'i1': 1,
      'i2': 2,
      'i4': 4,
      'long': 8,
      'utf8': 0,
      'float': 4,
      'double': 8
    };

    return StructDataTypes;
  }
);