define(['Primitive', 'Float', 'Short', 'Char', 'Bool', 'Byte', 'Integer', 'Long', 'Util'],
	function(Primitive, Float, Short, Char, Bool, Byte, Integer, Long, Util) {
	function Double(value){
		Util.inherits(this, Primitive, Data.type.DOUBLE, value);
	}

	Double.prototype.add = function(otherPrimitive){
		return new Double(this.value + otherPrimitive.value);
	};
	Double.prototype.subtract = function(otherPrimitive){
		return new Double(this.value - otherPrimitive.value);
	};
	Double.prototype.multiply = function(otherPrimitive){
		return new Double(this.value * otherPrimitive.value);
	};
	Double.prototype.divide = function(otherPrimitive){
		//TODO: Make sure this works according to the JVM spec
		return new Double(this.value / otherPrimitive.value);
	};
	Double.prototype.negate = function(){
		return new Double(-this.value);
	};
	Double.prototype.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Double(result);
	};
	
	/**Shifting**/
	//Shift this number left by the shift amount
	Double.prototype.shiftLeft = function(shiftAmount){
		return new Double(this.value << shiftAmount);
	};
	
	Double.prototype.shiftRight = function(shiftAmount){
		return new Double(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	Double.prototype.shiftRightUnsigned = function(shiftAmount){
		return new Double(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	Double.prototype.and = function(otherPrimitive){
		return new Double(this.value & otherPrimitive.value);
	};
	
	Double.prototype.or = function(otherPrimitive){
		return new Double(this.value | otherPrimitive.value);
	};
	
	Double.prototype.xor = function(otherPrimitive){
		return new Double(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	Double.prototype.toInteger = function(){
		return new Integer(this.value); //wink
	};
	Double.prototype.toDouble = function(){
		return new Double(this.value); //wink
	};
	Double.prototype.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	Double.prototype.toByte = function(){
		return new Byte(this.value);
	};
	Double.prototype.toBool = function(){
		return new Bool(this.value );
	};
	Double.prototype.toChar = function(){
		return new Char(this.value); //Return a new char with this value
	};
	Double.prototype.toShort = function(){
		return new Char(this.value); //Return a new char with this value
	};
	Double.prototype.toFloat = function(){
		//TODO: Do a bounds check
		return new Float(parseFloat(this.value)); //Wink ;)
	};
	Double.prototype.toString = function(){
		return "[" + this.dataType + " " + this.value.toString() + "]";
	};
	Double.prototype.clone = function(){
		return new Double(this.value);
	};

	return Double;
});