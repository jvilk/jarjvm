/* child must be a reference to this, and parentConstructor is the string that is the name of the contructor */
function inherits(child, parentConstructor){
    //Initialize Parent
    var allArguments = Array.prototype.slice.call(inherits.arguments);
    var constructorArguments = allArguments.slice(2); //Arguments to the parent's constructor
    //Call the parent constructor with the arguments for it
    parentConstructor = window[parentConstructor];
    //parentConstructor.arguments = constructorArguments;
    //var parent = new parentConstructor();
    var parent = {};
    parentConstructor.apply(parent, constructorArguments);

    //Go through all attributes of the parent and add them to the child
    for (var attribute in parent){
        //alert(attribute);
        /*if (parent[attribute] == undefined){
            alert("MOTHER OF GOD");
            alert(attribute +": " + parent[attribute]);
        }*/
        child[attribute] = parent[attribute];
    }
}

/**
 * Print a stack trace if an assertion fails. Particularly useful to detect parsing errors when input doesn't appear sane.
 */
function assert(assertion) {
    if (!assertion)
    {
        var stackTrace = printStackTrace();
        JVM.printError("Assertion Failed:\n" + stackTrace);
        throw "Assertion Failed:\n" + stackTrace;
    }
}

/**
 * Wraps an unsigned int array in an object that can be used by Utf8Translator in Deflate.js.
 */
function utf8Wrapper(bytes)
{
    this.bytes = bytes;
    this.index = 0;
    this.readByte = function() {
        if (this.index >= this.bytes.length)
            return -1;
                        
        var retVal = this.bytes[this.index];
        this.index++;
        return retVal;
    };
}

function escapeHTML(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/**
 * Converts the JavaScript string into a Java string.
 */
function getJavaString(string) {
    var charArray = new JavaArray(Data.type.CHAR, null, 1, string.length);
    for (var i = 0; i < string.length; i++)
    {
        charArray.set(i, new Char(string.charCodeAt(i)));
    }
    
    return MethodRun.constructObject("java/lang/String", "([C)V", charArray);
}