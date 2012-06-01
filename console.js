USERPROMPT = "CS691ST:user$ ";
PREVIOUSCOMMANDS = [];
COMMANDINDEX = 0;


/* If you put _ as the first character the help menu will not print it */
consoleCommands = [];
consoleCommands["help"] = printHelpMenu;
consoleCommands["whoami"] = whoAmI;
consoleCommands["execute"] = execute;
consoleCommands["_pushelement"] = pushElement;
consoleCommands["_popelement"] = popElement;
consoleCommands["listloadedclasses"] = listLoadedClasses;
consoleCommands["clearstack"] = clearstack;
consoleCommands["enabledebug"] = enableDebug;
consoleCommands["printmethod"] = printMethod;

consoleCommandsDescriptions = [];
consoleCommandsDescriptions["help"] = "Prints the help menu";
consoleCommandsDescriptions["whoami"] = "Prints the current user - kinda";
consoleCommandsDescriptions["execute"] = "Used to run a java program. Must be followed by a loaded class name";
consoleCommandsDescriptions["_pushelement"] = "";
consoleCommandsDescriptions["_popelement"] = "";
consoleCommandsDescriptions["listloadedclasses"] = "List all the currently loaded Java classes";
consoleCommandsDescriptions["clearstack"] = "Clears the debugging stack";
consoleCommandsDescriptions["enabledebug"] = "Enables debugging output (Greatly affects speed)";
consoleCommandsDescriptions["printmethod"] = "Prints the bytecode of the specified method. Specify the full classname, method name, and descriptor as arguments.";

 
function consoleInit(){
	createMOTD("MOTD: Welcome the the JAR Javascript JVM");
	promptForUserInput();
}

function createMOTD(message){
	printTextToConsole(message + "\n");
	printTextToConsole("If you need help with this console type 'help' and press Enter");
	printTextToConsole("-------------------------------------------------------------------------------");
}

/**
 * This is the only method that should be actually adding text to the console.
 * All other methods that add text to the console should be a frontend to this
 * method.
 */
function printToConsole(text, color) {
	var console = document.getElementById("console");
	console.innerHTML += "<div style='white-space:pre-wrap;color:" + color + "'>" + escapeHTML(text) + "</div>";
	scrollToBottom("console");
}

/**
 * Print debug information to the console.
 */
function debugPrintToConsole(text){
	if (DEBUG) {
		printToConsole(text, "white");
	}
}

/**
 * Print an error to the console.
 */
function printErrorToConsole(text){
	printToConsole(text, "red");
}

/**
 * Print a warning to the console.
 */
function printWarningToConsole(text){
	printToConsole(text, "yellow");
}

/**
 * Print regular ole text to the console.
 */
function printTextToConsole(text){
	printToConsole(text, "white");
}

/**
 * Print user input to console.
 * ALWAYS use this for user input or for placing text on the user input line!
 * It draws the little white box where the user is typing.
 */
function printUserInputToConsole(text) {
	printTextToCurrentLine(text);
	//Draw little white box.
}

function createNewLine(){
	var console = document.getElementById("console");
	console.innerHTML += "<br />";
	scrollToBottom("console");
}

function promptForUserInput(){
	createNewLine();
	printTextToConsole(USERPROMPT);
	scrollToBottom("console");
	return;

}


function printTextToCurrentLine(text){
	//Get the pre lines
	var console = document.getElementById("console");
	var preElements = console.getElementsByTagName("div");
	
	//Get the last one
	var lastPre = preElements[preElements.length - 1];
	lastPre.innerHTML += escapeHTML(text);
}

function removeLastCharFromCurrentLine(){
	//Get the pre lines
	var console = document.getElementById("console");
	var preElements = console.getElementsByTagName("div");
	
	//Get the last one
	var lastPre = preElements[preElements.length - 1];
	if(lastPre.innerHTML.length > USERPROMPT.length){
		subStr = lastPre.innerHTML.substr(0, lastPre.innerHTML.length - 1);
		lastPre.innerHTML = subStr;
	}

	//Draw the little white box.

	return;
	
}

function parsePossibleCommand(){
	var console = document.getElementById("console");
	var preElements = console.getElementsByTagName("div");
	var lastPre = preElements[preElements.length - 1];
	var command = lastPre.innerHTML;
	
	PREVIOUSCOMMANDS.push(command.substr(USERPROMPT.length)); //If a command is run push the new one, and reset previous command
	COMMANDINDEX = PREVIOUSCOMMANDS.length - 1;
	
	var splitCommand = command.split(" ");
	splitCommand.shift(); //There's always a starting space.
	var commandName = splitCommand.shift();
	
	//Run through all the commands
	for(var consoleCommand in consoleCommands){
		if(commandName.toLowerCase().indexOf(consoleCommand) != -1){
			consoleCommands[consoleCommand].apply(null, splitCommand);
			return;
		}
	}
	printErrorToConsole("Unknown Command");
	promptForUserInput();
	return;
}

function nextPreviousCommand(){
	if(PREVIOUSCOMMANDS[COMMANDINDEX] !== undefined){
		eraseCurrentLine();
		printUserInputToConsole(PREVIOUSCOMMANDS[COMMANDINDEX]);
		COMMANDINDEX = (COMMANDINDEX > 0) ? COMMANDINDEX -= 1 : 0; //Don't go below 0
	}
}

function nextCommand(){
	COMMANDINDEX += 1;
	eraseCurrentLine();
	if(COMMANDINDEX < PREVIOUSCOMMANDS.length){
		printUserInputToConsole(PREVIOUSCOMMANDS[COMMANDINDEX]);
	}else{
		COMMANDINDEX = PREVIOUSCOMMANDS.length - 1;
	}
}

