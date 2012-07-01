define(['vm/Attributes/AttributeFactory', 'util/Util', 'vm/FieldInfo'],
  function(AttributeFactory, Util, FieldInfo) {
    FieldInfoFactory = {};

    FieldInfoFactory.parseFieldInfo = function(jcr, klass, constantPool) {
      var accessFlags = jcr.getUintField(2);
      var nameIndex = jcr.getUintField(2);
      var name = constantPool.getUTF8Info(nameIndex);
      var descriptorIndex = jcr.getUintField(2);
      var descriptor = constantPool.getUTF8Info(descriptorIndex);
      var attributesCount = jcr.getUintField(2);
      var fieldDescriptor = Util.parseFieldDescriptor(descriptor);
      var attributes = AttributeFactory.parseAttributes(jcr, attributesCount, constantPool);

      return new FieldInfo(klass, accessFlags, name, descriptor, attributesCount, fieldDescriptor, attributes);
    };

    return FieldInfoFactory;
  }
);