define(
  function() {
    var Enum = {};

    /**
     * Maps colors to CSS classes for console text.
     */
    Enum.textColorClass = {
      WHITE : 'whiteConsoleText',
      RED : 'redConsoleText',
      YELLOW : 'yellowConsoleText'
    };

    /**
     * Enumerates all of the possible input modes.
     */
    Enum.consoleInputMode = {
      NONE : 0,
      BY_LINE : 1,
      BY_CHAR : 2
    };

    /**
     * Character codes for special characters.
     * TODO: Fill in characters.
     */
    Enum.controlCharacter = {
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

    return Enum;
  }
);