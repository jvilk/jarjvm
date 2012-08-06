define(['util/Util'],
  function(Util) {
    "use strict";
    
    function DeprecatedAttribute(attributeName, attributeLength) {
      this.attributeName = attributeName;
      this.attributeLength = attributeLength;
      Util.assert(this.attributeLength === 0);
    }

    //TODO: Flesh out attribute output.
    DeprecatedAttribute.prototype.toString = function() {
      return "\tDeprecated: " + this.attributeName;
    };

    return DeprecatedAttribute;
  }
);