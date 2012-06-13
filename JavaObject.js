/**
 * This file should have objects that are used to represent actual java instantiations
 */

function JavaObject(classInfo){
	this.classInfo = classInfo;
	//There are three basic types of data in the JVM: Objects, primitives, and
	//arrays. I'm an object.
	this.dataType = Data.type.OBJECT;
	
    /**
     * Array of fields.
     * 1st dimension: Classname
     * 2nd dimension: Field name
     * 3rd dimension: value
     *
     * We need to do this since an object may have multiple fields with the
     * same name from different parent classes due to things like private
     * fields.
     *
     * This array is instantiated with default values by
     * Class._populateObjectFields.
     */
	this.fields = [];
    classInfo._populateObjectFields(this);
}

/**
 * Checks if this Java object can be cast to the given type.
 */
JavaObject.prototype.isA = function(classDescriptor) {
	//If it's an array, return false.
	if (classDescriptor.charAt(0) == '[')
		return false;
		
	return this.classInfo.isA(classInfo);
};

/**
 * Get the value of a field of this object. Need the classname because
 * super classes can have same-name fields.
 */
JavaObject.prototype.getField = function(className, fieldName, fieldDescriptor)
{
	if (className in this.fields && fieldName in this.fields[className])
	{
		return this.fields[className][fieldName];
	}
	
	var classInfo = JVM.getClass(className);
	return classInfo.getStatic(fieldName, fieldDescriptor);
};

/**
 * Same as getField, but it extracts the arguments from a fieldInfo object.
 */
JavaObject.prototype.getFieldByFieldInfo = function(fieldInfo) {
	var className = fieldInfo.classInfo.thisClassName;
	var fieldName = fieldInfo.name;
	var fieldDescriptor = fieldInfo.descriptor;
	return this.getField(className, fieldName, fieldDescriptor);
};

/**
 * Same as setField, but it extracts className/fieldName/fieldDescriptor from a FieldInfo object.
 */
JavaObject.prototype.setFieldByFieldInfo = function(fieldInfo, newValue) {
	var className = fieldInfo.classInfo.thisClassName;
	var fieldName = fieldInfo.name;
	var fieldDescriptor = fieldInfo.descriptor;
	this.setField(className, fieldName, fieldDescriptor, newValue);
};

/**
 * Set the value of a field of this object.
 */
JavaObject.prototype.setField = function(className, fieldName, fieldDescriptor, newValue)
{
	if (className in this.fields && fieldName in this.fields[className])
	{
		
		this.fields[className][fieldName] = newValue;
	}
	else
	{
		var classInfo = JVM.getClass(className);
		classInfo.setStatic(fieldName, fieldDescriptor, newValue);
	}
};

/**
 * Pretty print for the stack.
 */
JavaObject.prototype.toString = function() {
	return "[" + this.classInfo.thisClassName + " ]";
};

/**
 * Create an identical copy of this object.
 */
JavaObject.prototype.clone = function() {
	var copy = new JavaObject(this.classInfo);
	//Copy the fields array.
	for (var field in this.fields)
	{
		copy.fields[field] = this.fields[field].slice(0);
	}
	
	return copy;
};

function JavaArray(elementType, elementClass, dimensions, length){
	this.elementType = elementType;
	this.elementClass = elementClass;
	this.dataType = Data.type.ARRAY;
	this.dimensions = dimensions;
	this.length = length;
	this.array = new Array(length);
}

/**
 * Checks if this Java array can be cast to the given type.
 */
JavaArray.prototype.isA = function(classDescriptor) {
	//Well, I am an object...
	if (classDescriptor == "java/lang/Object") {
		return true;
	}
	
	//If it's not an array of the same depth, return false.
	for (var i = 0; i < this.dimensions; i++)
	{
		if (classDescriptor.charAt(i) != '[')
			return false;
	}
	
	var descElementClassName = classDescriptor.slice(this.dimensions);
	
	//It's a primitive array.
	if (this.elementType != Data.type.OBJECT) {
		return descElementClassName == this.elementType;
	}
	
	//Call isA on the element. It's an object array..
	return this.elementClass.isA(descElementClassName);
};

/**
 * Clone the array.
 */
JavaArray.prototype.clone = function() {
	var copy = new JavaArray(this.elementType, this.elementClass, this.dimensions, this.length);
	
	//Recursively clone each dimension.
	//No longer needed!
	/**if (this.dimensions > 1)
	{
		for (var i = 0; i < this.length; i++)
		{
			copy.array[i] = this.array[i].clone();
		}
	}**/
	
	//Copy the element references.
	copy.array = this.array.slice(0);
	
	return copy;
};

/**
 * Clone a portion of the array from srcPos to length.
 */
JavaArray.prototype.clonePortion = function(srcPos, length) {
	var copy = new JavaArray(this.elementType, this.elementClass, this.dimensions, length);
	for (var index = srcPos; index < srcPos+length; index++)
	{
		//copy.set(i, this.get(i+srcPos));
		copy.set(index - srcPos, this.get(index));
	}
	
	return copy;
};

/**
 * Copy an array into this one starting at srcPos.
 */
JavaArray.prototype.copyInto = function(srcPos, arraySrc) {
	for (var i = 0; i < arraySrc.length; i++)
	{
		this.set(i+srcPos, arraySrc.get(i));
	}
};

/**
 * Set the item at index to value.
 */
JavaArray.prototype.set = function(index, value){
	this.array[index] = value;
	return;
};

/**
 * Pretty print for the stack.
 */
JavaArray.prototype.toString = function() {
	var type = this.elementType;
	
	if (this.elementType == Data.type.OBJECT)
		type = this.elementClass.thisClassName;
	
	var arrayPart = "";
	for (var i = 0; i < this.dimensions; i++)
	{
		arrayPart = "[" + arrayPart + "]";
	}
		
	return "[" + type + arrayPart + "]";
};

/**
 * Get the item at index.
 */
JavaArray.prototype.get = function(index){
	return this.array[index];
};

Data = {};

Data.type = {
	INTEGER: "int",
	DOUBLE: "double",
	FLOAT: "float",
	CHAR: "char",
	SHORT: "short",
	BYTE: "byte",
	BOOLEAN: "boolean",
	LONG: "long",
	VOID: "void",
	OBJECT: "object",
	ARRAY: "array",
	PRIMITIVE: "primitive"
};