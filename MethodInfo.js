/**
 * Represents a method.
 */
function MethodInfo(javaClassReader, classInfo) {
	
	/**
	 * MEMBER FUNCTIONS
	 */
	
	/**
	 * Checks if the MethodInfo has a specific access flag.
	 */
	this.hasFlag = function(mask) {
		return (this.accessFlags & mask) == mask;
	};
	
	/**
	 * Checks if this MethodInfo object is <clinit>.
	 */
	this.isClinit = function() {
		return this.name == "<clinit>";
	};

	/**
	 * Checks if this MethodInfo object is an object constructor.
	 */
	this.isConstructor = function() {
		if (this.isInit != undefined)
			return this.isInit;
		
		this.isInit = this.name == "<init>";
		return this.isInit;
	};

	/**
	 * Pretty print this method's signature to the terminal.
	 */
	this.print = function() {
		var output = "\t";
		
		//Step 1: Get a string representation of the access flags.
		for (var x in MethodInfo.AccessFlags)
		{
			if (this.hasFlag(MethodInfo.AccessFlags[x]))
			{
				output += MethodInfo.AccessFlagStrings[x] + " ";
			}
		}
		
		//Step 2: Get method name.
		output += this.name + " ";
		
		//Step 3: Get method signature.
		output += this.descriptor;
		
		if (this.hasFlag(MethodInfo.AccessFlags.NATIVE))
			addErrorToConsole(output);
		else
			addTextToConsole(output);
	};
	
	/**
	 * Convert to string.
	 */
	this.toString = function() {
		var output = "";
		
		for (var x in MethodInfo.AccessFlags)
		{
			if (this.hasFlag(MethodInfo.AccessFlags[x]))
			{
				output += MethodInfo.AccessFlagStrings[x] + " ";
			}
		}
		output += this.classInfo.thisClassName + "." + this.name + " " + this.descriptor;
		
		return output;
	};
	
	/**
	 * Lazily finds the code attribute. Returns undefined if one does not
	 * exist.
	 */
	this.getCodeAttribute = function() {
		if (this.codeAttribute != undefined) return this.codeAttribute;
		
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
	this.isDeprecated = function() {
		if (this.deprecated != undefined) 
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
	this.execute = function() {
		//Begin static initialization of this method's class, unless this
		//is the static initializer.
		if (!this.isClinit()) {
			//addTextToConsole("Initializing my class...");
			this.classInfo.initialize();
		}
		
		//addTextToConsole("Initialized!");
		
		//PC of 0 means that execution is starting, not resuming.
		//Print a warning if calling a deprecated method.
		if (PC == 0 && this.isDeprecated() && !this.deprecationWarned)
		{
			addErrorToConsole("WARNING: Using deprecated method \"" + this.name + "\".");
			//We only want to warn once per method.
			this.deprecationWarned = true;
		}
		
		var codeAttribute = this.getCodeAttribute();
		assert(codeAttribute != undefined);
		
		codeAttribute.execute();
		//addTextToConsole("FINISHED execution!");
	};
	
	/**
	 * Searches for an exception that needs to be handled, and takes the
	 * necessary actions required to handle it.
	 */
	this.exception = function() {
		var codeAttribute = this.getCodeAttribute();
		assert(codeAttribute != undefined);
		
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
			STACK.pop();
		
			//Fix MethodRun object of next method so it knows to handle
			//an exception.
			var methodRun = STACK.currentFrame.pop();
			methodRun.type = MethodRun.type.EXCEPTION;
			STACK.currentFrame.push(methodRun);
		}
	};
	
	this.classInfo = classInfo;
	this.accessFlags = javaClassReader.getUintField(2);
	
	this.nameIndex = javaClassReader.getUintField(2);
	this.name = CONSTANTPOOL.getUTF8Info(this.nameIndex);
	
	this.descriptorIndex = javaClassReader.getUintField(2);
	this.descriptor = CONSTANTPOOL.getUTF8Info(this.descriptorIndex);
	this.methodDescriptor = parseMethodDescriptor(this.descriptor);
	
	this.attributesCount = javaClassReader.getUintField(2);
	this.attributes = makeAttributes(javaClassReader, this.attributesCount);
	
	//Will be lazily evaluated by functions.
	this.codeAttribute = undefined;
	this.deprecated = undefined;
	this.deprecationWarned = false;
	this.isInit = undefined;
	
	//If it's native, get its code from NativeFunctions.
	if (this.hasFlag(MethodInfo.AccessFlags.NATIVE))
	{
		this.execute = getNativeFunction(this.classInfo.thisClassName, this.name, this.descriptor);
		this.exception = function() {
			addErrorToConsole("JVM ERROR: The JVM tried to look for an exception handler in a native function.");
		}
	}
}

MethodInfo.AccessFlagStrings = {
	PUBLIC : "public",
	PRIVATE : "private",
	PROTECTED : "protected",
	STATIC : "static",
	FINAL : "final",
	SYNCHRONIZED : "synchronized",
	NATIVE : "native",
	ABSTRACT : "abstract",
	STRICT : "strict"
}

MethodInfo.AccessFlags = {
	PUBLIC : 0x0001,
	PRIVATE : 0x0002,
	PROTECTED : 0x0004,
	STATIC : 0x0008,
	FINAL : 0x0010,
	SYNCHRONIZED : 0x0020,
	NATIVE : 0x0100,
	ABSTRACT : 0x0400,
	STRICT : 0x0800
}