define(function() {
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

    function FieldDescriptor(type,stringLenth) {
        this.type = type; //NOTE POssible length here of string...figure it out
        this.length = stringLenth; //Used by the parser to continue
    }

    return FieldDescriptor;
});