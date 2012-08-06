define(['util/Util'],
  function(Util) {
    "use strict";
    
    function ExceptionAttribute(attributeName, attributeLength, exceptionsIndexTable) {
      this.attributeName = attributeName;
      this.attributeLength = attributeLength;
      this.exceptionsIndexTable = exceptionsIndexTable;
    }

    //TODO: Flesh out attribute output.
    ExceptionAttribute.prototype.toString = function() {
      return "\tException: " + this.attributeName;
    };

    return ExceptionAttribute;
  }
);