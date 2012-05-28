/*Parsing Helper Functions*/
function parseObjectDescriptor(text) {
	var semicolon = text.indexOf(';');
	if(semicolon !== -1){
		var result = text.substr(1, semicolon - 1); //Ignore the L
		return result;
	}
}

function parseArrayDescriptor(text, numOfDim) {
	if(text.charAt(0) === '['){
		numOfDim += 1;
		return parseArrayDescriptor(text.substr(1), numOfDim);
	}else{
		var arrayType = parseFieldDescriptor(text);
		return new FieldArrayDescriptor(FieldDescriptor.type.ARRAY, numOfDim, arrayType);
	}
}

function parseParameters(descriptorText, args) {
	if(descriptorText.charAt(0) === ')'){
		var field = parseFieldDescriptor(descriptorText.substr(1));
		var method =  new MethodDescriptor(args,field);
		return method;
	}else{
		var descriptor = parseFieldDescriptor(descriptorText);
		args.push(descriptor);
		return parseParameters(descriptorText.substr(descriptor.length), args); //The last call should have changed the descriptorText
	}
}

/*Field Descriptor Objects */
FieldDescriptor.type = {
	BASE: "BASE",
	OBJECT: "OBJECT",
	ARRAY: "ARRAY"
};

FieldDescriptor.baseType = {
	BYTE:'B',
	CHAR: 'C',
	DOUBLE: 'D',
	FLOAT: 'F',
	INTEGER: 'I',
	LONG: 'L',
	SHORT: 'S',
	BOOLEAN: 'Z',
	VOID: 'V'
};

function FieldDescriptor(type,stringLenth) {
	this.type = type; //NOTE POssible length here of string...figure it out
	this.length = stringLenth; //Used by the parser to continue
}

function FieldObjectDescriptor(type, className) {
	var length = className.length + 2;
	inherits(this, "FieldDescriptor", type, length);
	this.className = className;
	
	this.toString = function(){
		return this.type + ", ClassName: " + this.className; 
	};
}

function FieldArrayDescriptor(type, numberOfDimension, arrayType) { //Array type could be a FieldObjectDescriptor or a FieldBaseDescriptor!!
	var length = numberOfDimension + arrayType.length;
	inherits(this, "FieldDescriptor", type, length);
	this.numberOfDimension = numberOfDimension;
	this.arrayType = arrayType;
	
	this.toString = function(){
			return this.type + ", NumOfDim: " + this.numberOfDimension + ", Array Type:[" + arrayType + "]";
	};
}

function FieldBaseDescriptor(type, baseValue) {
	inherits(this, "FieldDescriptor", type, 1);
	this.baseValue = baseValue;
	
	this.toString = function(){
		return this.type + ", PrimitiveType: " + this.baseValue; 
	};
}

function MethodDescriptor(args, returnType) {
	this.args = args;
	this.returnType = returnType;
	
	this.toString = function(){
		return "args: " + this.args.length + ", returnType: " + this.returnType;
	};
}


function parseFieldDescriptor(descriptorText) {
	//Obejct Type
	if(descriptorText.charAt(0) === 'L'){
		return new FieldObjectDescriptor(FieldDescriptor.type.OBJECT, parseObjectDescriptor(descriptorText));
	}
	//Array Type - Crazy Recursion
	else if(descriptorText.charAt(0) === '['){
		return parseArrayDescriptor(descriptorText, 0);
	}
	//Base Type
	else{
		return new FieldBaseDescriptor(FieldDescriptor.type.BASE, descriptorText.charAt(0));
	}
}

FieldDescriptor.baseType = {
	BYTE: 'B',
	CHAR: 'C',
	DOUBLE: 'D',
	FLOAT: 'F',
	INTEGER: 'I',
	LONG: 'J',
	SHORT: 'S',
	BOOLEAN: 'Z',
	VOID: 'V'
};


function parseMethodDescriptor(descriptorText) {
	assert(descriptorText != undefined);
	if(descriptorText.charAt(0) === '('){
		args = new Array();
		return parseParameters(descriptorText.substr(1), args);

	}
}

