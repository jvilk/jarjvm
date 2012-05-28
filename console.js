USERPROMPT = "CS691ST:user$ ";
PREVIOUSCOMMANDS = new Array();
COMMANDINDEX = 0;


/* If you put _ as the first character the help menu will not print it */
consoleCommands = new Array();
consoleCommands["help"] = printHelpMenu;
consoleCommands["whoami"] = whoAmI;
consoleCommands["execute"] = execute;
consoleCommands["_pushelement"] = pushElement;
consoleCommands["_popelement"] = popElement;
consoleCommands["listloadedclasses"] = listLoadedClasses;
consoleCommands["clearstack"] = clearstack;
consoleCommands["enabledebug"] = enableDebug;

consoleCommandsDescriptions = new Array();    
consoleCommandsDescriptions["help"] = "Prints the help menu"
consoleCommandsDescriptions["whoami"] = "Prints the current user - kinda"; 
consoleCommandsDescriptions["execute"] = "Used to run a java program. Must be followed by a loaded class name"
consoleCommandsDescriptions["_pushelement"] = ""
consoleCommandsDescriptions["_popelement"] = ""
consoleCommandsDescriptions["listloadedclasses"] = "List all the currently loaded Java classes"
consoleCommandsDescriptions["clearstack"] = "Clears the debugging stack"
consoleCommandsDescriptions["enabledebug"] = "Enables debugging output (Greatly affects speed)"

 
function consoleInit(){
	createMOTD("MOTD: Welcome the the JAR Javascript JVM");
	promptForUserInput();
}

function createMOTD(message){
	addProgressToConsole(message);
	
	createNewLine();
	addProgressToConsole("If you need help with this console type 'help' and press Enter");
	addProgressToConsole("-------------------------------------------------------------------------------");
}

var ConsoleStrings = new Array();
ConsoleStrings.types = {
	TEXT: 0,
	WARNING: 1,
	ERROR: 2,
	OUTPUT: 3,
	PROGRESS: 4,
}
/*
function addTextToCurrentLine(text){
	//Get the pre lines
	var console = document.getElementById("console");
	var preElements = console.getElementsByTagName("div");
	
	//Get the last one
	var lastPre = preElements[preElements.length - 1];
	lastPre.innerHTML += escapeHTML(text);*/
function addStringToConsole(text, type){
	var console = document.getElementById("console");
	var content = '';
	switch(type){
		case ConsoleStrings.types.TEXT:
			if(DEBUG){
				content = "<div style='white-space:pre-wrap'>" + escapeHTML(text) + "</div>";
			}
			break;
		case ConsoleStrings.types.PROGRESS:
			content = "<div style='white-space:pre-wrap'>" + escapeHTML(text) + "</div>";
			break;
		case ConsoleStrings.types.WARNING:
			content = "<div class='warning' style='white-space:pre-wrap'>" + escapeHTML(text) + "</div>";
			break;
		case ConsoleStrings.types.ERROR:
			content = "<div class='error' style='white-space:pre-wrap'>" + escapeHTML(text) + "</div>";
			break;
		case ConsoleStrings.types.OUTPUT:
			content = "<div class='output' style='white-space:pre-wrap'>" + escapeHTML(text) + "</div>";
			break;
	}
	console.innerHTML += content;
	scrollToBottom("console");
}

function addTextToConsole(text){
	addStringToConsole(text, ConsoleStrings.types.TEXT);
}

function addErrorToConsole(text){
	addStringToConsole(text, ConsoleStrings.types.ERROR);
}

function addWarningToConsole(text){
	addStringToConsole(text, ConsoleStrings.types.WARNING);
}

function addOutputToConsole(text){
	addStringToConsole(text, ConsoleStrings.types.OUTPUT);
}

function addProgressToConsole(text){
	addStringToConsole(text, ConsoleStrings.types.PROGRESS);
}

function createNewLine(){
	var console = document.getElementById("console");
	console.innerHTML += "<br />";
	scrollToBottom("console");
}

function promptForUserInput(){
	createNewLine();
	addProgressToConsole(USERPROMPT);
	scrollToBottom("console");
	return;

}


