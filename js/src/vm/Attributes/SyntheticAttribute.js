define(['util/Util'],
  function(Util) {
    "use strict";
    
    function SyntheticAttribute(attributeName, attributeLength) {
      this.attributeName = attributeName;
      this.attributeLength = attributeLength;
      Util.assert(this.attributeLength === 0);
    }

    //TODO: Flesh out attribute output.
    SyntheticAttribute.prototype.toString = function() {
      return "\tSynthetic: " + this.attributeName;
    };

    return SyntheticAttribute;
  }
);