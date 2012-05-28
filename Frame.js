/*
 * Frame implementation:
 * 		push = push item into stack
 * 		pop = pop item from stack
 * 		peek = returns the top of stack
 * 		slength = return the length of stack
 */
function Frame(methodInfo)
{
	this.stack = new Array();
	this.locals = new Array();
	this.constantPool = methodInfo.classInfo.constantPool;
	this.methodInfo = methodInfo;
	this.push = function(x){
		if (x !== null && x !== undefined)
		{
			pushElement(x.toString());
			if (x.dataType == Data.type.DOUBLE || x.dataType == Data.type.LONG)
			{
				pushElement(x.toString());
			}
		}
		else if (x === undefined)
			assert(false);
		else
			pushElement("[null]");
			
		
		this.stack.push(x);
		if (x != undefined && (x.dataType == Data.type.DOUBLE || x.dataType == Data.type.LONG))
		{
			this.stack.push(x);
		}
	};
	this.pop = function() {
		assert(!this.empty());
		popElement();
	 	return this.stack.pop();
	};
	this.peek = function() {
		return this.stack[this.stack.length-1];
	};
	this.length = function() {
		return this.stack.length;
	};
	this.empty = function() {
		return this.length() == 0;
	};
	
	this.setLocal = function(index, value) {
		this.locals[index] = value;
		if (value != undefined && (value.dataType == Data.type.DOUBLE || value.dataType == Data.type.LONG)) {
			this.locals[index+1] = value;
		}
	};
	
	this.getLocal = function(index) {
		return this.locals[index];
	};
}
