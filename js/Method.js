define(['Util', 'NativeFunctions'],
  function (Util, NativeFunctions) {
    /**
     * Represents a method.
     */
    function Method(classInfo, accessFlags, name, descriptor, methodDescriptor, attributes) {
      this.accessFlags = accessFlags;
      this.name = name;
      this.descriptor = descriptor;
      this.methodDescriptor = methodDescriptor;
      this.attributes = attributes;
      this.classInfo = classInfo;

      //Will be lazily evaluated by functions.
      this.codeAttribute = undefined;
      this.deprecated = undefined;
      this.deprecationWarned = false;
      this.isInit = undefined;

      //If it's native, get its code from NativeFunctions.
      if (this.hasFlag(Method.AccessFlags.NATIVE))
      {
        this.execute = NativeFunctions.getNativeFunction(this.classInfo.thisClassName, name, descriptor);
        this.exception = function() {
          JVM.printError("JVM ERROR: The JVM tried to look for an exception handler in a native function.");
        };
      }
    }

    /**
     * Checks if the Method has a specific access flag.
     */
    Method.prototype.hasFlag = function(mask) {
      return (this.accessFlags & mask) == mask;
    };

    /**
     * Checks if this Method object is <clinit>.
     */
    Method.prototype.isClinit = function() {
      return this.name == "<clinit>";
    };

    /**
     * Checks if this Method object is an object constructor.
     */
    Method.prototype.isConstructor = function() {
      if (this.isInit !== undefined)
        return this.isInit;
      
      this.isInit = this.name == "<init>";
      return this.isInit;
    };

    /**
     * Return a string representation of the entire method.
     * If errorPC is specified, then we also add an arrow to the output at that
     * line to point it out as the cause of our grief.
     */
    Method.prototype.toStringWithCode = function(errorPC) {
      //Get the signature.
      var output = [];
      output.push(this.toString());

      var numAttributes = this.attributes.length;
      var i;
      for (i= 0; i < numAttributes; i++) {
        //We only care about the one Code attribute.
        if (this.attributes[i].attributeName == "Code") {
          output.push("\n", this.attributes[i].toString(errorPC));
          break;
        }
      }

      return output.join("");
    };

    /**
     * Get a string representation of this method (namely, its signature).
     * For the full code, try toStringWithCode
     */
    Method.prototype.toString = function() {
      var output = [];
      
      for (var x in Method.AccessFlags)
      {
        if (this.hasFlag(Method.AccessFlags[x]))
        {
          output.push(Method.AccessFlagStrings[x], " ");
        }
      }
      output.push(this.classInfo.thisClassName, ".", this.name, " ", this.descriptor);
      
      return output.join("");
    };

    /**
     * Lazily finds the code attribute. Returns undefined if one does not
     * exist.
     */
    Method.prototype.getCodeAttribute = function() {
      if (this.codeAttribute !== undefined) return this.codeAttribute;
      
      for (var i in this.attributes)
      {
        if (this.attributes[i].attributeName == "Code")
        {
          this.codeAttribute = this.attributes[i];
          return this.codeAttribute;
        }
      }
      
      return undefined;
    };

    /**
     * Returns true if method is deprecated.
     * False otherwise.
     */
    Method.prototype.isDeprecated = function() {
      if (this.deprecated !== undefined)
        return this.deprecated;
      
      for (var attribute in this.attributes)
      {
        if (this.attributes[attribute].attributeName == "Deprecated")
        {
          this.deprecated = true;
          return true;
        }
      }
      this.deprecated = false;
      return false;
    };

    /**
     * Executes the method normally.
     */
    Method.prototype.execute = function() {
      //Begin static initialization of this method's class, unless this
      //is the static initializer.
      if (!this.isClinit()) {
        //JVM.debugPrint("Initializing my class...");
        this.classInfo.initialize();
      }
      
      //JVM.debugPrint("Initialized!");
      
      //PC of 0 means that execution is starting, not resuming.
      //Print a warning if calling a deprecated method.
      if (JVM.getExecutingThread().getPC() === 0 && this.isDeprecated() && !this.deprecationWarned)
      {
        JVM.printError("WARNING: Using deprecated method \"" + this.name + "\".");
        //We only want to warn once per method.
        this.deprecationWarned = true;
      }
      
      var codeAttribute = this.getCodeAttribute();
      Util.assert(codeAttribute !== undefined);
      
      codeAttribute.execute();
      //JVM.debugPrint("FINISHED execution!");
    };

    /**
     * Searches for an exception that needs to be handled, and takes the
     * necessary actions required to handle it.
     */
    Method.prototype.exception = function() {
      var codeAttribute = this.getCodeAttribute();
      Util.assert(codeAttribute !== undefined);
      
      var handlerPC = codeAttribute.exception();
      
      //Exception was handled by a catch or finally statement!
      if (handlerPC >= 0)
      {
        //Create a new MethodRun object for this method with the new PC.
        MethodRun.createResume(handlerPC);
      }
      //Exception was not handled. Tell the next function to handle it.
      else
      {
        //Pop this method's frame. It can't handle this exception!
        JVM.getExecutingThread().popFrame();
      
        //Fix MethodRun object of next method so it knows to handle
        //an exception.
        var methodRun = JVM.getExecutingThread().pop();
        methodRun.type = MethodRun.type.EXCEPTION;
        JVM.getExecutingThread().push(methodRun);
      }
    };

    Method.AccessFlagStrings = {
      PUBLIC : "public",
      PRIVATE : "private",
      PROTECTED : "protected",
      STATIC : "static",
      FINAL : "final",
      SYNCHRONIZED : "synchronized",
      NATIVE : "native",
      ABSTRACT : "abstract",
      STRICT : "strict"
    };

    Method.AccessFlags = {
      PUBLIC : 0x0001,
      PRIVATE : 0x0002,
      PROTECTED : 0x0004,
      STATIC : 0x0008,
      FINAL : 0x0010,
      SYNCHRONIZED : 0x0020,
      NATIVE : 0x0100,
      ABSTRACT : 0x0400,
      STRICT : 0x0800
    };

    return Method;
  }
);