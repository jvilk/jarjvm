define(['util/Util', 'vm/FieldDescriptor'],
  function(Util, FieldDescriptor) {
    "use strict";

    ReturnDescriptor.type = {
      FIELDTYPE: 0,
      VOIDTYPE: 1
    };

    function ReturnDescriptor(descriptor) {
      Util.assert(descriptor.length > 0);
      this._descriptor = descriptor;

      if (descriptor === 'V') {
        this._type = FieldDescriptor.VOIDTYPE;
      }
      else {
        this._type = FieldDescriptor.FIELDTYPE;
        this._field = new FieldDescriptor(descriptor);
      }
    }

    ReturnDescriptor.prototype.toString = function() {
      return this._descriptor;
    };

    return ReturnDescriptor;
  }
);