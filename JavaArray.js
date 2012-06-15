define(function() {   
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

    return JavaArray;
});