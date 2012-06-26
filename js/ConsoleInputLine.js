define(['Enum'],
  function(Enum) {
    /**
     * Represents the input line on the console. Abstracts away various complexities involved in
     * cursor manipulation.
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
      this.line.setAttribute('class', Enum.textColorClass.WHITE);
      this.line.appendChild(this.prompt);
      this.line.appendChild(this.leftInputText);
      this.line.appendChild(this.cursor);
      this.line.appendChild(this.rightInputText);
    }

    /**
     * Used to specify an edge of the input line. Used primarily to tell functions to move
     * the cursor to the left or right edge.
     */
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

    return ConsoleInputLine;
  }
);