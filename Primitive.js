define(function() {
	function Primitive(typeName, value){
		this.dataType = typeName;
		this.value = value;
	}

	return Primitive;
});