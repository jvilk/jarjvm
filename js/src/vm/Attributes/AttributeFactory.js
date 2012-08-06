define(['vm/Attributes/ClassEntry', 'vm/Attributes/CodeAttribute', 'vm/Attributes/ConstantValueAttribute',
  'vm/Attributes/DeprecatedAttribute', 'vm/Attributes/ExceptionAttribute', 'vm/Attributes/ExceptionTableEntry',
  'vm/Attributes/GenericAttribute', 'vm/Attributes/InnerClassAttribute', 'vm/Attributes/LineNumberTableAttribute',
  'vm/Attributes/LineNumberTableEntry', 'vm/Attributes/LocalVariableTable', 'vm/Attributes/LocalVariableTableEntry',
  'vm/Attributes/SourceFileAttribute', 'vm/Attributes/SyntheticAttribute', 'vm/Enum', 'util/Util', 'vm/ByteCode', 'vm/Instruction'],
  function(ClassEntry, CodeAttribute, ConstantValueAttribute, DeprecatedAttribute, ExceptionAttribute,
    ExceptionTableEntry, GenericAttribute, InnerClassAttribute, LineNumberTableAttribute, LineNumberTableEntry,
    LocalVariableTable, LocalVariableTableEntry, SourceFileAttribute, SyntheticAttribute, Enum, Util, ByteCode, Instruction) {
    "use strict";

    /**
     * Can create attributes and such.
     */
    var AttributeFactory = {};

    /**
     * Parses an array of attributes using a JavaClassReader positioned at the start
     * of the attributes.
     */
    AttributeFactory.parseAttributes = function(jcr, attributesCount, constantPool) {
      var attributes = [];
      for (var i = 0; i < attributesCount; i++)
      {
        var attributeName = constantPool.getUTF8Info(jcr.getUintField(2));
        var attributeLength = jcr.getUintField(4);
        
        //Switching on Strings? In MY JavaScript? It's more likely than you think...
        switch(attributeName) {
          case "SourceFile":
            Util.assert(attributeLength === 2);
            var sourceFileIndex = jcr.getUintField(2);
            var sourceFile = constantPool.getUTF8Info(sourceFileIndex);
            attributes[i] = new SourceFileAttribute(attributeName, attributeLength, sourceFile);
            break;
          case "ConstantValue":
            Util.assert(attributeLength === 2);
            var constantValueIndex = jcr.getUintField(2);
            var constantValue = constantPool.get(constantValueIndex);
            attributes[i] = new ConstantValueAttribute(attributeName, attributeLength, constantValue);
            break;
          case "Code":
            attributes[i] = this.parseCodeAttribute(jcr, constantPool, attributeName);
            break;
          case "Exceptions":
            var numberOfExceptions = jcr.getUintField(2);
            //An array of constant pool references to exceptions
            var exceptionsIndexTable = [];
            for (var j = 0; j < numberOfExceptions; j++)
            {
              exceptionsIndexTable[j] = jcr.getUintField(2);
            }
            attributes[i] = new ExceptionAttribute(attributeName, attributeLength, exceptionsIndexTable);
            break;
          case "InnerClasses":
            attributes[i] = this.parseInnerClassAttribute(jcr, constantPool, attributeName, attributeLength);
            break;
          case "Synthetic":
            attributes[i] = new SyntheticAttribute(attributeName, attributeLength);
            break;
          case "LineNumberTable":
            attributes[i] = this.parseLineNumberTableAttribute(jcr, constantPool, attributeName);
            break;
          case "LocalVariableTable":
            attributes[i] = this.parseLocalVariableTable(jcr, constantPool, attributeName);
            break;
          case "Deprecated":
            attributes[i] = new DeprecatedAttribute(attributeName, attributeLength);
            break;
          default:
            var info = jcr.getUintField(attributeLength);
            attributes[i] = new GenericAttribute(attributeName, attributeLength, info);
            break;
        }
      }
      return attributes;
    };

    AttributeFactory.parseInnerClassAttribute = function(jcr, constantPool, attributeName, attributeLength) {
      var numberOfClasses = jcr.getUintField(2);
      
      var classes = [];
      for (var i = 0; i < numberOfClasses; i++)
      {
        var innerClassInfoIndex = jcr.getUintField(2);
        var innerClassInfo = constantPool.getClassInfo(innerClassInfoIndex);
        var outerClassInfoIndex = jcr.getUintField(2);
        var outerClassInfo = constantPool.getClassInfo(outerClassInfoIndex);
        var innerName = constantPool.getUTF8Info(jcr.getUintField(2));
        var innerClassAccessFlags = jcr.getUintField(2);
        classes[i] = new ClassEntry(innerClassInfo, outerClassInfo, innerName, innerClassAccessFlags);
      }

      return new InnerClassAttribute(attributeName, classes);
    };

    AttributeFactory.parseLineNumberTableAttribute = function(jcr, attributeName) {
      var lineNumberTableLength = jcr.getUintField(2);
      
      //An Array of LineNumberTableEntries
      var lineNumberTable = [];
      for (var i = 0; i < lineNumberTableLength; i++)
      {
        var startPC = jcr.getUintField(2);
        var lineNumber = jcr.getUintField(2);
        lineNumberTable[i] = new LineNumberTableEntry(startPC, lineNumber);
      }

      return new LineNumberTableAttribute(attributeName, lineNumberTable);
    };

    AttributeFactory.parseLocalVariableTable = function(jcr, constantPool, attributeName) {
      var localVariableTableLength = jcr.getUintField(2);
      
      //An Array of LocalVariableTableEntries
      var localVariableTable = [];
      for (var i = 0; i < localVariableTableLength; i++)
      {
        var startPC = jcr.getUintField(2);
        var length = jcr.getUintField(2);
        var nameIndex = jcr.getUintField(2);
        var name = constantPool.getUTF8Info(nameIndex);
        var descriptorIndex = jcr.getUintField(2);
        var descriptor = constantPool.getUTF8Info(descriptorIndex);
        var index = jcr.getUintField(2); //TODO: Does this actually mean anything?
        localVariableTable[i] = new LocalVariableTableEntry(startPC, name, descriptor);
      }

      return new LocalVariableTable(attributeName, localVariableTable);
    };

    AttributeFactory.parseCodeAttribute = function(jcr, constantPool, attributeName) {
      var maxStack = jcr.getUintField(2);
      var maxLocals = jcr.getUintField(2);
      
      //The actual bytecode for the method
      var codeLength = jcr.getUintField(4);
      
      var oldIndex = jcr.getOffset();
      
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
        var instr = jcr.getUintField(1);
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
            var uint1 = jcr.getUintField(1);
            insObj = new Instruction(2, instr, uint1);
            break;
            
          //TODO: Test 1 byte signed integer. Does it work?
          case ByteCode.codes.bipush:
            int1 = jcr.getIntField(1);
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
            int1 = jcr.getIntField(2);
            insObj = new Instruction(3, instr, int1);
            break;
          case ByteCode.codes.goto_w:
          case ByteCode.codes.jsr_w:
            int1 = jcr.getIntField(4);
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
            index = jcr.getUintField(2);
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
            index = jcr.getUintField(2);
            var field = constantPool.get(index);
            Util.assert(field.getTag() === Enum.constantPoolTag.FIELDREF);
            insObj = new Instruction(3, instr, field);
            break;
          
          //The runtime constant pool item at that index must be a symbolic reference to an
          //interface method (§5.1), which gives the name and descriptor (§4.3.3) of the
          //interface method as well as a symbolic reference to the interface in which the
          //interface method is to be found.
          case ByteCode.codes.invokeinterface:
            index = jcr.getUintField(2);
            var intMeth = constantPool.get(index);
            Util.assert(intMeth.getTag() === Enum.constantPoolTag.INTERFACEMETHODREF);
            var count = jcr.getUintField(1);
            //Waste a byte.
            var wasted = jcr.getUintField(1);
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
            index = jcr.getUintField(2);
            var method = constantPool.get(index);
            Util.assert(method.getTag() === Enum.constantPoolTag.METHODREF);
            insObj = new Instruction(3, instr, method);
            break;
          
          //The runtime constant pool entry at index either must be a runtime constant
          //of type int or float, or must be a symbolic reference to a string literal (§5.1)
          //OR A CLASS according to some versions of the spec. *sigh*
          case ByteCode.codes.ldc:
            uint1 = jcr.getUintField(1);
            constant = constantPool.get(uint1);
            
            Util.assert(constant.getTag() === Enum.constantPoolTag.INTEGER ||
              constant.getTag() === Enum.constantPoolTag.FLOAT ||
              constant.getTag() === Enum.constantPoolTag.STRING||
              constant.getTag() === Enum.constantPoolTag.CLASS);
            insObj = new Instruction(2, instr, constant);
            break;
          
          case ByteCode.codes.ldc_w:
            index = jcr.getUintField(2);
            constant = constantPool.get(index);
              
            Util.assert(constant.getTag() === Enum.constantPoolTag.INTEGER ||
              constant.getTag() === Enum.constantPoolTag.FLOAT ||
              constant.getTag() === Enum.constantPoolTag.STRING ||
              constant.getTag() === Enum.constantPoolTag.CLASS);
              
            insObj = new Instruction(3, instr, constant);
            break;
          
          //The runtime constant pool entry at the index must be a runtime constant of
          //type long or double.
          case ByteCode.codes.ldc2_w:
            index = jcr.getUintField(2);
            constant = constantPool.get(index);
            Util.assert(constant.getTag() === Enum.constantPoolTag.DOUBLE ||
              constant.getTag() === Enum.constantPoolTag.LONG);
            insObj = new Instruction(3, instr, constant);
            break;
          
          //TODO: 1 byte signed int
          case ByteCode.codes.iinc:
            uint1 = jcr.getUintField(1);
            int1 = jcr.getIntField(1);
            insObj = new Instruction(3, instr, uint1, int1);
            break;
          
          /**
           * Misc.
           */
          //The atype is a code that indicates the type of array to create. It must take
          //one of the following values [see table in docs]
          case ByteCode.codes.newarray:
            uint1 = jcr.getUintField(1);
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
            paddingVal = jcr.getUintField(padding);
            Util.assert(paddingVal === 0);
            default_ = jcr.getIntField(4);
            var npairs = jcr.getIntField(4);
            Util.assert(npairs >= 0);
            var matches = [];
            for (j = 0; j < npairs; j++)
            {
              matches[j] = [];
              matches[j].match = jcr.getIntField(4);
              if (j > 0) Util.assert(matches[j].match >= matches[j-1].match);
              matches[j].offset = jcr.getIntField(4);
            }
            insObj = new Instruction(9+padding+npairs*8, instr,9+padding+npairs*8, default_, npairs, matches);
            //default straight from javasoc, npairs number of pairs, matches is the matches
            break;
          case ByteCode.codes.tableswitch:
            padding = (4 - ((i+1)%4))%4; //Will be 0-3
            paddingVal = jcr.getUintField(padding);
            Util.assert(paddingVal === 0);
            default_ = jcr.getIntField(4);
            var low = jcr.getIntField(4);
            var high = jcr.getIntField(4);
            Util.assert(low <= high);
            var offsetCount = high-low+1;
            var offsets = [];
            for (j = 0; j < offsetCount; j++)
            {
              offsets[j] = jcr.getIntField(4);
            }
            insObj = new Instruction(13+padding+4*offsetCount, instr, 13+padding+4*offsetCount, default_, low, high, offsets);
            break;
          case ByteCode.codes.wide:
            var opcode = jcr.getUintField(1);
            index = jcr.getUintField(2);
            
            //The first form of the wide instruction modifies one of the instructions
            //iload, fload, aload, lload, dload, istore, fstore, astore, lstore, dstore, or ret.
            if (opcode != ByteCode.codes.iinc)
            {
              Util.assert(opcode === ByteCode.codes.iload ||
                opcode === ByteCode.codes.fload ||
                opcode === ByteCode.codes.aload ||
                opcode === ByteCode.codes.lload ||
                opcode === ByteCode.codes.dload ||
                opcode === ByteCode.codes.istore ||
                opcode === ByteCode.codes.fstore ||
                opcode === ByteCode.codes.astore ||
                opcode === ByteCode.codes.lstore ||
                opcode === ByteCode.codes.dstore ||
                opcode === ByteCode.codes.ret);
              insObj = new Instruction(4, instr, opcode, index);
            }
            //The second form applies only to the iinc instruction.
            else
            {
              constant = jcr.getIntField(2);
              insObj = new Instruction(6, instr, opcode, index, constant);
            }
            break;
          
          //The runtime constant pool item at the index must be a symbolic reference to a
          //class, array, or interface type.
          //TODO: Check.
          case ByteCode.codes.multianewarray:
            index = jcr.getUintField(2);
            var dim = jcr.getUintField(1);
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
      Util.assert(i === codeLength);
      Util.assert(jcr.index - oldIndex === codeLength);
      
      //An Array of ExceptionTableEntries
      var exceptionTableLength = jcr.getUintField(2);
      
      var exceptionTable = [];
      for (i = 0; i < exceptionTableLength; i++)
      {
        exceptionTable[i] = this.parseExceptionTableEntry(jcr, constantPool);
      }
      
      //NOTE: The Java spec permits us to entirely ignore these attributes.
      var attributesCount = jcr.getUintField(2);
      var attributeInfo = this.parseAttributes(jcr, attributesCount, constantPool);

      return new CodeAttribute(attributeName, maxStack, maxLocals, code, exceptionTable, attributeInfo);
    };

    AttributeFactory.parseExceptionTableEntry = function(jcr, constantPool) {
      var startPC = jcr.getUintField(2);
      var endPC = jcr.getUintField(2);
      var handlerPC = jcr.getUintField(2);
      var catchTypeIndex = jcr.getUintField(2);
      var catchType = constantPool.getClassInfo(catchTypeIndex);
      return new ExceptionTableEntry(startPC, endPC, handlerPC, catchType);
    };

    return AttributeFactory;
  }
);