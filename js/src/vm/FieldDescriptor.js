define(['util/Util'],
  function(Util) {
    "use strict";
    
    FieldDescriptor.fieldType = {
      BASE: "BASE",
      OBJECT: "OBJECT",
      ARRAY: "ARRAY"
    };

    FieldDescriptor.baseType = {
      BYTE:'B',
      CHAR: 'C',
      DOUBLE: 'D',
      FLOAT: 'F',
      INTEGER: 'I',
      LONG: 'L',
      SHORT: 'S',
      BOOLEAN: 'Z'
    };

    FieldDescriptor.baseTypeLookup = {
      'B': 0,
      'C': 1,
      'D': 2,
      'F': 3,
      'I': 4,
      'L': 5,
      'S': 6,
      'Z': 7
    };

    /**
     * Parses a FieldDescriptor from the given descriptor string.
     * If multipleDescriptors is 'true', then it assumes that 'descriptor'
     * contains multiple field descriptors and will not perform needless
     * verification on the descriptor string as a whole.
     */
    function FieldDescriptor(descriptor, multipleDescriptors) {
      var firstChar, firstSemicolon;
      multipleDescriptors = multipleDescriptors === undefined ? false : true;

      this._descriptor = descriptor;

      Util.assert(descriptor.length > 0);

      firstChar = descriptor.charAt(0);
      switch(firstChar) {
        case 'L':
          this._fieldType = FieldDescriptor.fieldType.OBJECT;
          
          //Find the first occurrence of ';'.
          firstSemicolon = descriptor.indexOf(';');

          //If 'descriptor' is not multiple descriptors, ensure that ';' is the last
          //character of the descriptor.
          if (!multipleDescriptors) {
            Util.assert(firstSemicolon === descriptor.length-1);
          }
          else {
            //If we have multiple descriptors, then the descriptor is actually a substring
            //of the current descriptor.
            this._descriptor = descriptor.substr(0, firstSemicolon+1);
          }

          this._className = descriptor.substr(1, this._descriptor.length-2);
          Util.checkIsValidClassOrInterfaceName(this._className);
          break;
        case '[':
          this._fieldType = FieldDescriptor.fieldType.ARRAY;
          this._componentType = new FieldDescriptor(descriptor.substr(1), multipleDescriptors);
          break;
        default:
          this._fieldType = FieldDescriptor.fieldType.BASE;
          if (!multipleDescriptors) {
            Util.assert(descriptor.length === 1);
          }
          else {
            this._descriptor = descriptor.charAt(0);
          }
          Util.assert(this._descriptor in FieldDescriptor.baseTypeLookup);
          break;
      }
    }

    /**
     * Returns the string form of the FieldDescriptor.
     */
    FieldDescriptor.prototype.toString = function() {
      return this._descriptor;
    };

    /**
     * Parses an array of FieldDescriptors from a MethodDescriptor (as a string).
     */
    FieldDescriptor.parseFromMethodDescriptor = function(methodDescriptor) {
      var firstCloseParen = methodDescriptor.indexOf(')'),
          fieldDescriptors = [],
          descriptors, fieldDesc;

      Util.assert(methodDescriptor.charAt(0) === '(');

      descriptors = methodDescriptor.substr(1, firstCloseParen-1);

      while (descriptors.length > 0) {
        fieldDesc = new FieldDescriptor(descriptors, true);
        descriptors = descriptors.substr(fieldDesc.toString().length);
        fieldDescriptors.push(fieldDesc);
      }

      return fieldDescriptors;
    };

    return FieldDescriptor;
  }
);