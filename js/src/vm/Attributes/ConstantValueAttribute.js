define(['util/Util'],
  function(Util) {
    "use strict";
    
    function ConstantValueAttribute(attributeName, attributeLength, constantValue) {
      this.attributeName = attributeName;
      this.attributeLength = attributeLength;
      this.constantValue = constantValue;
    }

    ConstantValueAttribute.prototype.toString = function() {
      return "\tConstantValue: " + this.attributeName + " " + this.constantValue;
    };

    return ConstantValueAttribute;
  }
);