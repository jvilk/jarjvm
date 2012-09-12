define(['vm/ConstantPool/ConstantPoolFactory', 'vm/Attributes/AttributeFactory', 'vm/FieldInfoFactory', 'vm/MethodFactory', 'util/Util', 'vm/Class'],
  function(ConstantPoolFactory, AttributeFactory, FieldInfoFactory, MethodFactory, Util, Class) {
    "use strict";

    var ClassFactory = {};

    ClassFactory.parseClass = function(jcr) {
      var i;

      //u4 magic;
      var magic = jcr.getUintField(4);

      //Why not?
      Util.assert(magic === 0xCAFEBABE && "ERROR: Magic value 0xCAFEBABE not found! Instead: " + magic);

      //u2 minor_version;
      var minorVersion = jcr.getUintField(2);
      //u2 major_version;
      var majorVersion = jcr.getUintField(2);
      
      var constantPool = ConstantPoolFactory.parseConstantPool(jcr);

      //u2 access_flags;
      var accessFlags = jcr.getUintField(2);
      
      //u2 this_class;
      var thisClassIndex = jcr.getUintField(2);
      var thisClassName = constantPool.getClassInfo(thisClassIndex);
      
      var klass = new Class(minorVersion, majorVersion, constantPool, accessFlags, thisClassName);

      //Register the class. This is very important, or else we could get into infinite loading loops.
      //Trying a Hack to load system
      if (thisClassName === "System"){
        JVM.registerClass("java/lang/System", klass);
      }else if (thisClassName === "PrintStream"){
        JVM.registerClass("java/io/PrintStream", klass);
      }else{
        JVM.registerClass(thisClassName, klass);
      }
      
      //u2 super_class;
      var superClassIndex = jcr.getUintField(2);
      var superClassName = constantPool.getClassInfo(superClassIndex);

      //u2 interfaces_count;
      var interfacesCount = jcr.getUintField(2);
      var interfaces = [];
      var interfaceIndex;
      //u2 interfaces[interfaces_count];
      for(i = 0; i < interfacesCount; i++) {
        interfaceIndex = jcr.getUintField(2);
        interfaces[i] = constantPool.getClassInfo(interfaceIndex);
      }

      //u2 fields_count;
      var fieldsCount = jcr.getUintField(2);
      var fields = [];
      //field_info fields[fields_count];
      for(i = 0; i < fieldsCount; i++) {
        fields[i] = FieldInfoFactory.parseFieldInfo(jcr, klass, constantPool);
      }

      //u2 methods_count;
      var methodsCount = jcr.getUintField(2);
      var methods = [];
      //method_info methods[methods_count];
      for(i = 0; i < methodsCount; i++) {
        methods[i] = MethodFactory.parseMethod(jcr, klass, constantPool);
      }

      //u2 attributes_count;
      var attributesCount = jcr.getUintField(2);
      //attribute_info attributes[attributes_count];
      var attributes = AttributeFactory.parseAttributes(jcr, attributesCount, constantPool);

      klass.finishInstantiation(superClassName, interfaces, fields, methods, attributes, fields);

      return klass;
    };

    return ClassFactory;
  }
);