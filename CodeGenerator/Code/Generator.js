

function splitSpan()
{
    var span1 = document.getElementById("span1");
    span1.value = "d";

}
 

function bind(text) {
    document.getElementById("result").value = text;
}

function stringReplace(text, search, replacement) {
    return text.split(search).join(replacement);
}


//" sadfasd {{   asdfas }} asdfa   }}  asdfasd }}  ")

function getScope(text) {

    var openPosition = 0;
    var closePosition = 0;
    var startPosition = 0;
    var depth = 1;

    while (depth > 0) {
        openPosition = text.indexOf("{{", startPosition);
        closePosition = text.indexOf("}}", startPosition);

        if (openPosition > -1 && openPosition < closePosition) {
            depth++;
            startPosition = openPosition + 2;
        }
        else if (closePosition > -1) {
            depth--;
            startPosition = closePosition + 2;
        }
        else {
            //error
            return "";
        }

    }
    return text.substring(0, startPosition - 2);
}

function parseText(text, scopeVariables) {

    var regEx = /##(.*?);/ig;
    //var data = "hello there ##thaosj; ##type;  ##id;  it";
    var matches = regEx.exec(text);
    var replacements = [];

    while (matches !== null) {
        var match = matches[1];
        if (replacements.indexOf(match) == -1) {
            replacements.push(match);
        }
        matches = regEx.exec(text);
    }

    for (r in replacements) {
        var replacement = replacements[r]; 

        value = eval("scopeVariables." + replacement);
        if (value) {
            text = stringReplace(text, "##" + replacement + ";", value);
        }

    }

    return text;
}

function textChanged(text) {
    var result = "";
    var json = JSON.parse(document.getElementById("json").value);

    //var lines = text.split("\n");

    //bind(parseText(text));

    //bind(getScope(text));


    var match = /##for\s*\(\s*(\w+)\s+in\s+([\w\.\[\]]+)\s*\)\s*{{/i.exec(text);

    if (match != null) {

        var command = match[0];
        var variable = match[1];
        var jsonPath = match[2];
        var jsonTree = eval("json." + jsonPath);

        result += parseText(text.substring(0, match.index), json);
        result += parseLoop(getScope(text.substring(match.index + command.length)), jsonTree, variable, json);
    }
    else {
        result += parseText(text, json);
    }

    bind(result);
}

function parseLoop(text, items, identifier, changeArray) {
    var responseText = "";
     
    //if (!changeArray) {
    //    changeArray = json;
    //}

    for (i in items) {
        item = items[i];

        var tChangeArray = changeArray;
        var match = /##for\s*\(\s*(\w+)\s+in\s+([\w\.\[\]]+)\s*\)\s*{{/i.exec(text);
         
        eval("tChangeArray." + identifier + " = item;");
         
        if (match != null) {

            var command = match[0];
            var variable = match[1];
            var jsonPath = match[2]; 
            var jsonTree = eval("tChangeArray." + jsonPath);


            responseText += parseText(text.substring(0, match.index), tChangeArray);
            responseText += parseLoop(getScope(text.substring(match.index + command.length)), jsonTree, variable, tChangeArray);
        }
        else {
            responseText += parseText(text, tChangeArray);
        }
    }

    return responseText;
}