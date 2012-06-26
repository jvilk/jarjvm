define(['Util'],
  function(Util) {
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