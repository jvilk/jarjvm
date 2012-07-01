define(['frontend/Shell', 'frontend/ConsoleInputLine', 'vm/Enum'],
  function(Shell, ConsoleInputLine, Enum) {
    /**
     * Create the interactive console as a frontend to the JVM.
     * consoleId: The ID of the div that should contain the console.
     * motd: The 'message of the day' for the console; printed before everything else.
     */
    function Console(consoleId, motd) {
      this.consoleObj = document.getElementById(consoleId);
      this.lastDiv = null;
      this.inputBuffer = "";
      this.currentInputMode = Enum.consoleInputMode.NONE;
      this.inputLine = null;
      this.inputMode = Enum.consoleInputMode.NONE;
      this.shell = new Shell(this, motd);

      //Ensures that lastDiv is set.
      this.print("");
    }

    

    /**
     * Print the given text to the console with the given color.
     * Automatically escapes HTML characters, converts newlines to linebreaks, and converts tabs to nonbreaking spaces.
     */
    Console.prototype.print = function(text, colorClass) {
      if (colorClass === undefined) colorClass = Enum.textColorClass.WHITE;

      //Process the text.
      text = this._escapeHTML(text);

      var newDiv = document.createElement('span');
      newDiv.setAttribute('class', colorClass);
      newDiv.innerHTML = text;

      //Need to print ABOVE the input line.
      if (this.inputMode !== Enum.consoleInputMode.NONE) {
        this.consoleObj.removeChild(this.inputLine.getLine());
        this.consoleObj.appendChild(newDiv);
        this.consoleObj.appendChild(document.createElement('br'));
        this.consoleObj.appendChild(this.inputLine.getLine());
      }
      else {
        this.consoleObj.appendChild(newDiv);
      }

      this.lastDiv = newDiv;

      this._scrollToBottom();
    };

    /**
     * Process a key input event.
     * e: THe key event.
     * isKeyDown: TRUE if this is from a KEYDOWN event, false otherwise.
     * We use keyPress events to process regular input characters, and keyDown to process special characters (arrow keys, etc).
     */
    Console.prototype.keyEvent = function(e, isKeyDown) {
      e = (window.event) ? event : e;
      var charCode = (e.keyCode) ? e.keyCode : e.charCode;
      /**
       * Pass ONLY special characters from keydown events, and all other characters
       * from keypress events.
       */
      switch(charCode) {
        case Enum.controlCharacter.LEFT:
        case Enum.controlCharacter.RIGHT:
        case Enum.controlCharacter.HOME:
        case Enum.controlCharacter.END:
        case Enum.controlCharacter.UP:
        case Enum.controlCharacter.DOWN:
        case Enum.controlCharacter.BACKSPACE:
        case Enum.controlCharacter.ENTER:
        case Enum.controlCharacter.TAB:
          if (isKeyDown) this.inputCharacter(charCode);
          break;
        default:
          if (!isKeyDown) this.inputCharacter(charCode);
          break;
      }
    };

    /**
     * Process the given input character. Contains logic for processing special characters.
     */
    Console.prototype.inputCharacter = function(charCode) {
      if (this.inputMode === Enum.consoleInputMode.NONE) return;

      var inputText;
      var replacementLineNode;
      var fullLineText;
      switch(charCode) {
        case Enum.controlCharacter.LEFT :
          this.inputLine.moveCursor(-1);
          break;
        case Enum.controlCharacter.RIGHT :
          this.inputLine.moveCursor(1);
          break;
        case Enum.controlCharacter.HOME :
          this.inputLine.moveCursorToEdge(ConsoleInputLine.edge.LEFT);
          break;
        case Enum.controlCharacter.END :
          this.inputLine.moveCursorToEdge(ConsoleInputLine.edge.RIGHT);
          break;
        case Enum.controlCharacter.UP:
          this.shell.advanceCommandHistory(-1, this.inputLine.getInputText());
          break;
        case Enum.controlCharacter.DOWN:
          this.shell.advanceCommandHistory(1, this.inputLine.getInputText());
          break;
        case Enum.controlCharacter.BACKSPACE:
          this.inputLine.removeCharacters(1);
          break;
        case Enum.controlCharacter.ENTER:
          inputText = this.inputLine.getInputText();
          fullLineText = this.inputLine.getFullLineText();

          replacementLineNode = document.createElement('span');
          replacementLineNode.setAttribute('class', Enum.textColorClass.WHITE);
          replacementLineNode.appendChild(document.createTextNode(fullLineText));

          this.consoleObj.removeChild(this.inputLine.getLine());
          this.consoleObj.appendChild(replacementLineNode);

          //Line break for the enter key.
          this.consoleObj.appendChild(document.createElement('br'));

          //Get rid of the input line.
          this.inputLine = null;

          //Reset input mode.
          this.inputMode = Enum.consoleInputMode.NONE;

          //Pass its text content to the shell.
          this.shell.input(inputText);
          break;
        case Enum.controlCharacter.TAB:
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
      if (inputMode === undefined) inputMode = Enum.consoleInputMode.BY_LINE;

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

      this._scrollToBottom();
    };

    /*** HELPER FUNCTIONS
       Should only be called internally by Console objects. ***/

    /**
     * Scroll the console down to its bottom. Used when printing new things to the console, just like a real console.
     */
    Console.prototype._scrollToBottom = function() {
      this.consoleObj.scrollTop = this.consoleObj.scrollHeight;
    };

    /**
     * Escape the given string so that it is HTML safe.
     * Only needs to be called from within console.
     * Also replaces newlines with linebreaks, and tabs with nonbreaking spaces.
     */
    Console.prototype._escapeHTML = function(text) {
      return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g, "<br />").replace(/\t/g, "&nbsp;&nbsp;");
    };

    return Console;
  }
);