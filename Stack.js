/*
 * A basic stack implementation
 */
function Stack(){
	this.stack = new Array();
	this.length = 0;
	this.currentFrame = undefined;

	this.empty = function() {
		return this.length == 0;
	};
	this.push = function(methodInfo) {
		var newFrame = new Frame(methodInfo);
		this.currentFrame = newFrame;
		this.length = this.stack.push(newFrame);
		pushElement("----------------------------------");
		pushElement("Frame for Method " + methodInfo.classInfo.thisClassName + "." + methodInfo.name);
	};
	this.pop = function() {
		assert(!this.empty());
		
		for (var i = 0; i < this.currentFrame.length() + 2; i++)
			popElement();
		
		var retVal = this.stack.pop();
		
		this.length = this.stack.length;
		
		if (this.empty()) 
			this.currentFrame = undefined;
		else
			this.currentFrame = this.stack[this.stack.length-1];
		
		return retVal;
	};
	
	//Get an element as an offset from the top of the stack.
	this.get = function(offset) {
		assert(!this.empty());
		return this.stack[this.length - 1 - offset];
	};
	
	/**
	 * Clears the stack.
	 */
	this.clear = function() {
		this.stack = new Array();
		this.length = 0;
		this.currentFrame = undefined;
	};
}

/**
 * Gone...all primitives are objects now, so no more stack elements
function StackElement(object,type){
	var value = object;
	var type = type; //Type must be a StackElement.type
}

StackElement.type = {
	boolean_:0,
	byte_:1,
	char_:2,
	short_:3,
	int_:4,
	float_:5,
	reference_:6,
	returnAddress_:7,
	long_:8,
	double_:9
}**/


function currentFrame() {
    var frame = STACK.currentFrame;
    assert(frame != undefined);
    return frame;
}

