define(['Util', 'Enum'],
  function(Util, Enum) {
    function ConstantUTF8Info(length, string) {
      this.length = length;
      this.string = string;
    }

    ConstantUTF8Info.prototype.toString = function() {
      return "UTF8 " + this.string;
    };

    ConstantUTF8Info.prototype.getTag = function() {
      return Enum.constantPoolTag.UTF8;
    };

    /**
     * Required by all constant pool items
     */
    ConstantUTF8Info.prototype.resolveReferences = function() {};

    return ConstantUTF8Info;
  }
);