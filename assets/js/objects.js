/* static stuff */
var CHARS = ['0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function NUMBERTOCHAR(number) {
    return CHARS[number];
}

function CHARTONUMBER(char) {
    return CHARS.indexOf(char);
}

/* Objects */

/**
 * Object Wheel with the functionality to encrypt a character and change their own position
 * 
 * @param {String} name Wheel name
 * @param {String} position Position shown in the window at the beginning, String in format 'Q'
 * @param {String} encryption The encryption key, String in format 'EKMFLGDQVZNTOWYHXUSPAIBRCJ'
 * @param {String} notch The notch is where the next wheel will turn once after that character is shown, String in format 'Q'.
 */
function Wheel(name, position, encryption, notch) {
    this.name = name;
    this.position = position;
    this.encryption = ('0' + encryption).split('');
    this.notch = notch;

    this.incrementPosition = function() {
        var actualPosition = CHARTONUMBER(this.position);
        if (actualPosition === 26) {
            actualPosition = 0;
        }
        this.position = NUMBERTOCHAR(actualPosition + 1);
    };

    this.isNotchActive = function() {
        return this.notch === this.position;
    };

    this.getRelativePosition = function(absolutePosition) {
        var relativePosition = (absolutePosition + (CHARTONUMBER(this.position) - 1)) % 26;
        if (relativePosition === 0) {
            relativePosition = 26;
        }
        return relativePosition;
    };

    this.getAbsolutePosition = function(relativePosition) {
        var absolutePosition = (26 + ((relativePosition - (CHARTONUMBER(this.position)) + 1))) % 26;
        if (absolutePosition === 0) {
            absolutePosition = 26;
        }
        return absolutePosition;
    };

    this.getForwardEncryptedChar = function(absolutePosition) {
        return this.encryption[this.getRelativePosition(absolutePosition)];
    };

    this.getForwardEncryptedAbsolutePosition = function(absolutePosition) {
        return this.getAbsolutePosition(CHARTONUMBER(this.getForwardEncryptedChar(absolutePosition)));
    };

    this.getBackwardEncryptedChar = function(absolutePosition) {
        return NUMBERTOCHAR(this.encryption.indexOf(NUMBERTOCHAR(this.getRelativePosition(absolutePosition))));
    };

    this.getBackwardEncryptedAbsolutePosition = function(absolutePosition) {
        return this.getAbsolutePosition(this.encryption.indexOf(NUMBERTOCHAR(this.getRelativePosition(absolutePosition))));
    };
}

/**
 * Object Reflector is the special wheel at the end
 * 
 * @param {String} name Reflector name
 * @param {String} encryption The encryption key as String 'AY BR CU DH EQ FS GL IP JX KN MO TZ VW'
 */
function Reflector(name, encryption) {
    this.name = name;
    encryptedArray = new Array('0');
    encryption = encryption.split(' ');
    for (var i = 0; i < encryption.length; i++) {
        encryptedArray[CHARTONUMBER(encryption[i].split('')[0])] = encryption[i].split('')[1];
        encryptedArray[CHARTONUMBER(encryption[i].split('')[1])] = encryption[i].split('')[0];
    }
    this.encryption = encryptedArray;

    this.getEncryptedChar = function(absolutePosition) {
        return this.encryption[absolutePosition];
    };

    this.getEncryptedAbsolutePosition = function(absolutePosition) {
        return CHARTONUMBER(this.getEncryptedChar(absolutePosition));
    };
}

/**
 * Object Plugboard, single characters out of the plugboard can be set
 * 
 * @param {String} encryption A list of character pairs to be encrypted as String 'AY BC RT'
 * can be an empty String if no characters have to be encrypted
 */
function Plugboard(encryption) {
    this.encryption = CHARS.slice();

    this.setEncryptedChar = function(char1, char2) {
        this.encryption[this.encryption.indexOf(char1)] = NUMBERTOCHAR(this.encryption.indexOf(char1));
        this.encryption[this.encryption.indexOf(char2)] = NUMBERTOCHAR(this.encryption.indexOf(char2));
        this.encryption[CHARTONUMBER(char1)] = char2;
        this.encryption[CHARTONUMBER(char2)] = char1;
    };

    this.setEncryptedChars = function(chars) {
        chars = chars.split(' ');
        for (var i = 0; i < chars.length; i++) {
            this.setEncryptedChar(chars[i].split('')[0], chars[i].split('')[1]);
        }
    };
    this.setEncryptedChars(encryption);

    this.getEncryptedChar = function(absolutePosition) {
        return this.encryption[absolutePosition];
    };

    this.getEncryptedAbsolutePosition = function(absolutePosition) {
        return CHARTONUMBER(this.getEncryptedChar(absolutePosition));
    };
}

function Machine() {
    this.reflector = new Reflector('B', 'AY BR CU DH EQ FS GL IP JX KN MO TZ VW');
    this.wheelLeft = new Wheel('1', 'A', 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
    this.wheelCenter = new Wheel('2', 'A', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E');
    this.wheelRight = new Wheel('3', 'A', 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V');
    this.plugboard = new Plugboard('');

    this.encryptChar = function(char) {
        this.rotateWheel();
        var pos = this.plugboard.getEncryptedAbsolutePosition(CHARTONUMBER(char));
        pos = this.wheelLeft.getForwardEncryptedAbsolutePosition(this.wheelCenter.getForwardEncryptedAbsolutePosition(
                this.wheelRight.getForwardEncryptedAbsolutePosition(pos)));
        pos = this.reflector.getEncryptedAbsolutePosition(pos);
        pos = this.wheelRight.getBackwardEncryptedAbsolutePosition(this.wheelCenter.getBackwardEncryptedAbsolutePosition(
                this.wheelLeft.getBackwardEncryptedAbsolutePosition(pos)));
        return this.plugboard.getEncryptedChar(pos);
    };

    this.rotateWheel = function() {
        if (this.wheelCenter.isNotchActive()) {
            this.wheelLeft.incrementPosition();
            this.wheelCenter.incrementPosition();
        } else if (this.wheelRight.isNotchActive()) {
            this.wheelCenter.incrementPosition();
        }
        this.wheelRight.incrementPosition();
    };
}



