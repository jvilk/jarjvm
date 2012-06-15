define(['Stack'], function (Stack) {
	function Thread() {
		this.stack = new Stack();
		this.pc = 0;
		this.contextswitch = false;
	}

	Thread.prototype.getPC = function() {
		return this.pc;
	};

	Thread.prototype.setPC = function(newPC) {
		this.pc = newPC;
	};

	Thread.prototype.incrementPC = function(amount) {
		if (amount === undefined) amount = 1;
		this.pc += amount;
	};

	Thread.prototype.isContextSwitch = function() {
		return this.contextswitch;
	};

	Thread.prototype.setContextSwitch = function(contextswitch) {
		this.contextswitch = contextswitch;
	};

	Thread.prototype.push = function(data) {
		this.stack.push(data);
	};

	Thread.prototype.pop = function() {
		return this.stack.pop();
	};

	Thread.prototype.popFrame = function() {
		return this.stack.popFrame();
	};

	Thread.prototype.pushFrame = function(frame) {
		this.stack.pushFrame(frame);
	};

	Thread.prototype.getCurrentMethodInfo = function() {
		return this.stack.getCurrentMethodInfo();
	};

	Thread.prototype.setLocal = function(i, value) {
		this.stack.setLocal(i, value);
	};

	Thread.prototype.getLocalsLength = function() {
		return this.stack.getLocalsLength();
	};

	Thread.prototype.isStackEmpty = function() {
		return this.stack.isEmpty();
	};

	Thread.prototype.isFrameEmpty = function() {
		return this.stack.isFrameEmpty();
	};

	//WHY
	Thread.prototype.getStackLength = function() {
		return this.stack.getLength();
	};

	Thread.prototype.clearStack = function() {
		this.stack.clear();
	};

	//Refactor our eventually. Frame/stack should be hidden inside Thread.
	Thread.prototype.getCurrentFrame = function() {
		return this.stack.getCurrentFrame();
	};

	Thread.prototype.getStack = function() {
		return this.stack;
	};

	return Thread;
});