/*
 * static variables
 */
var MACHINE;
var WHEELS = new Array('0');
var REFLECTORS = new Array();
var PLUGBOARD;

var INPUTFOCUSED = false;

/*
 * create machine, wheels & reflectors
 */
window.onload = function(e) {
    createButtons();
    createObjects();
    changeConfiguration(createRandomConfiguration());
    setSelectedWheels();
    canvasInit();
};

/*
 * catch entered text via keybaord
 */
$(this).keyup(function(e) {
    if (INPUTFOCUSED) {
        return;
    }
    var char = String.fromCharCode(e.which);
    if (e.which >= 65 && e.which <= 90) {
        //char between A-Z pressed
        $('#inputButton' + char).css('border-style', 'inset');
        $('#inputButton' + char).click();
        setTimeout(function() {
            $('#inputButton' + char).css('border-style', '');
        }, 100);
    } else if (e.which === 32) {
        //space pressed
        validCharPressed(' ');
    } else if (e.which === 8) {
        //backslash pressed
        backslashPressed();
    }
});

/*
 * catch clicked button
 */
function catchClickedButton() {
    $('[class="button keyboardButton"]').on('click', function(e) {
        validCharPressed(e.target.defaultValue);
    });
}

/*
 * catch reset button
 */
$('.glyphicon-remove-circle').on('click', function(e) {
    resetMachine();
});

/*
 * catch about link
 */
$('#aboutLink').on('click', function(e) {
    $('#aboutDialog').modal();
    return false;
});

/*
 * catch settings link
 */
$('#settingsLink').on('click', function(e) {
    $('#currentConfiguration').val(getConfiguration());
    $('#settingsDialog').modal();
    return false;
});

/*
 * prevent navigate back by pressing backslash
 */
$(this).keydown(function(e) {
    if (e.which === 8 || e.which === 32) {
        if (!INPUTFOCUSED) {
            e.preventDefault();
        }
    }
    if (e.which === 27) {
        $('#closeAboutDialog').click();
        $('#closeSettingsDialog').click();
    }
    if (e.which === 13) {
        if (INPUTFOCUSED) {
            $('#saveSettings').click();
        } else {
            $('#closeSettingsDialog').click();
        }
    }
});

/*
 * change INPUTFOCUS variable
 */
$('#currentConfiguration').focusin(function(e) {
    INPUTFOCUSED = true;
});
$('#currentConfiguration').focusout(function(e) {
    INPUTFOCUSED = false;
});

/*
 * catch set default & random config buttons
 */
$('#setDefaultConfiguration').on('click', function (e) {
    $('#currentConfiguration').val(createDefaultConfiguration());
});
$('#setRandomConfiguration').on('click', function (e) {
    $('#currentConfiguration').val(createRandomConfiguration());
});

/*
 * catch save settings button
 */
$('#saveSettings').on('click', function(e) {
    changeConfiguration($('#currentConfiguration').val());
    resetMachine();
    $('#closeSettingsDialog').click();
});

/*
 * resize buttons & canvas when window is resized
 */
$(window).bind("resize", function(e) {
    resizeButtons();
    canvasResize();
});

function resizeButtons() {
    var width = $('[class="button"]').outerWidth();
    $('[class="button"]').css('height', width);
    $('[class="button keyboardButton"]').css('height', width);
    if (width <= 35) {
        if (navigator.userAgent.toLowerCase().indexOf("iphone") !== -1) {
            $('[class="button"]').css({'font-size': 'small', 'margin': '0px 0.7%'});
            $('[class="button keyboardButton"]').css({'font-size': 'small', 'margin': '0px 0.7%'});
        } else {
            $('[class="button"]').css({'font-size': 'small', 'margin': ''});
            $('[class="button keyboardButton"]').css({'font-size': 'small', 'margin': ''});
        }
    } else {
        $('[class="button"]').css({'font-size': 'large', 'margin-left': ''});
        $('[class="button keyboardButton"]').css({'font-size': 'large', 'margin-left': ''});
    }
}

/*
 * catch change wheel button
 */
