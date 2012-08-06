define(['util/Util'],
  function(Util) {
    "use strict";
    
    function LineNumberTableAttribute(attributeName, lineNumberTable) {
      this.attributeName = attributeName;
      this.lineNumberTable = lineNumberTable;
    }

    //TODO: Flesh out attribute output.
    LineNumberTableAttribute.prototype.toString = function() {
      return "\tLineNumberTable: " + this.attributeName;
    };

    return LineNumberTableAttribute;
  }
);