define(['Shell', 'Util'], function(Shell, Util) {
    function Console(consoleId, motd) {
        this.consoleObj = document.getElementById(consoleId);
        this.lastDiv = null;
        this.inputBuffer = "";
        this.currentInputMode = Console.inputMode.NONE;
        this.inputLine = null;
        this.inputMode = Console.inputMode.NONE;
        this.shell = new Shell(this, motd);

        //Ensures that lastDiv is set.
        this.print("");
    }

    /**
     * Maps colors to CSS classes for console text.
     */
    Console.colors = {
        WHITE : 'whiteConsoleText',
        RED : 'redConsoleText',
        YELLOW : 'yellowConsoleText'
    };

    /**
     * Enumerates all of the possible input modes.
     */
    Console.inputMode = {
        NONE : 0,
        BY_LINE : 1,
        BY_CHAR : 2
    };

    /**
     * Character codes for special characters.
     * TODO: Fill in characters.
     */
    Console.specialCharacters = {
        LEFT : 37, //
        RIGHT : 39, //
        HOME : 36, //
        END : 35, //
        UP : 38, //
        DOWN : 40, //
        BACKSPACE : 8, //
        ENTER : 13, //
        TAB : 9 //
    };

    Console.prototype.print = function(text, colorClass) {
        if (colorClass === undefined) colorClass = Console.colors.WHITE;

        //Process the text.
        text = Util.escapeHTML(text);
        text = text.replace(/\n/g, "<br />");
        text = text.replace(/\t/g, "&nbsp;&nbsp;");

        var newDiv = document.createElement('span');
        newDiv.setAttribute('class', colorClass);
        newDiv.innerHTML = text;

        //Need to print ABOVE the input line.
        if (this.inputMode !== Console.inputMode.NONE) {
            this.consoleObj.removeChild(this.inputLine.getLine());
            this.consoleObj.appendChild(newDiv);
            this.consoleObj.appendChild(document.createElement('br'));
            this.consoleObj.appendChild(this.inputLine.getLine());
        }
        else {
            this.consoleObj.appendChild(newDiv);
        }

        this.lastDiv = newDiv;

        this.scrollToBottom();
    };

    /**
     * Process a key input event.
     */
    Console.prototype.keyEvent = function(e, isKeyDown) {
        e = (window.event) ? event : e;
        var charCode = (e.keyCode) ? e.keyCode : e.charCode;
        switch(charCode) {
            case Console.specialCharacters.LEFT:
            case Console.specialCharacters.RIGHT:
            case Console.specialCharacters.HOME:
            case Console.specialCharacters.END:
            case Console.specialCharacters.UP:
            case Console.specialCharacters.DOWN:
            case Console.specialCharacters.BACKSPACE:
            case Console.specialCharacters.ENTER:
            case Console.specialCharacters.TAB:
                if (isKeyDown) this.inputCharacter(charCode);
                break;
            default:
                if (!isKeyDown) this.inputCharacter(charCode);
                break;
        }
    };

    Console.prototype.inputCharacter = function(charCode) {
        if (this.inputMode === Console.inputMode.NONE) return;

        var inputText;
        var replacementLineNode;
        var fullLineText;
        switch(charCode) {
            case Console.specialCharacters.LEFT :
                this.inputLine.moveCursor(-1);
                break;
            case Console.specialCharacters.RIGHT :
                this.inputLine.moveCursor(1);
                break;
            case Console.specialCharacters.HOME :
                this.inputLine.moveCursorToEdge(ConsoleInputLine.edge.LEFT);
                break;
            case Console.specialCharacters.END :
                this.inputLine.moveCursorToEdge(ConsoleInputLine.edge.RIGHT);
                break;
            case Console.specialCharacters.UP:
                this.shell.advanceCommandHistory(-1, this.inputLine.getInputText());
                break;
            case Console.specialCharacters.DOWN:
                this.shell.advanceCommandHistory(1, this.inputLine.getInputText());
                break;
            case Console.specialCharacters.BACKSPACE:
                this.inputLine.removeCharacters(1);
                break;
            case Console.specialCharacters.ENTER:
                inputText = this.inputLine.getInputText();
                fullLineText = this.inputLine.getFullLineText();

                replacementLineNode = document.createElement('span');
                replacementLineNode.setAttribute('class', Console.colors.WHITE);
                replacementLineNode.appendChild(document.createTextNode(fullLineText));

                this.consoleObj.removeChild(this.inputLine.getLine());
                this.consoleObj.appendChild(replacementLineNode);

                //Line break for the enter key.
                this.consoleObj.appendChild(document.createElement('br'));

                //Get rid of the input line.
                this.inputLine = null;

                //Reset input mode.
                this.inputMode = Console.inputMode.NONE;

                //Pass its text content to the shell.
                this.shell.input(inputText);
                break;
            case Console.specialCharacters.TAB:
                //TODO: Implement.
                break;
            default:
                this.inputLine.addText(String.fromCharCode(charCode));
        }
    };

    /**
     * Set up the console for input.
     *   * text: The prompt's test (PS1)
     *   * useInputCursor: If true, the input cursor is used and updated. If false, it is not displayed.
     *   * inputMode: Which input mode should the console use?
     *   * startingText: The default text to put in the input field.
     */
    Console.prototype.promptForInput = function(text, startingText, useInputCursor, inputMode) {
        if (startingText === undefined) startingText = "";
        if (useInputCursor === undefined) useInputCursor = true;
        if (inputMode === undefined) inputMode = Console.inputMode.BY_LINE;

        this.inputMode = inputMode;

        if (this.inputLine !== null) {
            this.consoleObj.removeChild(this.inputLine.getLine());
            //HACK: Remove the br before the previous div.
            this.consoleObj.removeChild(this.consoleObj.lastChild);
        }
        
        this.inputLine = new ConsoleInputLine(text, useInputCursor, startingText);

        //Add the line to the console on a new line.
        this.consoleObj.appendChild(document.createElement('br'));
        this.consoleObj.appendChild(this.inputLine.getLine());

        this.scrollToBottom();
    };

    Console.prototype.scrollToBottom = function() {
        this.consoleObj.scrollTop = this.consoleObj.scrollHeight;
    };

    function scrollToBottom() {
        document.getElementById("stackContainer").scrollTop = document.getElementById("stackContainer").scrollHeight;
    }

    /**
     * Input line:
     * getText()
     * gotta pass it to print or something???
     */
    function ConsoleInputLine(prompt, displayCursor, initialText) {
        this.prompt = document.createElement('span');
        this.prompt.appendChild(document.createTextNode(prompt + " "));

        this.leftInputText = document.createElement('span');
        this.leftInputText.appendChild(document.createTextNode(initialText));

        //Create the console's cursor. We move this div about during execution.
        this.cursor = document.createElement('span');
        if (displayCursor) {
            this.cursor.setAttribute('class', 'consoleCursor');
        }
        this.cursor.appendChild(document.createTextNode("\u00a0"));

        this.rightInputText = document.createElement('span');
        this.rightInputText.appendChild(document.createTextNode(""));

        //The line holds them all together.
        this.line = document.createElement('span');
        this.line.setAttribute('class', Console.colors.WHITE);
        this.line.appendChild(this.prompt);
        this.line.appendChild(this.leftInputText);
        this.line.appendChild(this.cursor);
        this.line.appendChild(this.rightInputText);
    }

    ConsoleInputLine.edge = {
        LEFT : 0,
        RIGHT : 1
    };

    /**
     * Moves the text cursor over 'offset' characters, if legal to do so.
     * If it is illegal, it will move the cursor as far as it can go.
     * TODO: Do not use any special logic with '\u00a0'. Make this smarter.
     */
    ConsoleInputLine.prototype.moveCursor = function(offset) {
        var rightTextNode = this.rightInputText.firstChild;
        var leftTextNode = this.leftInputText.firstChild;
        var cursorTextNode = this.cursor.firstChild;

        var rightTextLength = rightTextNode.textContent.length;
        var leftTextLength = leftTextNode.textContent.length;

        if (offset > 0) {
            if (cursorTextNode.textContent === "\u00a0") return;

            if (rightTextLength < offset-1) offset = rightTextLength + 1;

            leftTextNode.textContent += cursorTextNode.textContent + rightTextNode.textContent.substr(0, offset-1);
            cursorTextNode.textContent = rightTextLength > offset-1 ? rightTextNode.textContent.substr(offset-1, 1) : "\u00a0";
            rightTextNode.textContent = rightTextLength > offset ? rightTextNode.textContent.substr(offset, rightTextLength - offset) : "";
        }
        else if (offset < 0) {
            if (leftTextLength === 0) return;
            offset = Math.abs(offset);

            if (leftTextLength < offset) offset = leftTextLength;

            rightTextNode.textContent = leftTextNode.textContent.substr(leftTextLength-offset+1, offset-1) + (this.cursor.firstChild.textContent !== "\u00a0" ? this.cursor.firstChild.textContent : "") + rightTextNode.textContent;
            cursorTextNode.textContent = leftTextNode.textContent.substr(leftTextLength-offset, 1);
            leftTextNode.textContent = leftTextNode.textContent.substr(0, leftTextLength-offset);
        }
    };

    /**
     * Moves the input cursor to the given edge of the input line.
     */
    ConsoleInputLine.prototype.moveCursorToEdge = function(edge) {
        if (edge === ConsoleInputLine.edge.LEFT) {
            this.moveCursor(-1*this.leftInputText.firstChild.textContent.length);
        }
        else {
            this.moveCursor(this.rightInputText.firstChild.textContent.length + 1);
        }
    };

    /**
     * Returns the current input text on the line.
     */
    ConsoleInputLine.prototype.getInputText = function() {
        return this.leftInputText.firstChild.textContent + (this.cursor.firstChild.textContent !== "\u00a0" ? this.cursor.firstChild.textContent : "") + this.rightInputText.firstChild.textContent;
    };

    /**
     * Returns the entire text, prompt and all.
     */
    ConsoleInputLine.prototype.getFullLineText = function() {
        return this.prompt.firstChild.textContent + this.getInputText();
    };

    /**
     * Add input text to the line.
     */
    ConsoleInputLine.prototype.addText = function(text) {
        this.leftInputText.firstChild.textContent += text;
    };

    /**
     * Completely change the text on the input line.
     */
    ConsoleInputLine.prototype.changeText = function(text) {
        this.leftInputBox.firstChild.textContent = text;
        this.cursor.firstChild.textContent = "\u00a0";
        this.rightInputText.firstChild.textContent = "";
    };

    /**
     * Remove numChars characters from the input line if legal to do so.
     * If not legal, then it will remove all of the characters.
     */
    ConsoleInputLine.prototype.removeCharacters = function(numChars) {
        var leftTextNode = this.leftInputText.firstChild;
        var leftTextLength = leftTextNode.textContent.length;

        if (leftTextLength < numChars) numChars = leftTextLength;

        leftTextNode.textContent = leftTextNode.textContent.substr(0, leftTextLength - numChars);
    };

    /**
     * Get the entire line for placement on the page.
     */
    ConsoleInputLine.prototype.getLine = function() {
        return this.line;
    };

    return Console;
});