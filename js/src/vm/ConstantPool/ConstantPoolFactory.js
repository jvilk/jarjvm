define(['vm/Enum', 'vm/ConstantPool/ConstantPool', 'vm/ConstantPool/ConstantBigNumberInfo', 'vm/ConstantPool/ConstantClassInfo',
  'vm/ConstantPool/ConstantNameAndTypeInfo', 'vm/ConstantPool/ConstantNumberInfo', 'vm/ConstantPool/ConstantRefInfo',
  'vm/ConstantPool/ConstantStringInfo', 'vm/ConstantPool/ConstantUTF8Info', 'vm/ConstantPool/ConstantMethodHandleInfo',
  'vm/ConstantPool/ConstantMethodTypeInfo', 'vm/ConstantPool/ConstantInvokeDynamicInfo', 'util/Util', 'vm/Primitives'],
  function(Enum, ConstantPool, ConstantBigNumberInfo, ConstantClassInfo, ConstantNameAndTypeInfo,
    ConstantNumberInfo, ConstantRefInfo, ConstantStringInfo, ConstantUTF8Info, ConstantMethodHandleInfo,
    ConstantMethodTypeInfo, ConstantInvokeDynamicInfo, Util, Primitives) {
    "use strict";

    /**
     * Contains methods for creating a constant pool.
     */
    var ConstantPoolFactory = {};

    /**
     * Parses a constant pool from a JavaClassReader positioned at the
     * start of the constant pool.
     */
    ConstantPoolFactory.parseConstantPool = function(jcr) {
      var i;
      
      /**
       * PARSING
       */
      
      //u2 constant_pool_count;
      var count = jcr.getUintField(2);
      var tag, bytes, name_index;
      var cpItems = [];

      //cp_info constant_pool[constant_pool_count-1];
      //NOTE: Index 0 of the constant pool is reserved for use by the JVM, and is not
      //in the class file.
      for(i = 1; i < count; i++) {
        tag = jcr.getUintField(1);

        switch(tag) {
          case Enum.constantPoolTag.CLASS:
            name_index = jcr.getUintField(2);
            cpItems[i] = new ConstantClassInfo(name_index);
            break;
          case Enum.constantPoolTag.FIELDREF:
          case Enum.constantPoolTag.METHODREF:
          case Enum.constantPoolTag.INTERFACEMETHODREF:
            var class_index = jcr.getUintField(2);
            var name_and_type_index = jcr.getUintField(2);
            cpItems[i] = new ConstantRefInfo(tag, class_index, name_and_type_index);
            break;
          case Enum.constantPoolTag.STRING:
            var string_index = jcr.getUintField(2);
            cpItems[i] = new ConstantStringInfo(string_index);
            break;
          case Enum.constantPoolTag.INTEGER:
            bytes = Primitives.getInteger(jcr.getIntField(4));
            cpItems[i] = new ConstantNumberInfo(tag, bytes);
            break;
          case Enum.constantPoolTag.FLOAT:
            bytes = Primitives.getFloat(jcr.getFloatField());
            cpItems[i] = new ConstantNumberInfo(tag, bytes);
            break;
          case Enum.constantPoolTag.LONG:
            var long_value = jcr.getLongField();
            cpItems[i] = new ConstantBigNumberInfo(tag, long_value);
            //8 byte constants take up two slots.
            i++;
            break;
          case Enum.constantPoolTag.DOUBLE:
            var double_field = Primitives.getDouble(jcr.getDoubleField());
            cpItems[i] = new ConstantBigNumberInfo(tag, double_field);
            //8 byte constants take up two slots.
            i++;
            break;
          case Enum.constantPoolTag.NAMEANDTYPE:
            name_index = jcr.getUintField(2);
            var descriptor_index = jcr.getUintField(2);
            cpItems[i] = new ConstantNameAndTypeInfo(name_index, descriptor_index);
            break;
          case Enum.constantPoolTag.UTF8:
            var length = jcr.getUintField(2);
            var string = jcr.getUTF8Field(length);
            cpItems[i] = new ConstantUTF8Info(string);
            break;
          case Enum.constantPoolTag.METHODHANDLE:
            var referenceKind = jcr.getUintField(1);
            var referenceIndex = jcr.getUintField(2);
            cpItems[i] = new ConstantMethodHandleInfo(referenceKind, referenceIndex);
            break;
          case Enum.constantPoolTag.METHODTYPE:
            var descriptorIndex = jcr.getUintField(2);
            cpItems[i] = new ConstantMethodTypeInfo(descriptorIndex);
            break;
          case Enum.constantPoolTag.INVOKEDYNAMIC:
            var bootstrapMethodAttr = jcr.getUintField(2);
            var natIndex = jcr.getUintField(2);
            cpItems[i] = new ConstantInvokeDynamicInfo(bootstrapMethodAttr, natIndex);
            break;
          default:
            JVM.printError("ERROR: Unable to determine the 'tag' element of a cp_info struct: " + tag + ".");
            break;
        }
      }

      //Ensure that all constant pool items were parsed.
      //Note that this assertion can fail if the CP length is 1 less
      //than intended, and the last item is a double / long.
      Util.assert(i === count);

      //Create the constant pool.
      return new ConstantPool(cpItems, count);
    };

    return ConstantPoolFactory;
  }
);