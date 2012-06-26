define(['Util', 'Primitives', 'Enum'],
  function (Util, Primitives, Enum) {
    /**
     * Object for the entire constant pool for a class.
     *  * cpItems: Array of ConstantPoolInfo objects.
     */
    function ConstantPool(cpItems) {
      this.cpItems = cpItems;
      
      //Constant pool items sometimes refer to other constant pool items, and
      //we cannot resolve these references until the constant pool is completely
      //assembled. So, we do it after the fact.
      for (i = 1; i < this.getLength(); i++)
      {
        if (i in this.cpItems) //This may be false for the second items for double/long constants.
        {
          this.cpItems[i].resolveReferences(this);
        }
      }
    }

    /**
     * Returns the constant pool item at the given index.
     */
    ConstantPool.prototype.get = function(index) {
      //Index 0 is reserved by the JVM for historic purposes and is empty.
      if (index === 0) return undefined;
      Util.assert(index in this.cpItems);
      var item = this.cpItems[index];
      Util.assert(item !== undefined);
      return item;
    };
      
    /**
     * Get the length of the constant pool.
     */
    ConstantPool.prototype.getLength = function() {
      return this.cpItems.length;
    };

    /**
     * Get the string from a UTF8 info object at the given index.
     * Asserts that it is, in fact, a UTF8 info object.
     */
    ConstantPool.prototype.getUTF8Info = function(index) {
      var item = this.get(index);
      //HACK: Sometimes 0 is used which is always undefined, which is OK.
      if (item === undefined) return item;
      Util.assert(item.getTag() === Enum.constantPoolTag.UTF8);
      return item.string;
    };

    /**
     * Resolve a class info object at the given index to its UTF8 name.
     * Asserts that it is, in fact, a class info object.
     */
    ConstantPool.prototype.getClassInfo = function(index) {
      var item = this.get(index);
      //HACK: Sometimes 0 is used which is always undefined, which is OK.
      if (item === undefined) return item;
      Util.assert(item.getTag() == Enum.constantPoolTag.CLASS);
      return item.name;
    };

    /**
     * Print the constant pool contents to the terminal.
     */
    ConstantPool.prototype.toString = function() {
      var output = [];
      output.push("Constant Pool Contents:\n");
      for (var i = 1; i < this.count; i++)
      {
        output.push("\t" + i + " ");
        output.push(this.cpItems[i].toString(), "\n");
      }

      return output.join("");
    };

    return ConstantPool;
  }
);