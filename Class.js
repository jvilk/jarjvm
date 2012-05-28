/* This is the representation of a Java class file */

/*
 * javaClassReader: A JavaClassReader object attached to the raw data for this class.
 */
function Class(javaClassReader) {
	/**
	 * PARSING ACTION
	 */
	
	//u4 magic;
	var magic = javaClassReader.getUintField(4);

	//Why not?
	if (magic != 0xCAFEBABE) {
		addErrorToConsole("ERROR: Magic value 0xCAFEBABE not found! Instead: " + magic);
	}

	//u2 minor_version;
	this.minorVersion = javaClassReader.getUintField(2);
	//u2 major_version;
	this.majorVersion = javaClassReader.getUintField(2);
	
	this.constantPool = new ConstantPool(javaClassReader);

	//u2 access_flags;
	this.accessFlags = javaClassReader.getUintField(2);
	
	//u2 this_class;
	this.thisClassIndex = javaClassReader.getUintField(2);
	this.thisClassName = CONSTANTPOOL.getClassInfo(this.thisClassIndex);
	
	//Register myself. This is very important, or else we could get into infinite loading loops.
	//Trying a Hack to load system
	if (this.thisClassName == "System"){
		CLASSES["java/lang/System"] = this;
	}else if (this.thisClassName == "PrintStream"){
		CLASSES["java/io/PrintStream"] = this;
	}else{
		CLASSES[this.thisClassName] = this;
	}
	
	
	//u2 super_class;
	this.superClassIndex = javaClassReader.getUintField(2);
	this.superClassName = CONSTANTPOOL.getClassInfo(this.superClassIndex);
	//Lazily evaluate.
	this.superClass = undefined;

	//u2 interfaces_count;
	this.interfacesCount = javaClassReader.getUintField(2);
	this.interfaces = new Array();
	//u2 interfaces[interfaces_count];
	for(var i = 0; i < this.interfacesCount; i++) {
		this.interfaces[i] = new Array();
		this.interfaces[i].interfaceIndex = javaClassReader.getUintField(2);
		this.interfaces[i].className = CONSTANTPOOL.getClassInfo(this.interfaces[i].interfaceIndex);
	}

	//u2 fields_count;
	this.fieldsCount = javaClassReader.getUintField(2);
	this.fields = new Array();
	//field_info fields[fields_count];
	for(var i = 0; i < this.fieldsCount; i++) {
		this.fields[i] = new FieldInfo(javaClassReader, this);
	}

	//u2 methods_count;
	this.methodsCount = javaClassReader.getUintField(2);
	this.methods = new Array();
	//method_info methods[methods_count];
	for(var i = 0; i < this.methodsCount; i++) {
		this.methods[i] = new MethodInfo(javaClassReader, this);
	}

	//u2 attributes_count;
	this.attributesCount = javaClassReader.getUintField(2);
	//attribute_info attributes[attributes_count];
	this.attributes = makeAttributes(javaClassReader, this.attributesCount);
	
	//Cache deprecation search.
	this.deprecated = undefined;
	this.deprecationWarn = false;
	
	//Switched to 'true' when initialized.
	this.isInitialized = false;
	
	//Finish initializing the fields. We need to do this here because it may
	//trigger other classes to load, which would change CONSTANTPOOL.
	for (var i = 0; i < this.fields.length; i++)
	{
		this.fields[i]._initializeDefaultValue();
	}
	
	//Call the print function.
	//this.print();
}

/**
 * Get the super class's object, if exists.
 */
Class.prototype.getSuperClass = function() {
	if (this.superClassName == undefined)
		return undefined;
	
	if (this.superClass != undefined)
		return this.superClass;
		
	this.superClass = Class.getClass(this.superClassName);
	return this.superClass;
}

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
}

/**
 * Get the value of the given static field. 
 */
Class.prototype.getStatic = function(fieldName, fieldDescriptor) {
	return this.getFieldAssert(fieldName, fieldDescriptor).getValue();
}

