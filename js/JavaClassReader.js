define(['Util', 'Deflate', 'Class', 'Enum', 'ConstantPool/ConstantClassInfo',
  'ConstantPool/ConstantRefInfo', 'ConstantPool/ConstantStringInfo', 'ConstantPool/ConstantNumberInfo',
  'ConstantPool/ConstantBigNumberInfo', 'ConstantPool/ConstantNameAndTypeInfo', 'ConstantPool/ConstantUTF8Info',
  'ConstantPool/ConstantPool', 'FieldInfo', 'MethodInfo', 'Attributes/SourceFileAttribute',
  'Attributes/ConstantValueAttribute', 'Attributes/CodeAttribute', 'Attributes/ExceptionAttribute',
  'Attributes/SyntheticAttribute', 'Attributes/DeprecatedAttribute', 'Attributes/GenericAttribute',
  'ClassEntry', 'LineNumberTableEntry',
  'Attributes/LineNumberTableAttribute', 'LocalVariableTableEntry', 'LocalVariableTable',
  'Instruction', 'ExceptionTableEntry', 'ByteCode',
  'Primitives', 'Attributes/InnerClassAttribute'],
  function(Util, Utf8Translator, Class, Enum, ConstantClassInfo,
    ConstantRefInfo, ConstantStringInfo, ConstantNumberInfo,
    ConstantBigNumberInfo, ConstantNameAndTypeInfo, ConstantUTF8Info,
    ConstantPool, FieldInfo, MethodInfo, SourceFileAttribute,
    ConstantValueAttribute, CodeAttribute, ExceptionAttribute,
    SyntheticAttribute, DeprecatedAttribute, GenericAttribute,
    ClassEntry, LineNumberTableEntry,
    LineNumberTableAttribute, LocalVariableTableEntry, LocalVariableTable,
    Instruction, ExceptionTableEntry, ByteCode, Primitives, InnerClassAttribute) {
    /**
     * Used to read a Java Class.
     */
    function JavaClassReader(data) {
      this.data = data;
      this.index = 0;
    }

    JavaClassReader.prototype.parseClass = function() {
      //u4 magic;
      var magic = this.getUintField(4);

      //Why not?
      Util.assert(magic === 0xCAFEBABE && "ERROR: Magic value 0xCAFEBABE not found! Instead: " + magic);

      //u2 minor_version;
      var minorVersion = this.getUintField(2);
      //u2 major_version;
      var majorVersion = this.getUintField(2);
      
      var constantPool = this.parseConstantPool();

      //u2 access_flags;
      var accessFlags = this.getUintField(2);
      
      //u2 this_class;
      var thisClassIndex = this.getUintField(2);
      var thisClassName = constantPool.getClassInfo(thisClassIndex);
      
      var klass = new Class(minorVersion, majorVersion, constantPool, accessFlags, thisClassName);

      //Register the class. This is very important, or else we could get into infinite loading loops.
      //Trying a Hack to load system
      if (thisClassName == "System"){
        JVM.registerClass("java/lang/System", klass);
      }else if (thisClassName == "PrintStream"){
        JVM.registerClass("java/io/PrintStream", klass);
      }else{
        JVM.registerClass(thisClassName, klass);
      }
      
      //u2 super_class;
      var superClassIndex = this.getUintField(2);
      var superClassName = constantPool.getClassInfo(superClassIndex);

      //u2 interfaces_count;
      var interfacesCount = this.getUintField(2);
      var interfaces = [];
      var interfaceIndex;
      //u2 interfaces[interfaces_count];
      for(i = 0; i < interfacesCount; i++) {
        interfaceIndex = this.getUintField(2);
        interfaces[i] = constantPool.getClassInfo(interfaceIndex);
      }

      //u2 fields_count;
      var fieldsCount = this.getUintField(2);
      var fields = [];
      //field_info fields[fields_count];
      for(i = 0; i < fieldsCount; i++) {
        fields[i] = this.parseFieldInfo(klass, constantPool);
      }

      //u2 methods_count;
      var methodsCount = this.getUintField(2);
      var methods = [];
      //method_info methods[methods_count];
      for(i = 0; i < methodsCount; i++) {
        methods[i] = this.parseMethodInfo(klass, constantPool);
      }

      //u2 attributes_count;
      var attributesCount = this.getUintField(2);
      //attribute_info attributes[attributes_count];
      var attributes = this.parseAttributes(attributesCount, constantPool);

      klass.finishInstantiation(superClassName, interfaces, fields, methods, attributes, fields);

      return klass;
    };

    JavaClassReader.prototype.parseConstantPool = function() {
      var i;
      
      /**
       * PARSING
       */
      
      //u2 constant_pool_count;
      var count = this.getUintField(2);
      var tag, bytes, name_index;
      var cpItems = [];
      //cp_info constant_pool[constant_pool_count-1];
      //NOTE: Index 0 of the constant pool is reserved for use by the JVM, and is not
      //in the class file.
      for(i = 1; i < count; i++) {
        tag = this.getUintField(1);

        switch(tag) {
          case Enum.constantPoolTag.CLASS:
            name_index = this.getUintField(2);
            cpItems[i] = new ConstantClassInfo(name_index);
            break;
          case Enum.constantPoolTag.FIELDREF:
          case Enum.constantPoolTag.METHODREF:
          case Enum.constantPoolTag.INTERFACEMETHODREF:
            var class_index = this.getUintField(2);
            var name_and_type_index = this.getUintField(2);
            cpItems[i] = new ConstantRefInfo(tag, class_index, name_and_type_index);
            break;
          case Enum.constantPoolTag.STRING:
            var string_index = this.getUintField(2);
            cpItems[i] = new ConstantStringInfo(string_index);
            break;
          case Enum.constantPoolTag.INTEGER:
            bytes = Primitives.getInteger(this.getIntField(4));
            cpItems[i] = new ConstantNumberInfo(tag, bytes);
            break;
          case Enum.constantPoolTag.FLOAT:
            bytes = Primitives.getFloat(this.getFloatField(4));
            cpItems[i] = new ConstantNumberInfo(tag, bytes);
            break;
          case Enum.constantPoolTag.LONG:
            var high = this.getUintField(4);
            var low = this.getUintField(4);
            var long_value = Primitives.getLong(low, high);
            cpItems[i] = new ConstantBigNumberInfo(tag, long_value);
            //8 byte constants take up two slots.
            i++;
            break;
          case Enum.constantPoolTag.DOUBLE:
            var double_field = Primitives.getDouble(this.getDoubleField(8));
            cpItems[i] = new ConstantBigNumberInfo(tag, double_field);
            //8 byte constants take up two slots.
            i++;
            break;
          case Enum.constantPoolTag.NAMEANDTYPE:
            name_index = this.getUintField(2);
            var descriptor_index = this.getUintField(2);
            cpItems[i] = new ConstantNameAndTypeInfo(name_index, descriptor_index);
            break;
          case Enum.constantPoolTag.UTF8:
            var length = this.getUintField(2);
            var string = this.getUTF8Field(length);
            cpItems[i] = new ConstantUTF8Info(length, string);
            break;
          default:
            JVM.printError("ERROR: Unable to determine the 'tag' element of a cp_info struct: " + tag + ".");
            break;
        }
      }

      //Create the constant pool.
      return new ConstantPool(cpItems);
    };

    JavaClassReader.prototype.parseFieldInfo = function(klass, constantPool) {
      /**
       * INITIALIZATION
       */
      var accessFlags = this.getUintField(2);
      var nameIndex = this.getUintField(2);
      var name = constantPool.getUTF8Info(nameIndex);
      var descriptorIndex = this.getUintField(2);
      var descriptor = constantPool.getUTF8Info(descriptorIndex);
      var attributesCount = this.getUintField(2);
      var fieldDescriptor = Util.parseFieldDescriptor(descriptor);
      var attributes = this.parseAttributes(attributesCount, constantPool);
      var constantValueAttribute;
      var isConstant = false; //TODO: Is this right?

      return new FieldInfo(klass, accessFlags, name, descriptor, attributesCount, fieldDescriptor, attributes, constantValueAttribute, isConstant);
    };

    JavaClassReader.prototype.parseMethodInfo = function(klass, constantPool) {
      var accessFlags = this.getUintField(2);
      
      var nameIndex = this.getUintField(2);
      var name = constantPool.getUTF8Info(nameIndex);
      
      var descriptorIndex = this.getUintField(2);
      var descriptor = constantPool.getUTF8Info(descriptorIndex);
      var methodDescriptor = Util.parseMethodDescriptor(descriptor);
      
      var attributesCount = this.getUintField(2);
      var attributes = this.parseAttributes(attributesCount, constantPool);

      return new MethodInfo(klass, accessFlags, name, descriptor, methodDescriptor, attributes);
    };

    JavaClassReader.prototype.parseAttributes = function(attributesCount, constantPool) {
      var attributes = [];
      for (var i = 0; i < attributesCount; i++)
      {
        var attributeNameIndex = this.getUintField(2);
        var attributeName = constantPool.getUTF8Info(attributeNameIndex);
        var attributeLength = this.getUintField(4);
        
        //Switching on Strings? In MY JavaScript? It's more likely than you think...
        switch(attributeName) {
          case "SourceFile":
            Util.assert(attributeLength == 2);
            var sourceFileIndex = this.getUintField(2);
            var sourceFile = constantPool.getUTF8Info(sourceFileIndex);
            attributes[i] = new SourceFileAttribute(attributeName, attributeLength, sourceFile);
            break;
          case "ConstantValue":
            Util.assert(attributeLength == 2);
            var constantValueIndex = this.getUintField(2);
            var constantValue = constantPool.get(constantValueIndex);
            attributes[i] = new ConstantValueAttribute(attributeName, attributeLength, constantValue);
            break;
          case "Code":
            attributes[i] = this.parseCodeAttribute(constantPool, attributeName);
            break;
          case "Exceptions":
            var numberOfExceptions = this.getUintField(2);
            //An array of constant pool references to exceptions
            var exceptionsIndexTable = [];
            for (var j = 0; j < numberOfExceptions; j++)
            {
              exceptionsIndexTable[j] = this.getUintField(2);
            }
            attributes[i] = new ExceptionAttribute(attributeName, attributeLength, exceptionsIndexTable);
            break;
          case "InnerClasses":
            attributes[i] = this.parseInnerClassAttribute(constantPool, attributeName, attributeLength);
            break;
          case "Synthetic":
            attributes[i] = new SyntheticAttribute(attributeName, attributeLength);
            break;
          case "LineNumberTable":
            attributes[i] = this.parseLineNumberTableAttribute(constantPool, attributeName);
            break;
          case "LocalVariableTable":
            attributes[i] = this.parseLocalVariableTable(constantPool, attributeName);
            break;
          case "Deprecated":
            attributes[i] = new DeprecatedAttribute(attributeName, attributeLength);
            break;
          default:
            var info = this.getUintField(attributeLength);
            attributes[i] = new GenericAttribute(attributeName, attributeLength, info);
            break;
        }
      }
      return attributes;
    };

    /**
     * Get the next length bytes of the class file as an unsigned integer array.
     */
    JavaClassReader.prototype.getRawBytes = function(length) {
      //var bytes = this.data.subarray(this.index, this.index + length);
      var bytes = [];
      
      for (var i = this.index; i < this.index + length; i++)
      {
        bytes[i-this.index] = this.data.charCodeAt(i);
      }
      
      this.index += length;
      return bytes;
    };

    /**
     * Get an unsigned integer field. Converts multi-byte fields into a single
     * unsigned integer.
     */
    JavaClassReader.prototype.getUintField = function(fieldLength) {
      var bytes = this.getRawBytes(fieldLength);

      var value = 0;
      for(var i = 0; i < bytes.length; i++) {
        //Shift over the previous value by a byte.
        value = value << 8;

        //Add the next byte.
        value = value | bytes[i];
      }
      //Convert back to unsigned. Yes, this is really dumb and hacky, but that's the only way.
      value = value >>> 0;
      return value;
    };

    /**
     * Returns a float.
     */
    JavaClassReader.prototype.getFloatField = function(fieldLength) {
      Util.assert(fieldLength == 4);
      var rawBits = this.getUintField(fieldLength);
      var s = ((rawBits >> 31) === 0) ? 1 : -1;

      //Make it unsigned.
      var e = ((rawBits >> 23) & 0xff);
      e = e >>> 0;

      //Make it unsigned.
      var m = (e === 0) ? (rawBits & 0x7fffff) << 1 : (rawBits & 0x7fffff) | 0x800000;
      m = m >>> 0;

      var value = s * m * Math.pow(2, e - 150);
      return value;
    };

    /**
     * Returns a double.
     */
    JavaClassReader.prototype.getDoubleField = function(fieldLength) {
      Util.assert(fieldLength == 8);
      
      var bits_1 = this.getUintField(2);
      
      //Sign.
      var s = ((bits_1>>15) === 0) ? 1 : -1;
      
      //Exponent. Make it unsigned.
      var e = ((bits_1>>4) & 0x7ff);
      e = e >>> 0;
      
      //3 bits of m here.
      var m = bits_1 & 0xf;
      
      if (e !== 0)
        m = (bits_1 & 0xf) | 0x10;
        
      //We CANNOT use any more bit operations on the mantissa,
      //since bit ops operate on 32 bits ONLY.
      
      //"Shift" it over by 4 bytes.
      m *= Math.pow(2,32);
      //"Or" it with the next 4 bytes.
      m += this.getUintField(4);
      //"Shift" it 2 more bytes.
      m *= Math.pow(2,16);
      //"Or" it with the final 2 bytes.
      m += this.getUintField(2);
      
      //Left shift 1 if e is 0.
      if (e === 0)
        m *= 2;

      var value = s * m * Math.pow(2, e - 1075);
      return value;
    };

    /**
     * Get a SIGNED INTEGER field.
     */
    JavaClassReader.prototype.getIntField = function(fieldLength) {
      Util.assert(fieldLength <= 4);
      var bytes = this.getRawBytes(fieldLength);

      var value = 0;
      var i;
      for(i = 0; i < bytes.length; i++) {
        //Shift over the previous value by a byte.
        value = value << 8;

        //Add the next byte.
        value = value | bytes[i];
      }
      
      //Need to sign extend if it is <4 bytes.
      if (fieldLength < 4)
      {
        //Form a mask to find the leftmost bit.
        var leftmostMask = 0x80;
        //Multiply by 0x10 for each byte.
        for (i = 1; i < fieldLength; i++)
        {
          leftmostMask *= 0x100;
        }
        //Check if the leftmost bit is 1 or 0. Use to select the
        //pad value.
        var padValue = (value & leftmostMask) !== 0 ? 0xFF : 0;
        
        //If it's 0, there's nothing to do. Terminate.
        if (padValue === 0) return value;
        
        //Otherwise, pad on.
        var padMask = 0;
        
        //Form the mask to left pad with.
        for (i = 0; i < 4 - fieldLength; i++)
        {
          padMask <<= 8;
          padMask |= padValue;
        }
        
        //Left shift it the number of bits of the field.
        padMask <<= fieldLength * 8;
        
        //Finally, OR with the mask!
        value |= padMask;
      }

      return value;
    };

    /**
     * Turns raw bytes in the Java Class file into a UTF8 string.
     */
    JavaClassReader.prototype.getUTF8Field = function(fieldLength) {
      var bytes = this.getRawBytes(fieldLength);
      var utf8tler = new Utf8Translator(new Util.utf8Wrapper(bytes));
      var string = "";
      var currentChar = utf8tler.readChar();
      while(currentChar !== null) {
        string += currentChar;
        currentChar = utf8tler.readChar();
      }
      return string;
    };

    JavaClassReader.prototype.parseInnerClassAttribute = function(constantPool, attributeName, attributeLength) {
      var numberOfClasses = this.getUintField(2);
      
      var classes = [];
      for (var i = 0; i < numberOfClasses; i++)
      {
        var innerClassInfoIndex = this.getUintField(2);
        var innerClassInfo = constantPool.getClassInfo(innerClassInfoIndex);
        var outerClassInfoIndex = this.getUintField(2);
        var outerClassInfo = constantPool.getClassInfo(outerClassInfoIndex);
        var innerNameIndex = this.getUintField(2);
        var innerName = constantPool.getUTF8Info(innerNameIndex);
        var innerClassAccessFlags = this.getUintField(2);
        classes[i] = new ClassEntry(innerClassInfo, outerClassInfo, innerName, innerClassAccessFlags);
      }

      return new InnerClassAttribute(attributeName, classes);
    };

    JavaClassReader.prototype.parseLineNumberTableAttribute = function(attributeName) {
      var lineNumberTableLength = this.getUintField(2);
      
      //An Array of LineNumberTableEntries
      var lineNumberTable = [];
      for (var i = 0; i < lineNumberTableLength; i++)
      {
        var startPC = this.getUintField(2);
        var lineNumber = this.getUintField(2);
        lineNumberTable[i] = new LineNumberTableEntry(startPC, lineNumber);
      }

      return new LineNumberTableAttribute(attributeName, lineNumberTable);
    };

    JavaClassReader.prototype.parseLocalVariableTable = function(constantPool, attributeName) {
      var localVariableTableLength = this.getUintField(2);
      
      //An Array of LocalVariableTableEntries
      var localVariableTable = [];
      for (var i = 0; i < localVariableTableLength; i++)
      {
        var startPC = this.getUintField(2);
        var length = this.getUintField(2);
        var nameIndex = this.getUintField(2);
        var name = constantPool.getUTF8Info(nameIndex);
        var descriptorIndex = this.getUintField(2);
        var descriptor = constantPool.getUTF8Info(descriptorIndex);
        var index = this.getUintField(2); //TODO: Does this actually mean anything?
        localVariableTable[i] = new LocalVariableTableEntry(startPC, name, descriptor);
      }

      return new LocalVariableTable(attributeName, localVariableTable);
    };

    JavaClassReader.prototype.parseCodeAttribute = function(constantPool, attributeName) {
      var maxStack = this.getUintField(2);
      var maxLocals = this.getUintField(2);
      
      //The actual bytecode for the method
      var codeLength = this.getUintField(4);
      
      var oldIndex = this.index;
      
      /**
       * The following gigantic loop handles parsing the bytecode.
       * It resolves constant pool entries and performs various Util.assertions
       * to ensure things are going on track.
       *
       * Believe me, I wish it wasn't this long. I was too lazy to make
       * individual 'class' files for each bytecode.
       */
      var code = [];
      var i = 0; //Declared outside of loop for Util.assert below.
      var j = 0; //Declared here because it is reused.
      for (i = 0; i < codeLength; ) {
        //Get the instruction.
        var instr = this.getUintField(1);
        var insObj;
        
        /**
         * Shared temporary variables.
         * JavaScript only creates new scopes in functions, so any variables
         * that I want to reuse down below should be declared once up here, or
         * else I am declaring them multiple times in the same scope. The linter
         * hates me for that.
         */
         var int1, index, unit1, constant, padding, paddingVal, default_;

        //Is it a special bytecode with arguments?
        switch(instr) {
          /**
           * Instructions with index into local variable array
           */
          case ByteCode.codes.aload:
          case ByteCode.codes.astore:
          case ByteCode.codes.dload:
          case ByteCode.codes.dstore:
          case ByteCode.codes.fload:
          case ByteCode.codes.fstore:
          case ByteCode.codes.iload:
          case ByteCode.codes.istore:
          case ByteCode.codes.lload:
          case ByteCode.codes.lstore:
          case ByteCode.codes.ret:
            var uint1 = this.getUintField(1);
            insObj = new Instruction(2, instr, uint1);
            break;
            
          //TODO: Test 1 byte signed integer. Does it work?
          case ByteCode.codes.bipush:
            int1 = this.getIntField(1);
            insObj = new Instruction(2, instr, int1);
            break;
            
          //TODO: Test 2 byte signed integer. Does it work?
          case ByteCode.codes.goto_:
          case ByteCode.codes.if_acmpeq:
          case ByteCode.codes.if_acmpne:
          case ByteCode.codes.if_icmpeq:
          case ByteCode.codes.if_icmpge:
          case ByteCode.codes.if_icmpgt:
          case ByteCode.codes.if_icmple:
          case ByteCode.codes.if_icmplt:
          case ByteCode.codes.if_icmpne:
          case ByteCode.codes.ifeq:
          case ByteCode.codes.ifge:
          case ByteCode.codes.ifgt:
          case ByteCode.codes.ifle:
          case ByteCode.codes.iflt:
          case ByteCode.codes.ifne:
          case ByteCode.codes.ifnonnull:
          case ByteCode.codes.ifnull:
          case ByteCode.codes.jsr:
          case ByteCode.codes.sipush:
            int1 = this.getIntField(2);
            insObj = new Instruction(3, instr, int1);
            break;
          case ByteCode.codes.goto_w:
          case ByteCode.codes.jsr_w:
            int1 = this.getIntField(4);
            insObj = new Instruction(5, instr, int1);
            break;
            
          /**
           * Instructions with index into constant pool.
           */
          
          //class, array, or interface type
          case ByteCode.codes.anewarray:
          case ByteCode.codes.checkcast:
          case ByteCode.codes.instanceof_:
          case ByteCode.codes.new_:
            //TODO: Is this always a class info???
            index = this.getUintField(2);
            var type = constantPool.getClassInfo(index);
            insObj = new Instruction(3, instr, type);
            break;
          
          //The runtime constant pool item at that index must be a symbolic reference to a field,
          //which gives the name and descriptor of the field as well as a symbolic reference to
          //the class in which the field is to be found.
          case ByteCode.codes.getfield:
          case ByteCode.codes.getstatic:
          case ByteCode.codes.putfield:
          case ByteCode.codes.putstatic:
            index = this.getUintField(2);
            var field = constantPool.get(index);
            Util.assert(field.getTag() == Enum.constantPoolTag.FIELDREF);
            insObj = new Instruction(3, instr, field);
            break;
          
          //The runtime constant pool item at that index must be a symbolic reference to an
          //interface method (§5.1), which gives the name and descriptor (§4.3.3) of the
          //interface method as well as a symbolic reference to the interface in which the
          //interface method is to be found.
          case ByteCode.codes.invokeinterface:
            index = this.getUintField(2);
            var intMeth = constantPool.get(index);
            Util.assert(intMeth.getTag() == Enum.constantPoolTag.INTERFACEMETHODREF);
            var count = this.getUintField(1);
            //Waste a byte.
            var wasted = this.getUintField(1);
            Util.assert(wasted === 0);
            Util.assert(count > 0);
            insObj = new Instruction(5, instr, intMeth, count);
            break;
          
          //The runtime constant pool item at that index must be a symbolic reference to a
          //method (§5.1), which gives the name and descriptor (§4.3.3) of the method as
          //well as a symbolic reference to the class in which the method is to be found.
          case ByteCode.codes.invokespecial:
          case ByteCode.codes.invokestatic:
          case ByteCode.codes.invokevirtual:
            index = this.getUintField(2);
            var method = constantPool.get(index);
            Util.assert(method.getTag() == Enum.constantPoolTag.METHODREF);
            insObj = new Instruction(3, instr, method);
            break;
          
          //The runtime constant pool entry at index either must be a runtime constant
          //of type int or float, or must be a symbolic reference to a string literal (§5.1)
          //OR A CLASS according to some versions of the spec. *sigh*
          case ByteCode.codes.ldc:
            uint1 = this.getUintField(1);
            constant = constantPool.get(uint1);
            
            Util.assert(constant.getTag() == Enum.constantPoolTag.INTEGER ||
              constant.getTag() == Enum.constantPoolTag.FLOAT ||
              constant.getTag() == Enum.constantPoolTag.STRING||
              constant.getTag() == Enum.constantPoolTag.CLASS);
            insObj = new Instruction(2, instr, constant);
            break;
          
          case ByteCode.codes.ldc_w:
            index = this.getUintField(2);
            constant = constantPool.get(index);
              
            Util.assert(constant.getTag() == Enum.constantPoolTag.INTEGER ||
              constant.getTag() == Enum.constantPoolTag.FLOAT ||
              constant.getTag() == Enum.constantPoolTag.STRING ||
              constant.getTag() == Enum.constantPoolTag.CLASS);
              
            insObj = new Instruction(3, instr, constant);
            break;
          
          //The runtime constant pool entry at the index must be a runtime constant of
          //type long or double.
          case ByteCode.codes.ldc2_w:
            index = this.getUintField(2);
            constant = constantPool.get(index);
            Util.assert(constant.getTag() == Enum.constantPoolTag.DOUBLE ||
              constant.getTag() == Enum.constantPoolTag.LONG);
            insObj = new Instruction(3, instr, constant);
            break;
          
          //TODO: 1 byte signed int
          case ByteCode.codes.iinc:
            uint1 = this.getUintField(1);
            int1 = this.getIntField(1);
            insObj = new Instruction(3, instr, uint1, int1);
            break;
          
          /**
           * Misc.
           */
          //The atype is a code that indicates the type of array to create. It must take
          //one of the following values [see table in docs]
          case ByteCode.codes.newarray:
            uint1 = this.getUintField(1);
            Util.assert(uint1 >= 4 && uint1 <= 11);
            insObj = new Instruction(2, instr, uint1);
            break;
            
          /**
           * Crazy instructions.
           */
          case ByteCode.codes.lookupswitch:
            //i is the start of the current instruction.
            //0 is the first instruction, so the 4th byte
            //is 4.
            padding = (4 - ((i+1)%4))%4; //Will be 0-3
            paddingVal = this.getUintField(padding);
            Util.assert(paddingVal === 0);
            default_ = this.getIntField(4);
            var npairs = this.getIntField(4);
            Util.assert(npairs >= 0);
            var matches = [];
            for (j = 0; j < npairs; j++)
            {
              matches[j] = [];
              matches[j].match = this.getIntField(4);
              if (j > 0) Util.assert(matches[j].match >= matches[j-1].match);
              matches[j].offset = this.getIntField(4);
            }
            insObj = new Instruction(9+padding+npairs*8, instr,9+padding+npairs*8, default_, npairs, matches);
            //default straight from javasoc, npairs number of pairs, matches is the matches
            break;
          case ByteCode.codes.tableswitch:
            padding = (4 - ((i+1)%4))%4; //Will be 0-3
            paddingVal = this.getUintField(padding);
            Util.assert(paddingVal === 0);
            default_ = this.getIntField(4);
            var low = this.getIntField(4);
            var high = this.getIntField(4);
            Util.assert(low <= high);
            var offsetCount = high-low+1;
            var offsets = [];
            for (j = 0; j < offsetCount; j++)
            {
              offsets[j] = this.getIntField(4);
            }
            insObj = new Instruction(13+padding+4*offsetCount, instr, 13+padding+4*offsetCount, default_, low, high, offsets);
            break;
          case ByteCode.codes.wide:
            var opcode = this.getUintField(1);
            index = this.getUintField(2);
            
            //The first form of the wide instruction modifies one of the instructions
            //iload, fload, aload, lload, dload, istore, fstore, astore, lstore, dstore, or ret.
            if (opcode != ByteCode.codes.iinc)
            {
              Util.assert(opcode == ByteCode.codes.iload ||
                opcode == ByteCode.codes.fload ||
                opcode == ByteCode.codes.aload ||
                opcode == ByteCode.codes.lload ||
                opcode == ByteCode.codes.dload ||
                opcode == ByteCode.codes.istore ||
                opcode == ByteCode.codes.fstore ||
                opcode == ByteCode.codes.astore ||
                opcode == ByteCode.codes.lstore ||
                opcode == ByteCode.codes.dstore ||
                opcode == ByteCode.codes.ret);
              insObj = new Instruction(4, instr, opcode, index);
            }
            //The second form applies only to the iinc instruction.
            else
            {
              constant = this.getIntField(2);
              insObj = new Instruction(6, instr, opcode, index, constant);
            }
            break;
          
          //The runtime constant pool item at the index must be a symbolic reference to a
          //class, array, or interface type.
          //TODO: Check.
          case ByteCode.codes.multianewarray:
            index = this.getUintField(2);
            var dim = this.getUintField(1);
            Util.assert(dim > 0);
            insObj = new Instruction(4, instr, index, count);
            break;
          default:
            Util.assert(instr in ByteCode.instrs);
            insObj = new Instruction(1, instr);
            break;
        }
        
        //Store insObj at its pc location.
        code[i] = insObj;

        //Increment i.
        i += insObj.length;
      }
      //Let's make sure we read in ALL of the code.
      Util.assert(i == codeLength);
      Util.assert(this.index - oldIndex == codeLength);
      
      //An Array of ExceptionTableEntries
      var exceptionTableLength = this.getUintField(2);
      
      var exceptionTable = [];
      for (i = 0; i < exceptionTableLength; i++)
      {
        exceptionTable[i] = this.parseExceptionTableEntry(constantPool);
      }
      
      //NOTE: The Java spec permits us to entirely ignore these attributes.
      attributesCount = this.getUintField(2);
      attributeInfo = this.parseAttributes(attributesCount, constantPool);

      return new CodeAttribute(attributeName, maxStack, maxLocals, code, exceptionTable, attributeInfo);
    };

    JavaClassReader.prototype.parseExceptionTableEntry = function(constantPool) {
      var startPC = this.getUintField(2);
      var endPC = this.getUintField(2);
      var handlerPC = this.getUintField(2);
      var catchTypeIndex = this.getUintField(2);
      var catchType = constantPool.getClassInfo(catchTypeIndex);
      return new ExceptionTableEntry(startPC, endPC, handlerPC, catchType);
    };

    return JavaClassReader;
  }
);