define(
  function() {
    /*The parent object for all the Constant Pool objects
     *Paramaters
     *  tagType - What type is this information for
     */
    function ConstantPoolInfo(tagType) {
      this.tag = tagType;
      //Part of the "interface" of this type. Resolves references to the constant pool to objects.
      this.resolveReferences = function(constantPool) { };
      this.toString = function() { };
    }

    ConstantPoolInfo.tags = {
      CLASS : 7,
      FIELDREF : 9,
      METHODREF : 10,
      INTERFACEMETHODREF : 11,
      STRING : 8,
      INTEGER : 3,
      FLOAT : 4,
      LONG : 5,
      DOUBLE : 6,
      NAMEANDTYPE : 12,
      UTF8 : 1
    };

    return ConstantPoolInfo;
  }
);