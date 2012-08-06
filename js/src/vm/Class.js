define(['vm/ConstantPool/ConstantPool', 'vm/FieldInfo', 'vm/Method', 'util/Util', 'vm/MethodRun', 'vm/JavaObject'],
  function(ConstantPool, FieldInfo, Method, Util, MethodRun, JavaObject) {
    "use strict";
    
    /* This is the representation of a Java class file */

    /*
     * Instantiate the class with initial information so we can pass it to the ClassLoader.
     * We will later fully instantiate it with other essential information (methods, firlds, etc).
     */
    function Class(minorVersion, majorVersion, constantPool, accessFlags, thisClassName) {
      this.minorVersion = minorVersion;
      this.majorVersion = majorVersion;
      this.constantPool = constantPool;
      this.accessFlags = accessFlags;
      this.thisClassName = thisClassName;

      //Cache deprecation search.
      this.deprecated = undefined;
      this.deprecationWarn = false;

      //Set to 'true' when the class is initialized (after all initialization functions are called).
      this.isInitialized = false;
    }

    /**
     * Finish instantiating the class with essential information.
     */
    Class.prototype.finishInstantiation = function(superClassName, interfaces, fields, methods, attributes) {
      this.superClass = undefined;
      this.superClassName = superClassName;
      this.interfaces = interfaces;
      this.fields = fields;
      this.methods = methods;
      this.attributes = attributes;

      /**
       * TODO(jvilk): Perhaps 'verify' the ConstantPool after this,
       * which would verify, clean up, and consolidate the bastard.
       * (e.g. CONSTANT_String_info -> String objects)
       */
    };

    /**
     * Get the super class's object, if exists.
     */
    Class.prototype.getSuperClass = function() {
      if (this.superClassName === undefined)
        return undefined;
      
      if (this.superClass !== undefined)
        return this.superClass;
        
      this.superClass = JVM.getClass(this.superClassName);
      return this.superClass;
    };

    /**
     * Get the static initializer function.
     * Not all classes have one, so it returns undefined if that is the case.
     */
    Class.prototype.getStaticInitializer = function() {
      for (var method in this.methods)
      {
        if (this.methods[method].isClinit())
        {
          return this.methods[method];
        }
      }

      return undefined;
    };

    /**
     * Get the value of the given static field.
     */
    Class.prototype.getStatic = function(fieldName, fieldDescriptor) {
      return this.getFieldAssert(fieldName, fieldDescriptor).getValue();
    };

    /**
     * Sets the value of the given static field to newValue.
     */
    Class.prototype.setStatic = function(fieldName, fieldDescriptor, newValue) {
      this.getFieldAssert(fieldName, fieldDescriptor).setValue(newValue);
    };

    /**
     * 'Initializes' the class by calling any needed static
     * initializers.
     *
     * A class or interface type T will be initialized immediately before one of the following occurs:
     * * T is a class and an instance of T is created.
     * * T is a class and a static method of T is invoked.
     * * A nonconstant static field of T is used or assigned. A constant field is one that is (explicitly
     *   or implicitly) both final and static, and that is initialized with the value of a compile-time
     *   constant expression. A reference to such a field must be resolved at compile time to a copy of
     *   the compile-time constant value, so uses of such a field never cause initialization.
     */
    Class.prototype.initialize = function() {
      //No need to initialize twice.
      if (this.isInitialized) return;
      
      //We will be initialized soon enough.
      this.isInitialized = true;
      
      //Deprecation check
      if (this.isDeprecated())
      {
        JVM.printError("WARNING: Using deprecated class \"" + this.name + "\".");
        this.deprecationWarn = true;
      }
      
      //Before a class or interface is initialized, its direct superclass must be initialized,
      //but interfaces implemented by the class need not be initialized.
      var superClass = this.getSuperClass();
      if (superClass !== undefined)
        superClass.initialize();
        
      //The initialization method of a class or interface is static and takes no arguments.
      //It has the special name <clinit>.
      var staticInitializer = this.getStaticInitializer();
      if (staticInitializer !== undefined)
      {
        MethodRun.callFromNative(this.thisClassName, "<clinit>", "()V");
        //JVM.getExecutingThread().popFrame(); //HACK: callFromNative creates a resume for the fcn that called this.
      }
    };

    /**
     * Returns true if the class is deprecated.
     */
    Class.prototype.isDeprecated = function() {
      if (this.deprecated !== undefined)
        return this.deprecated;
        
      for (var attribute in this.attributes)
      {
        if (this.attributes[attribute].attributeName === "Deprecated")
        {
          this.deprecated = true;
          return true;
        }
      }
      
      this.deprecated = false;
      return false;
    };

    /**
     * Checks if the class has a specific access flag.
     */
    Class.prototype.hasFlag = function(mask) {
      return (this.accessFlags & mask) === mask;
    };

    /**
     * Prints class information to the terminal.
     * TODO: Break up prototype toString functionality into separate function.
     */
    Class.prototype.toString = function() {
      var i;
      var output = [];

      //CONSTRUCT PROTOTYPE
      //Access Flags
      for (var x in Class.AccessFlags)
      {
        if (this.hasFlag(Class.AccessFlags[x]))
        {
          output.push(Class.AccessFlagStrings[x], " ");
        }
      }
      
      //This Class
      output.push(this.thisClassName, " ");
      //Super Class
      if (this.superClassName !== undefined)
      {
        output.push("extends ", this.superClassName, " ");
      }
      //Interfaces
      if (this.interfacesCount > 0) output.push("implements ");
      for (i = 0; i < this.interfacesCount; i++)
      {
        output.push(this.interfaces[i], " ");
      }

      output.push("\n\n");
      
      output.push("Fields:\n");
      //Fields
      for (i = 0; i < this.fieldsCount; i++)
      {
        output.push(this.fields[i].toString(), "\n");
      }

      output.push("\n\n");
      output.push("Methods:\n");
      //Methods
      for (i = 0; i < this.methodsCount; i++)
      {
        output.push(this.methods[i].toString(), "\n");
      }
      
      output.push("\n\n");
      output.push("Attributes:\n");
      //Attributes
      for (i = 0; i < this.attributesCount; i++)
      {
        output.push(this.attributes[i].toString(), "\n");
      }
      
      output.push("\n\n");
      output.push("END CLASS\n");
      
      return output.join("");
    };

    /**
     * Checks if the given className is a parent class or an interface implemented
     * by this class.
     */
    Class.prototype.isA = function(className) {
      if (className === "java/lang/Object")
        return true;
        
      if (className === this.superClassName)
        return true;
        
      for (var i in this.interfaces)
      {
        var interfaceInfo = JVM.getClass(this.interfaces[i]);
        if (interfaceInfo.isA(className))
          return true;
      }
      
      return JVM.getClass(this.superClassName).isA(className);
    };

    /**
     * Checks if the class implements the given interface.
     */
    Class.prototype.implementsInterface = function(interfaceName) {
      for (var i in this.interfaces)
      {
        var interfaceInfo = JVM.getClass(this.interfaces[i]);
        if (interfaceInfo.isA(interfaceName))
          return true;
      }
      
      return false;
    };

    /**
     * Get a JavaScript object with an instantiated version of this class.
     * Meaning, it's not initialized, but its instance fields have default
     * values.
     */
    Class.prototype.getInstantiation = function() {
      return new JavaObject(this);
    };

    /**
     * Populate a Java object of this class type with the
     * fields of this class and its super class (recursive).
     * Should only be called by JavaObject's constructor!
     */
    Class.prototype._populateObjectFields = function(object) {
      //object.fields = new Array();
      object.fields[this.thisClassName] = [];
      for (var i = 0; i < this.fields.length; i++)
      {
        var field = this.fields[i];
        
        //Static fields live in the class, not in the object.
        if (!field.hasFlag(FieldInfo.AccessFlags.STATIC))
        {
          object.fields[this.thisClassName][field.name] = field.getDefaultValue();
        }
      }
      var superClass = this.getSuperClass();
      if (superClass !== undefined)
        superClass._populateObjectFields(object);
    };

    /**
     * Get a Method object by its name and descriptor.
     *
     * Called recursively on its parent classes.
     *
     * Returns nothing if it cannot be found.
     * TODO: Optimize. Save methods in arrays?
     */
    Class.prototype.getMethod = function(name, descriptor)
    {
      for (var i = 0; i < this.methods.length; i++)
      {
        var method = this.methods[i];
        if(method.name === name){
          JVM.debugPrint(method.descriptor);
        }
        if (method.name === name && method.descriptor === descriptor)
          return method;
      }
      
      var superClass = this.getSuperClass();
      if (superClass !== undefined)
        return superClass.getMethod(name, descriptor);
        
      return undefined;
    };

    /**
     * Get a FieldInfo for the field with the given name and descriptor.
     */
    Class.prototype.getField = function(name, descriptor)
    {
      //alert(name + ": " + descriptor);
      for (var i = 0; i < this.fields.length; i++)
      {
        var field = this.fields[i];
        if (field.name === name && field.descriptor === descriptor)
          return field;
      }
      
      var superClass = this.getSuperClass();
      if (superClass !== undefined)
        return superClass.getField(name, descriptor);
        
      return undefined;
    };

    /**
     * Same function as getMethod, except this method Util.asserts
     * that it does not return an undefined method.
     */
    Class.prototype.getMethodAssert = function(name, descriptor) {
      var methodInfo = this.getMethod(name,descriptor);
      Util.assert(methodInfo !== undefined);
      return methodInfo;
    };

    /**
     * Same as getField, but it Util.asserts that the returned field
     * is not undefined.
     */
    Class.prototype.getFieldAssert = function(name, descriptor) {
      var field = this.getField(name, descriptor);
      Util.assert(field !== undefined);
      return field;
    };

    /**
     * SUBTYPES
     */

    /*The types of access the Class may have */
    Class.AccessFlagStrings = {
      PUBLIC : "public",
      FINAL : "final",
      SUPER : "super",
      INTERFACE : "interface",
      ABSTRACT : "abstract"
    };
    /*The masks needed to check for access*/
    Class.AccessFlags = {
      PUBLIC : 0x0001,
      FINAL : 0x0010,
      SUPER : 0x0020,
      INTERFACE : 0x0200,
      ABSTRACT : 0x0400
    };

    return Class;
  }
);