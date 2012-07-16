define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    function ConstantUTF8Info(string) {
      this._string = string;
    }

    ConstantUTF8Info.prototype.getValue = function() {
      return this._string;
    };

    /**
     * Required by all constant pool items
     */
    ConstantUTF8Info.prototype.getTag = function() {
      return Enum.constantPoolTag.UTF8;
    };
    
    ConstantUTF8Info.prototype.resolveReferences = function() {};

    ConstantUTF8Info.prototype.toString = function() {
      return "UTF8 " + this.getValue();
    };

    return ConstantUTF8Info;
  }
);