function addTextToCurrentLine(text){
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
	addErrorToConsole("Unknown Command");
	promptForUserInput();
	return;
}

function nextPreviousCommand(){
	if(PREVIOUSCOMMANDS[COMMANDINDEX] != undefined){
		eraseCurrentLine();
		addTextToCurrentLine(PREVIOUSCOMMANDS[COMMANDINDEX])
		COMMANDINDEX = (COMMANDINDEX > 0) ? COMMANDINDEX -= 1 : 0; //Don't go below 0
	}
}

function nextCommand(){
	COMMANDINDEX += 1;
	eraseCurrentLine();
	if(COMMANDINDEX < PREVIOUSCOMMANDS.length){
		addTextToCurrentLine(PREVIOUSCOMMANDS[COMMANDINDEX])
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

function userTyped(e){
	scrollToBottom("console");
	e = (window.event) ? event : e;
	var keynum = (e.keyCode) ? e.keyCode : e.charCode;
	if(keynum == 8){ //Backspace
		removeLastCharFromCurrentLine();
		return;
	}
	if(keynum == 13){ //Enter
		parsePossibleCommand();
		return;
	}
	if(keynum == 38){ //Up Arrow
		if (e.preventDefault){
			e.preventDefault();
		}
		nextPreviousCommand();
		return;
	}
	if(keynum == 40){
		if (e.preventDefault){
			e.preventDefault();
		}
		nextCommand();
		return;
	}
	
	var char_ = String.fromCharCode(keynum);
	addTextToCurrentLine(char_);
}

function scrollToBottom(divName){
	var objDiv = document.getElementById(divName);
	objDiv.scrollTop = objDiv.scrollHeight;
	return;
}

/***Other console Commands ***/

function printHelpMenu(){
	addProgressToConsole("List of Valid Console Commands:");
	createNewLine();
	for(var command in consoleCommands){
		if(command.charAt(0) != '_'){
			addProgressToConsole(command + " - " + consoleCommandsDescriptions[command]);
		}
	}
	promptForUserInput();
}

function whoAmI(){
	addProgressToConsole("Probably Emery Berger, but I don't know why you're asking me that");
	promptForUserInput();
}

function pushElement(text){
	//alert("Push: " + text);
	if (DEBUG){
		var stack = document.getElementById("stack");
		stack.innerHTML += "<div class='stackElement' style='white-space:pre-wrap'>"+escapeHTML(text)+"</div>"
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
			addErrorToConsole("No Frames To Pop");
		}
	}
}

/**
 * Executes the main function of a given class.
 */
function execute(className) { //+ arguments
	//addTextToConsole("Is stack empty? " + STACK.empty());
	
	//Ensure the class exists.
	if (!(className in CLASSES))
	{
		addErrorToConsole("ERROR: " + className + " is not currently loaded.");
		return;
	}
	
	var classInfo = CLASSES[className];
	var mainMethod = classInfo.getMethodAssert("main", "([Ljava/lang/String;)V");
	
	var stringClass = Class.getClass("java/lang/String");
	var args = new JavaArray(Data.type.OBJECT, stringClass, 1, arguments.length-1);
	
	for (var i = 1; i < arguments.length; i++)
	{
		//Create a String object.
		addProgressToConsole("Creating string w/ text " + arguments[i]);
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
					addErrorToConsole("ERROR: Uncaught exception of type " + err.classInfo.thisClassName + ".");
				}
				
				//If the stack is not empty, ignore the exception; it may still be caught.
			}
			//Otherwise, it's a JavaScript exception! Print it.
			else
			{
				addErrorToConsole("JVM Exception: " + err);
				//Empty the stack. We are done executing.
				STACK.clear();
			}
		}
	}
	createNewLine();
	addProgressToConsole("Program Ended");
	promptForUserInput();
}

/**
 * Lists all of the currently loaded classes.
 */
function listLoadedClasses() {
	addProgressToConsole("Currently Loaded Classes: ");
	for (var className in CLASSES)
	{
		addProgressToConsole("\t" + className);
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
