define(['util/Util'],
  function(Util) {
    "use strict";
    
    function SourceFileAttribute(attributeName, attributeLength, sourceFile) {
      this.attributeName = attributeName;
      this.attributeLength = attributeLength;
      this.sourceFile = sourceFile;
    }

    SourceFileAttribute.prototype.toString = function() {
      return "\tSourceFile: " + this.attributeName + " " + this.sourceFile;
    };

    return SourceFileAttribute;
  }
);