function eraseCurrentLine(){
	//Get the pre lines
	var console = document.getElementById("console");
	var preElements = console.getElementsByTagName("div");
	
	//Get the last one
	var lastPre = preElements[preElements.length - 1];
	lastPre.innerHTML = USERPROMPT;
	return;
}

function userTypedSpecialCharacter(e) {
	scrollToBottom("console");
	e = (window.event) ? event : e;
	var keynum = (e.keyCode) ? e.keyCode : e.charCode;

	switch (keynum) {
		case 8: //Backspace
			removeLastCharFromCurrentLine();
			return false;
		case 13: //Enter
			parsePossibleCommand();
			return;
		case 38: //Up Arrow
			if (e.preventDefault) {
				e.preventDefault();
			}
			nextPreviousCommand();
			return;
		case 40: //Down arrow
			if (e.preventDefault) {
				e.preventDefault();
			}
			nextCommand();
			return;
	}
}

function userTyped(e){
	scrollToBottom("console");
	e = (window.event) ? event : e;
	var keynum = (e.keyCode) ? e.keyCode : e.charCode;
	//Ignore special characters. They are handled by onKeyDown.
	switch (keynum) {
		case 8: //Backspace
		case 13: //Enter
		case 38: //Up Arrow
		case 40: //Down arrow
			return;
	}


	var char_ = String.fromCharCode(keynum);
	printUserInputToConsole(char_);
}

function scrollToBottom(divName){
	var objDiv = document.getElementById(divName);
	objDiv.scrollTop = objDiv.scrollHeight;
	return;
}

/***Other console Commands ***/

function printHelpMenu(){
	printTextToConsole("List of Valid Console Commands:");
	createNewLine();
	for(var command in consoleCommands){
		if(command.charAt(0) != '_'){
			printTextToConsole(command + " - " + consoleCommandsDescriptions[command]);
		}
	}
	promptForUserInput();
}

function whoAmI(){
	printTextToConsole("Probably Emery Berger, but I don't know why you're asking me that");
	promptForUserInput();
}

function pushElement(text){
	//alert("Push: " + text);
	if (DEBUG){
		var stack = document.getElementById("stack");
		stack.innerHTML += "<div class='stackElement' style='white-space:pre-wrap'>"+escapeHTML(text)+"</div>";
		scrollToBottom("stackContainer");
	}
}

function popElement(){
	//alert("Pop");
	if(DEBUG){
		var stack = document.getElementById("stack");
		var frames = stack.getElementsByTagName("div");
		if(frames.length > 0){
			scrollToBottom("stackContainer");
			var lastFrame = frames[frames.length -1];
			stack.removeChild(lastFrame);
		}else{
			printErrorToConsole("No Frames To Pop");
		}
	}
}

/**
 * Executes the main function of a given class.
 */
function execute(className) { //+ arguments
	//debugPrintToConsole("Is stack empty? " + STACK.empty());
	
	//Ensure the class exists.
	if (!(className in CLASSES))
	{
		printErrorToConsole("ERROR: " + className + " is not currently loaded.");
		return;
	}
	
	var classInfo = CLASSES[className];
	var mainMethod = classInfo.getMethodAssert("main", "([Ljava/lang/String;)V");
	
	var stringClass = Class.getClass("java/lang/String");
	var args = new JavaArray(Data.type.OBJECT, stringClass, 1, arguments.length-1);
	
	for (var i = 1; i < arguments.length; i++)
	{
		//Create a String object.
		printTextToConsole("Creating string w/ text " + arguments[i]);
		var stringObj = getJavaString(arguments[i]);
		
		args.set(i, stringObj);
	}
	
	MethodRun.createCall(mainMethod, args);
	
	while (!STACK.empty())
	{
		var method = STACK.currentFrame.pop();
		try
		{
			method.execute();
		}
		catch (err)
		{
			//If it has classInfo, it's a Java exception.
			if (typeof err !== "string" && typeof err !== "object")
			{
				//If the stack is empty, there are no more functions to catch it.
				if (STACK.empty())
				{
					//TODO: Handle unhandled exceptions here. toString? Call stack?
					printErrorToConsole("ERROR: Uncaught exception of type " + err.classInfo.thisClassName + ".");
				}
				
				//If the stack is not empty, ignore the exception; it may still be caught.
			}
			//Otherwise, it's a JavaScript exception! Print it.
			else
			{
				printErrorToConsole("JVM Exception: " + err);

				printTextToConsole(STACK.currentFrame.methodInfo.toStringWithCode(PC) + "\n");

				//Empty the stack. We are done executing.
				STACK.clear();

				promptForUserInput();
			}
		}
	}
	createNewLine();
	printTextToConsole("Program Ended");
	promptForUserInput();
}

/**
 * Lists all of the currently loaded classes.
 */
function listLoadedClasses() {
	printTextToConsole("Currently Loaded Classes: ");
	for (var className in CLASSES)
	{
		printTextToConsole("\t" + className);
	}
	promptForUserInput();
}

/**
 * Clears the stack. Useful for when things go bad.
 */
function clearstack() {
	STACK = new Stack();
	promptForUserInput();
}

function enableDebug() {
	DEBUG = true;
	promptForUserInput();
}

/**
 * Prints a method with the given classname, methodname, and descriptor.
 */
function printMethod(className, methodName, descriptor) {
	var klass = Class.getClass(className);
	var method = klass.getMethodAssert(methodName, descriptor);
	
}