/**
 * Sets the value of the given static field to newValue.
 */
Class.prototype.setStatic = function(fieldName, fieldDescriptor, newValue) {
	this.getFieldAssert(fieldName, fieldDescriptor).setValue(newValue);
}

/**
 * 'Initializes' the class by calling any needed static
 * initializers.
 * 
 * A class or interface type T will be initialized immediately before one of the following occurs:
 * * T is a class and an instance of T is created.
 * * T is a class and a static method of T is invoked.
 * * A nonconstant static field of T is used or assigned. A constant field is one that is (explicitly 
 * 	 or implicitly) both final and static, and that is initialized with the value of a compile-time 
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
		addErrorToConsole("WARNING: Using deprecated class \"" + this.name + "\".");
		this.deprecationWarn = true;
	}
	
	//Before a class or interface is initialized, its direct superclass must be initialized, 
	//but interfaces implemented by the class need not be initialized.
	var superClass = this.getSuperClass();
	if (superClass != undefined)
		superClass.initialize();
		
	//The initialization method of a class or interface is static and takes no arguments. 
	//It has the special name <clinit>.
	var staticInitializer = this.getStaticInitializer();
	if (staticInitializer != undefined)
	{
		MethodRun.callFromNative(this.thisClassName, "<clinit>", "()V");
		//STACK.currentFrame.pop(); //HACK: callFromNative creates a resume for the fcn that called this.
	}
}

/**
 * Returns true if the class is deprecated.
 */
Class.prototype.isDeprecated = function() {
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
}

/**
 * Checks if the class has a specific access flag.
 */
Class.prototype.hasFlag = function(mask) {
	return (this.accessFlags & mask) == mask;
}

/**
 * Prints class information to the terminal.
 */
Class.prototype.print = function() {
	//CONSTRUCT PROTOTYPE
	addTextToConsole("");
	//Access Flags
	for (var x in Class.AccessFlags)
	{	
		if (this.hasFlag(Class.AccessFlags[x]))
		{
			addTextToCurrentLine(Class.AccessFlagStrings[x] + " ");
		}
	}
	
	//This Class
	addTextToCurrentLine(this.thisClassName + " ");
	//Super Class
	if (this.superClassIndex > 0)
	{
		addTextToCurrentLine("extends " + this.superClassName + " ");
	}
	//Interfaces
	if (this.interfacesCount > 0) addTextToCurrentLine("implements ");
	for (var i = 0; i < this.interfacesCount; i++)
	{
		addTextToCurrentLine(this.interfaces[i].className + " ");
	}
	addTextToConsole("\n");
	
	//this.constantPool.print();
	//addTextToConsole("\n");
	
	addTextToConsole("Fields:");
	//Fields
	for (var i = 0; i < this.fieldsCount; i++)
	{
		this.fields[i].print();
	}

	addTextToConsole("\n");
	addTextToConsole("Methods:");
	//Methods
	for (var i = 0; i < this.methodsCount; i++)
	{
		this.methods[i].print();
	}
	
	addTextToConsole("\n");
	addTextToConsole("Attributes:");
	//Attributes
	for (var i = 0; i < this.attributesCount; i++)
	{
		this.attributes[i].print();
	}
	
	addTextToConsole("\n");
	addTextToConsole("END CLASS");
	
	promptForUserInput();
}

/**
 * Checks if the given className is a parent class or an interface implemented
 * by this class.
 */
Class.prototype.isA = function(className) {
	if (className == "java/lang/Object")
		return true;
		
	if (className == this.superClassName)
		return true;
		
	for (var i in this.interfaces)
	{
		var interfaceInfo = Class.getClass(this.interfaces[i].className);
		if (interfaceInfo.isA(className))
			return true;
	}
	
	return Class.getClass(this.superClassName).isA(className);
}

/**
 * Checks if the class implements the given interface.
 */
