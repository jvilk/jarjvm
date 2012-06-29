define(
  function () {
    /*
    Copyright (c) 2008 notmasteryet

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
    */
      
    /* RFC 2279 */
    function Utf8Translator(reader) {
      this.reader = reader;
      this.waitBom = true;
      this.pendingChar = null;
      this.readChar = function() {
        var ch = null;
        do
        {
          if(this.pendingChar !== null)
          {
            ch = this.pendingChar;
            this.pendingChar = null;
          }
          else
          {
            var b1 = this.reader.readByte();
            if(b1 < 0) return null;
            
            if((b1 & 0x80) === 0)
            {
              ch = String.fromCharCode(b1);
            }
            else
            {
              var currentPrefix = 0xC0;
              var validBits = 5;
              do
              {
                var mask = currentPrefix >> 1 | 0x80;
                if((b1 & mask) === currentPrefix) break;
                currentPrefix = currentPrefix >> 1 | 0x80;
                --validBits;
              } while(validBits >= 0);
              if(validBits > 0)
              {
                var code = (b1 & ((1 << validBits) - 1));
                for(var i=5;i>=validBits;--i)
                {
                  var bi = this.reader.readByte();
                  if((bi & 0xC0) != 0x80) throw "Invalid sequence character";
                  code = (code << 6) | (bi & 0x3F);
                }
                if(code <= 0xFFFF)
                {
                  if(code === 0xFEFF && this.waitBom)
                    ch = null;
                  else
                    ch = String.fromCharCode(code);
                }
                else
                {
                  var v = code - 0x10000;
                  var w1 = 0xD800 | ((v >> 10) & 0x3FF);
                  var w2 = 0xDC00 | (v & 0x3FF);
                  this.pendingChar = String.fromCharCode(w2);
                  ch = String.fromCharCode(w1);
                }
              }
              else
                throw "Invalid character";
            }
          }
          this.waitBom = false;
        } while(ch === null);
        return ch;
      };
    }

    return Utf8Translator;
  }
);