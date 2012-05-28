/*
 * A basic stack implementation
 */
function Stack(){
	this.stack = new Array();
	this.length = 0;
	this.currentFrame = undefined;
}

Stack.prototype.empty = function() {
	return this.length == 0;
}

Stack.prototype.push = function(methodInfo) {
	var newFrame = new Frame(methodInfo);
	this.currentFrame = newFrame;
	this.length = this.stack.push(newFrame);
	pushElement("----------------------------------");
	pushElement("Frame for Method " + methodInfo.classInfo.thisClassName + "." + methodInfo.name);
}

Stack.prototype.pop = function() {
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
}

//Get an element as an offset from the top of the stack.
Stack.prototype.get = function(offset) {
	assert(!this.empty());
	return this.stack[this.length - 1 - offset];
}

/**
 * Clears the stack.
 */
Stack.prototype.clear = function() {
	this.stack = new Array();
	this.length = 0;
	this.currentFrame = undefined;
}

function currentFrame() {
    var frame = STACK.currentFrame;
    assert(frame != undefined);
    return frame;
}

