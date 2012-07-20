define(['util/Util', 'vm/Primitives', 'vm/Enum'],
  function (Util, Primitives, Enum) {
    /**
     * Object for the entire constant pool for a class.
     *  * cpItems: Array of ConstantPoolInfo objects.
     */
    function ConstantPool(cpItems, length) {
      var i;

      this.cpItems = cpItems;
      this.length = length;
      
      //Constant pool items sometimes refer to other constant pool items, and
      //we cannot resolve these references until the constant pool is completely
      //assembled. So, we do it after the fact.
      for (i = 1; i < this.getLength(); i++)
      {
        if (i in this.cpItems) //This may be false for the second items for double/long constants.
        {
          this.cpItems[i].initialized = true;
          this.cpItems[i].resolveReferences(this);
        }
      }
    }

    /**
     * Get the length of the constant pool.
     */
    ConstantPool.prototype.getLength = function() {
      return this.length;
    };

    /**
     * Returns the constant pool item at the given index.
     */
    ConstantPool.prototype.get = function(index) {
      //TODO(jvilk): If still in the middle of initilization,
      //             run 'resolveReferences'.
      //             Means that I need to make things init safe?
      //             Array of 'is initialized?'
      //Index 0 is reserved by the JVM for historic purposes and is empty.
      if (index === 0) return undefined;
      Util.assert(index in this.cpItems);
      var item = this.cpItems[index];
      Util.assert(item !== undefined);
      if (item.initialized !== true) {
        item.initialized = true;
        item.resolveReferences(this);
      }
      return item;
    };

    /** TODO(jvilk): Rename the below two functions.
     * They are somewhat confusing, but invaluable since they
     * abstract away the special case of a '0' index for UTF8Info/
     * ClassInfo CP items. AFAIK, no other CP item type can use
     * the index 0?
     **/

    /**
     * Get the string from a UTF8 info object at the given index.
     * Asserts that it is, in fact, a UTF8 info object.
     */
    ConstantPool.prototype.getUTF8Info = function(index) {
      var item = this.get(index);

      //HACK: Sometimes 0 is used which is always undefined, which is OK.
      if (item === undefined) return item;
      Util.assert(item.getTag() === Enum.constantPoolTag.UTF8);
      return item.getValue();
    };

    /**
     * Resolve a class info object at the given index to its UTF8 name.
     * Asserts that it is, in fact, a class info object.
     */
    ConstantPool.prototype.getClassInfo = function(index) {
      var item = this.get(index);
      //HACK: Sometimes 0 is used which is always undefined, which is OK.
      if (item === undefined) return item;
      Util.assert(item.getTag() === Enum.constantPoolTag.CLASS);
      return item.getName();
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