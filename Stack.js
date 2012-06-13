/*
 * A basic stack implementation
 */
function Stack(){
	this.stack = [];
	this.length = 0;
	this.currentFrame = undefined;
}

Stack.prototype.pop = function() {
	return this.currentFrame.pop();
};

Stack.prototype.push = function(data) {
	this.currentFrame.push(data);
};

Stack.prototype.getCurrentMethodInfo = function() {
	return this.currentFrame.getMethodInfo();
};

Stack.prototype.pushFrame = function(methodInfo) {
	var newFrame = new Frame(methodInfo);
	this.currentFrame = newFrame;
	this.length = this.stack.push(newFrame);
	pushElement("----------------------------------");
	pushElement("Frame for Method " + methodInfo.classInfo.thisClassName + "." + methodInfo.name);
};

Stack.prototype.isFrameEmpty = function() {
	return this.currentFrame.isEmpty();
};

Stack.prototype.popFrame = function() {
	assert(!this.isEmpty());
	
	for (var i = 0; i < this.currentFrame.length() + 2; i++)
		popElement();
	
	var retVal = this.stack.pop();
	
	this.length = this.stack.length;
	
	if (this.isEmpty())
		this.currentFrame = undefined;
	else
		this.currentFrame = this.stack[this.stack.length-1];
	
	return retVal;
};

//Get an element as an offset from the top of the stack.
Stack.prototype.get = function(offset) {
	assert(!this.isEmpty());
	return this.stack[this.length - 1 - offset];
};

/**
 * Clears the stack.
 */
Stack.prototype.clear = function() {
	this.stack = [];
	this.length = 0;
	this.currentFrame = undefined;
};

Stack.prototype.setLocal = function(i, value) {
	this.currentFrame.setLocal(i, value);
};

Stack.prototype.getLocalsLength = function() {
	return this.currentFrame.getLocalsLength();
};

Stack.prototype.isEmpty = function() {
	return this.length === 0;
};

Stack.prototype.getLength = function() {
	return this.length;
};

Stack.prototype.getCurrentFrame = function() {
	return this.currentFrame;
};

/**
 * Gotta get rid of this.
 */
function currentFrame() {
    var frame = JVM.getExecutingThread().getCurrentFrame();
    assert(frame !== undefined);
    return frame;
}