$('.selectWheel a').on('click', function(e) {
    var state = e.target.parentElement.className;
    if (state.match(/disabled/) || state.match(/active/)) {
        return false;
    }
    if (state.match(/reflector/)) {
        var number = state.substring(9, 10);
        MACHINE.reflector = REFLECTORS[number];
    } else {
        var number = state.substring(5, 6);
        var wheel = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
        wheel = wheel.substring(0, wheel.length - 3);
        WHEELS[number].changeStartPosition('A');
        MACHINE[wheel] = WHEELS[number];
    }
    resetMachine();
    return false;
});




/*
 * functions
 */
function validCharPressed(char) {
    $('#inputTextField').html($('#inputTextField').html() + char);
    if (' ' === char) {
        $('#outputTextField').html($('#outputTextField').html() + char);
        canvasReset();
    } else {
        var encryptedChar = MACHINE.encryptChar(char);
        canvasShowEncryption(char);
        glowLampButton(encryptedChar);
        $('#outputTextField').html($('#outputTextField').html() + encryptedChar);
    }
}

function backslashPressed() {
    var text = $('#outputTextField').html();
    $('#outputTextField').html(text.substring(0, text.length - 1));
    text = $('#inputTextField').html();
    $('#inputTextField').html(text.substring(0, text.length - 1));
    if (text.replace(/\s+/g, '') !== $('#inputTextField').html().replace(/\s+/g, '')) {
        MACHINE.undoRotateWheel();
    }
    var char = text.substring(text.length - 2, text.length - 1);
    if (char.length > 0 && char !== ' ') {
        canvasShowEncryption(char);
    } else {
        canvasReset();
    }
}

function glowLampButton(char) {
    $('#lampButton' + char).css({'color': 'yellow', 'background-color': 'black'});
    setTimeout(function() {
        $('#lampButton' + char).css({'color': '', 'background-color': ''});
    }, 400);
}


