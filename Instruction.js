/**
 * Contains all of the data on a single insruction, including its length, arguments,
 * and the function required to call it.
 */
function Instruction(length, opcode) {
	this.opcode = opcode; //Kept for debugging purposes
	this.args = Array.prototype.slice.call(arguments);
	this.length = this.args.shift();
	this.fcn = ByteCode[this.args.shift()];
	
	this.execute = function() {
		this.fcn.apply(null, this.args);
	};
}