Class.prototype.implementsInterface = function(interfaceName) {
	for (var i in this.interfaces)
	{
		var interfaceInfo = Class.getClass(this.interfaces[i].className);
		if (interfaceInfo.isA(interfaceName))
			return true;
	}
	
	return false;
}

/**
 * Get a JavaScript object with an instantiated version of this class.
 * Meaning, it's not initialized, but its instance fields have default
 * values.
 */
Class.prototype.getInstantiation = function() {
	var object = new JavaObject(this);
	this._populateObjectFields(object);
	return object;
}

/**
 * Populate a Java object of this class type with the
 * fields of this class and its super class (recursive). 
 * Used internally by getInstantiation.
 */
Class.prototype._populateObjectFields = function(object) {
	//object.fields = new Array();
	object.fields[this.thisClassName] = new Array();
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
	if (superClass != undefined)
		superClass._populateObjectFields(object);
}

/**
 * Get a MethodInfo object by its name and descriptor.
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
		if(method.name == name){
			addTextToConsole(method.descriptor);
		}
		if (method.name == name && method.descriptor == descriptor)
			return method;
	}
	
	var superClass = this.getSuperClass();
	if (superClass != undefined)
		return superClass.getMethod(name, descriptor);
		
	return undefined;
}

/**
 * Get a FieldInfo for the field with the given name and descriptor.
 */
Class.prototype.getField = function(name, descriptor)
{
	//alert(name + ": " + descriptor); 
	for (var i = 0; i < this.fields.length; i++)
	{
		var field = this.fields[i];
		if (field.name == name && field.descriptor == descriptor)
			return field;
	}
	
	var superClass = this.getSuperClass();
	if (superClass != undefined)
		return superClass.getField(name, descriptor);
		
	return undefined;
}

/**
 * Same function as getMethod, except this method asserts
 * that it does not return an undefined method.
 */
Class.prototype.getMethodAssert = function(name, descriptor) {
	var methodInfo = this.getMethod(name,descriptor);
	assert(methodInfo != undefined);
	return methodInfo;
}

/**
 * Same as getField, but it asserts that the returned field
 * is not undefined.
 */
Class.prototype.getFieldAssert = function(name, descriptor) {
	var field = this.getField(name, descriptor);
	assert(field != undefined);
	return field;
}

/**
 * SUBTYPES
 */

/*The types of access the Class may have */
Class.AccessFlagStrings = {
	PUBLIC : "public",
	FINAL : "final",
	SUPER : "super",
	INTERFACE : "interface",
	ABSTRACT : "abstract",
};
/*The masks needed to check for access*/
Class.AccessFlags = {
	PUBLIC : 0x0001,
	FINAL : 0x0010,
	SUPER : 0x0020,
	INTERFACE : 0x0200,
	ABSTRACT : 0x0400,
};

/**
 * Our "class loader". Given a class name, it either loads it
 * from the array, or, failing that, loads it from the JRE.
 */
Class.getClass = function(className) {
	//Check if it's in the array.
	if (className in CLASSES)
		return CLASSES[className];
		
	addTextToConsole("Loading class: " + className);
 
 	var url = document.URL; //Url now has the url up to the current directory without the trailing slash
 	url = url.substr(0, url.lastIndexOf('/'));

	//Synchronously get the JRE class.
	var request = new XMLHttpRequest();
	request.overrideMimeType('text/plain; charset=x-user-defined'); 
	request.open('GET', url + "/jre/" + className + ".class", false);
	request.send(null);

	//Ensure success.
	assert(request.status == 200);

	//Wrap the data so it's interpreted correctly.	
	var contentWrapped = new Object();
	contentWrapped.content = request.responseText;
	contentWrapped.length = contentWrapped.content.length;
	contentWrapped.charCodeAt = function(x) { return this.content.charCodeAt(x) & 0xFF; };
	
	//Load the class.
	var javaClassReader = new JavaClassReader(contentWrapped);
	var aClass = new Class(javaClassReader);
	
	return aClass;
}