function createObjects() {
    WHEELS[1] = new Wheel('1', 'A', 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
    WHEELS[2] = new Wheel('2', 'A', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E');
    WHEELS[3] = new Wheel('3', 'A', 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V');
    WHEELS[4] = new Wheel('4', 'A', 'ESOVPZJAYQUIRHXLNFTGKDCMWB', 'J');
    WHEELS[5] = new Wheel('5', 'A', 'VZBRGITYUPSDNHLXAWMJQOFECK', 'Z');
    REFLECTORS['B'] = new Reflector('B', 'AY BR CU DH EQ FS GL IP JX KN MO TZ VW');
    REFLECTORS['C'] = new Reflector('C', 'AF BV CP DJ EI GO HY KR LZ MX NW QT SU');
    PLUGBOARD = new Plugboard('');
    MACHINE = new Machine(REFLECTORS['B'], WHEELS[1], WHEELS[2], WHEELS[3], PLUGBOARD);
}

function getConfiguration() {
    var config = MACHINE.reflector.name + ', ';
    ['wheelLeft', 'wheelCenter', 'wheelRight'].forEach(function(wheel) {
        config += MACHINE[wheel].name + '-' + MACHINE[wheel].startPosition + ', ';
    });
    config += MACHINE.plugboard.getEncryptedChars();
    return config;
}

function changeConfiguration(config) {
    config = config.toUpperCase();
    config = config.replace(/,\s+/g, ',').split(',');
    if (!validateConfiguration(config)) {
        return;
    }
    MACHINE.reflector = REFLECTORS[config[0]];
    var i = 1;
    ['wheelLeft', 'wheelCenter', 'wheelRight'].forEach(function(wheel) {
        MACHINE[wheel] = WHEELS[config[i][0]];
        MACHINE[wheel].changeStartPosition(config[i][2]);
        i++;
    });
    MACHINE.plugboard.setEncryptedChars(config[4]);
}

function validateConfiguration(config) {
    if (config[0].match(/B|C/) === null) {
        showError('The entered reflector is not valid');
        return false;
    }
    for (var i = 0; i < 3; i++) {
        if (config[i + 1][0].match(/[1-5]/) === null || config[i + 1][2].match(/[A-Z]/) === null) {
            showError('The entered wheel at position nr ' + (i + 1) + ' is not valid');
            return false;
        }
    }
    if (config[1][0] === config[2][0] || config[1][0] === config[3][0] || config[2][0] === config[3][0]) {
        showError('Please choose a different wheel for each position');
        return false;
    }
    if (config[4].match(/^\s*([A-Z]{2}\s)*[A-Z]{2}\s*$/) === null && config[4] !== '') {
        showError('The entered plugboard is not valid');
        return false;
    }
    return true;
}

function createRandomConfiguration() {
    var config = ['B', 'C'][getRandomNr(0, 1)] + ', ';
    var wheels = new Array();
    var wheelNr;
    for (var i = 0; i < 3; i++) {
        do {
            wheelNr = getRandomNr(1, 5);
        } while (wheels.indexOf(wheelNr) !== -1)
        wheels.push(wheelNr);
        config += wheelNr + '-' + NUMBERTOCHAR(getRandomNr(1, 26)) + ', ';
    }
    var until = getRandomNr(0, 13);
    var usedChar = new Array();
    var char1;
    var char2;
    for (var i = 0; i < until; i++) {
        [char1, char2].forEach(function(char) {
            do {
                char = NUMBERTOCHAR(getRandomNr(1, 26));
            } while (usedChar.indexOf(char) !== -1)
            usedChar.push(char);
            config += char;
        });
        config += ' ';
    }
    return config;
}

function createDefaultConfiguration() {
    return 'B, 1-A, 2-A, 3-A, ';
}

function getRandomNr(low, high) {
    return Math.round(Math.random() * (high - low) + low);
}


function showError(message) {
    var time = new Date().getTime();
    var html = '<div class="alert alert-danger alert-dismissable errorMessage" id="errorMessage'
            + time + '" style="z-index:5">'
            + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
            + '<strong>Error ! </strong> '
            + message + '</div>';
    $('#errorMessage').html(html);
}

function createButtons() {
    var firstRowButtons = new Array('Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O');
    var secondRowButtons = new Array('A', 'S', 'D', 'F', 'G', 'H', 'J', 'K');
    var thirdRowButtons = new Array('P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L');
    firstRowButtons.forEach(function(char) {
        $('#inputFirstRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputFirstRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    secondRowButtons.forEach(function(char) {
        $('#inputSecondRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputSecondRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    thirdRowButtons.forEach(function(char) {
        $('#inputThirdRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputThirdRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    resizeButtons();
    catchClickedButton();
}

function resetMachine() {
    MACHINE.resetWheels();
    $('#inputTextField').html('');
    $('#outputTextField').html('');
    setSelectedWheels();
    canvasReset();
}


function setSelectedWheels() {
    //remove active & disabled in every wheel
    $('.selectWheel a').each(function(e) {
        $(this).parent().removeClass('disabled active');
    });
    //set active wheel
    $('#wheelLeftSet .wheel' + MACHINE.wheelLeft.name).addClass('active');
    $('#wheelCenterSet .wheel' + MACHINE.wheelCenter.name).addClass('active');
    $('#wheelRightSet .wheel' + MACHINE.wheelRight.name).addClass('active');
    //set disabled wheels
    $('#wheelLeftSet .wheel' + MACHINE.wheelCenter.name).addClass('disabled');
    $('#wheelLeftSet .wheel' + MACHINE.wheelRight.name).addClass('disabled');
    $('#wheelCenterSet .wheel' + MACHINE.wheelLeft.name).addClass('disabled');
    $('#wheelCenterSet .wheel' + MACHINE.wheelRight.name).addClass('disabled');
    $('#wheelRightSet .wheel' + MACHINE.wheelLeft.name).addClass('disabled');
    $('#wheelRightSet .wheel' + MACHINE.wheelCenter.name).addClass('disabled');
    $('.selectWheel .reflector' + MACHINE.reflector.name).addClass('active');
}

/*
 * CANVAS
 */

var colorFW = '#428bca';
var colorBW = '#32CD32';

/*
 * plugboard canvas
 */

function plugInit() {
    window['plugStage'] = new Kinetic.Stage({
        container: 'plugboardCanvas',
        width: 780,
        height: 180
    });
    plugResize();
    plugAddChars();
}

function plugAddChars() {
    var layer = new Kinetic.Layer();
    for (var i = 0; i < 26; i++) {
        layer.add(new plugCreateChar(NUMBERTOCHAR(i + 1), 5 + i * 30, 112, false));
        layer.add(new plugCreateChar(NUMBERTOCHAR(i + 1), 5 + i * 30, 50, true));
        layer.add(new canvasCreateLine((12 + i * 30), 110, 12 + (MACHINE.plugboard.getEncryptedAbsolutePosition(i + 1) - 1) * 30, 70, 'white', 0.5));
    }
    plugStage.add(layer);
}

function plugReset() {
    plugStage.destroy();
    plugInit();
}

function plugShowEncryption(char) {
    var layer = new Kinetic.Layer();
    //input
    layer.add(new canvasCreateUpArrow(12 + (CHARTONUMBER(char) - 1) * 30, 175, 40, colorFW));
    layer.add(new canvasCreateLine((12 + (CHARTONUMBER(char) - 1) * 30), 110,
            12 + (MACHINE.plugboard.getEncryptedAbsolutePosition(CHARTONUMBER(char)) - 1) * 30, 70, colorFW, 1.5));
    layer.add(new canvasCreateUpArrow(12 + (MACHINE.plugboard.getEncryptedAbsolutePosition(CHARTONUMBER(char)) - 1) * 30, 45, 40, colorFW));
    //output
    layer.add(new canvasCreateDownArrow(12 + (MACHINE.getEncryptedPositions(char)['backward']['wheelRight'] - 1) * 30, 5, 40, colorBW));
    layer.add(new canvasCreateLine(12 + (MACHINE.getEncryptedPositions(char)['backward']['wheelRight'] - 1) * 30, 70,
            12 + (MACHINE.getEncryptedPositions(char)['backward']['plugboard'] - 1) * 30, 110, colorBW, 1.5));
    layer.add(new canvasCreateDownArrow(12 + (MACHINE.getEncryptedPositions(char)['backward']['plugboard'] - 1) * 30, 135, 40, colorBW));

    plugStage.add(layer);
}

function plugCreateChar(char, xPosition, yPosition, draggable) {
    var charObject = new Kinetic.Text({
        x: xPosition,
        y: yPosition,
        text: char,
        fontSize: 18,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        fill: 'white',
        draggable: draggable
    });
    if (draggable) {
        charObject.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });
        charObject.on('mouseout', function() {
            document.body.style.cursor = 'default';
        });
        charObject.on("dragend", function() {
            var xPos = this.getX() + 10;
            MACHINE.plugboard.addEncryptedChar(char, NUMBERTOCHAR(parseInt(xPos / 30) + 1));
            resetMachine();
        });
    }
    return charObject;
}

function plugResize() {
    var size = $('.container').width();
    if (size > 780) {
        size = 780;
    }
    plugStage.scaleX(size / 780);
    plugStage.scaleY(size / 780);
    plugStage.width((size / 780) * 780);
    plugStage.height((size / 780) * 180);
    plugStage.draw();
}

/*
 * wheelsCanvas
 */

var canvasWheels = new Array('wheelRight', 'wheelCenter', 'wheelLeft');
var canvasAllWheels = new Array('plugboard', 'wheelRight', 'wheelCenter', 'wheelLeft', 'reflector');

function wheelsInit() {
    canvasWheels.forEach(function(wheel) {
        window[wheel + 'Stage'] = new Kinetic.Stage({
            container: wheel + 'Canvas',
            width: 200,
            height: 400
        });
        wheelInit(wheel);
    });
}

function wheelsReset() {
    canvasWheels.forEach(function(wheel) {
        window[wheel + 'Stage'].destroy();
    });
    wheelsInit();
}

function wheelsShowEncryption(char) {
    canvasWheels.forEach(function(wheel) {
        wheelShowEncryption(wheel, char);
    });
}

/*
 * wheel helper functions
 */

function wheelInit(wheel) {
    var layer = new Kinetic.Layer();
    for (var i = 0; i < 26; i++) {
        var char = NUMBERTOCHAR(MACHINE[wheel].getRelativePosition((i + 23) % 26));
        var color = 'white';
        if (char === MACHINE[wheel].notch) {
            color = '#DEB887';
            layer.add(new canvasCreateLine(55, 11 + i * 15, 65, 11 + i * 15, color, 3));
            layer.add(new canvasCreateLine(135, 11 + i * 15, 145, 11 + i * 15, color, 3));
        }
        layer.add(new wheelCreateChar(char, 70, 5 + i * 15, color));
        layer.add(new wheelCreateChar(char, 120, 5 + i * 15, color));
        layer.add(new canvasCreateLine(85, 11 + (MACHINE[wheel].getForwardEncryptedAbsolutePosition((i + 23) % 26) + 3) % 26 * 15,
                115, 11 + i * 15, 'white', 0.5));
    }
    var rect = new Kinetic.Rect({
        x: 60,
        y: 63,
        width: 80,
        height: 15,
        stroke: 'white',
        strokeWidth: 3,
        draggable: true
    });
    rect.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    rect.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });
    rect.on("dragend", function() {
        var char = NUMBERTOCHAR(MACHINE[wheel].getRelativePosition((parseInt((this.getY() + 4) / 15) + 23) % 26));
        MACHINE[wheel].changeStartPosition(char);
        resetMachine();
    });
    layer.add(rect);
    window[wheel + 'Stage'].add(layer);
}

function wheelShowEncryption(wheel, char) {
    var layer = new Kinetic.Layer();
    //forward
    var charNr = (MACHINE.getEncryptedPositions(char)['forward'][canvasAllWheels[canvasAllWheels.indexOf(wheel) - 1]] + 3) % 26;
    layer.add(new canvasCreateLeftArrow(190, 11 + charNr * 15, 40, colorFW));
    layer.add(new canvasCreateLine(85, 11 + (MACHINE[wheel].getForwardEncryptedAbsolutePosition((charNr + 23) % 26) + 3) % 26 * 15,
            115, 11 + charNr * 15, colorFW, 1.5));
    charNr = (MACHINE.getEncryptedPositions(char)['forward'][wheel] + 3) % 26;
    layer.add(new canvasCreateLeftArrow(50, 11 + charNr * 15, 40, colorFW));

    //backward
    charNr = (MACHINE.getEncryptedPositions(char)['backward'][canvasAllWheels[canvasAllWheels.indexOf(wheel) + 1]] + 3) % 26;
    layer.add(new canvasCreateRightArrow(10, 11 + charNr * 15, 40, colorBW));
    charNr = (MACHINE.getEncryptedPositions(char)['backward'][wheel] + 3) % 26;
    layer.add(new canvasCreateRightArrow(150, 11 + charNr * 15, 40, colorBW));
    layer.add(new canvasCreateLine(85, 11 + (MACHINE[wheel].getForwardEncryptedAbsolutePosition((charNr + 23) % 26) + 3) % 26 * 15,
            115, 11 + charNr * 15, colorBW, 1.5));

    window[wheel + 'Stage'].add(layer);
}


function wheelCreateChar(char, xPosition, yPosition, color) {
    var charObject = new Kinetic.Text({
        x: xPosition,
        y: yPosition,
        text: char,
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        fill: color
    });
    return charObject;
}

/*
 * reflector canvas
 */

function reflectorInit() {
    window['reflectorStage'] = new Kinetic.Stage({
        container: 'reflectorCanvas',
        width: 160,
        height: 400
    });
    reflectorAddChars();
}

function reflectorAddChars() {
    var layer = new Kinetic.Layer();
    var connectedChars = new Array();
    for (var i = 0; i < 26; i++) {
        var charNr = (i + 23) % 26;
        if (charNr === 0) {
            charNr = 26;
        }
        var char = NUMBERTOCHAR(charNr);
        layer.add(new wheelCreateChar(char, 90, 5 + i * 15, 'white'));
        if (connectedChars.indexOf(char) === -1) {
            var encryptedChar = MACHINE.reflector.getEncryptedAbsolutePosition(charNr);
            layer.add(new reflectorCreateLine(85, 11 + (encryptedChar + 3) % 26 * 15, 85, 11 + i * 15, 'white', 0.5));
            connectedChars.push(NUMBERTOCHAR(encryptedChar));
        }
        connectedChars.push(char);
    }
    reflectorStage.add(layer);
}

function reflectorShowEncryption(char) {
    var layer = new Kinetic.Layer();
    //forward
    var charNr = (MACHINE.getEncryptedPositions(char)['forward']['wheelLeft'] + 3) % 26;
    layer.add(new canvasCreateLeftArrow(160, 11 + charNr * 15, 40, colorFW));
    layer.add(new reflectorCreateLine(85, 11 + (MACHINE.getEncryptedPositions(char)['backward']['reflector'] + 3) % 26 * 15,
            85, 11 + charNr * 15, colorBW, 1.5));
    //backward
    charNr = (MACHINE.getEncryptedPositions(char)['backward']['reflector'] + 3) % 26;
    layer.add(new canvasCreateRightArrow(120, 11 + charNr * 15, 40, colorBW));
    reflectorStage.add(layer);
}

function reflectorReset() {
    reflectorStage.destroy();
    reflectorInit();
}

function reflectorCreateLine(xStart, yStart, xEnd, yEnd, color, width) {
    var helper = (yStart + yEnd) % 67 + 10;
    var line = new Kinetic.Line({
        points: [xStart, yStart, xStart - helper, yStart, xEnd - helper, yEnd, xEnd, yEnd],
        stroke: color,
        strokeWidth: width
    });
    return line;
}

/*
 * functions for all canvases
 */

function canvasInit() {
    plugInit();
    wheelsInit();
    reflectorInit();
}

function canvasShowEncryption(char) {
    canvasReset();
    plugShowEncryption(char);
    wheelsShowEncryption(char);
    reflectorShowEncryption(char);
}

function canvasReset() {
    plugReset();
    wheelsReset();
    reflectorReset();
}

function canvasResize() {
    plugResize();
}

/*
 * canvas helper functions
 */


function canvasCreateLine(xStart, yStart, xEnd, yEnd, color, width) {
    var line = new Kinetic.Line({
        points: [xStart, yStart, xEnd, yEnd],
        stroke: color,
        strokeWidth: width
    });
    return line;
}

function canvasCreateUpArrow(xStart, yStart, length, color) {
    var arrow = new Kinetic.Line({
        points: [xStart - 4, yStart - length + 15, xStart - 4, yStart, xStart + 4, yStart, xStart + 4, yStart - length + 15, xStart + 10, yStart - length + 15,
            xStart, yStart - length, xStart - 10, yStart - length + 15, xStart - 4, yStart - length + 15],
        fill: color,
        stroke: color,
        strokeWidth: 1,
        closed: true
    });
    return arrow;
}

function canvasCreateDownArrow(xStart, yStart, length, color) {
    var arrow = new Kinetic.Line({
        points: [xStart - 4, yStart + length - 15, xStart - 4, yStart, xStart + 4, yStart, xStart + 4, yStart + length - 15, xStart + 10, yStart + length - 15,
            xStart, yStart + length, xStart - 10, yStart + length - 15, xStart - 4, yStart + length - 15],
        fill: color,
        stroke: color,
        strokeWidth: 1,
        closed: true
    });
    return arrow;
}

function canvasCreateLeftArrow(xStart, yStart, length, color) {
    var arrow = new Kinetic.Line({
        points: [xStart - length + 15, yStart + 4, xStart, yStart + 4, xStart, yStart - 4, xStart - length + 15, yStart - 4, xStart - length + 15, yStart - 10,
            xStart - length, yStart, xStart - length + 15, yStart + 10, xStart - length + 15, yStart + 4],
        fill: color,
        stroke: color,
        strokeWidth: 1,
        closed: true
    });
    return arrow;
}

function canvasCreateRightArrow(xStart, yStart, length, color) {
    var arrow = new Kinetic.Line({
        points: [xStart + length - 15, yStart - 4, xStart, yStart - 4, xStart, yStart + 4, xStart + length - 15, yStart + 4, xStart + length - 15, yStart + 10,
            xStart + length, yStart, xStart + length - 15, yStart - 10, xStart + length - 15, yStart - 4],
        fill: color,
        stroke: color,
        strokeWidth: 1,
        closed: true
    });
    return arrow;
}
