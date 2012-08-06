define(['util/Util'],
  function(Util) {
    "use strict";
    
    function InnerClassAttribute(attributeName, classes) {
      this.attributeName = attributeName;
      this.classes = classes;
    }

    //TODO: Flesh out attribute output.
    InnerClassAttribute.prototype.toString = function() {
      return "\tInnerClass: " + this.attributeName;
    };

    return InnerClassAttribute;
  }
);