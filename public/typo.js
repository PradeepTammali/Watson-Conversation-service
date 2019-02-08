/**
* 
* Hunspell compatible spell-checker in plain-vanilla JavaScript.
*
* nspell contains most of the essential core of Hunspell.
* It does not contain a tokeniser but leaves many details up to implementors. 
* The main difference, conceptually, is that Hunspell is based on the user and their preferences,
* whereas nspell is based on explicitly passed in options, thus producing the same results regardless of OS,
* file-system, or environment.
*/
var dictionary = require('dictionary-en-us');
var nspell = require('nspell');


var deasync = require('deasync');

var method = Typo.prototype;
var spell = null;

function Typo(){
}


method.getSpellingSuggestionsDemo = function(str){
    var word, correctSpelling;
    var words = str.split(' ');
    for (var i = 0; i < words.length; i++) {
      word = words[i];
      dictionary(function (err, dict) {
        if (err) {
          throw err;
        }
        spell = nspell(dict);
        if (!spell.correct(word)) {
          correctSpelling = spell.suggest(word);
          console.log(correctSpelling);
        }
      });
    }
    return correctSpelling;
};
  
method.getSpellingSuggestions = function(str) {
    var misspellings = false, output = {}, suggestion = [], corrections = {};
    output.original = str;
  
    var words = str.split(' ');
    var lastChar = getEnding(words[words.length - 1]);
  
    var word, noPunctuation, correctSpelling, hasMistakes, hasCorrections;
  
    dictionary(function (err, dict) {
      if (err) {
        throw err;
      }
      spell = nspell(dict);
    });
    deasync.loopWhile(function(){return spell === null;});
  
    for (var i = 0; i < words.length; i++) {
  
      word = words[i];
      noPunctuation = word.replace(/\W/g, '');
  
      if (getEnding(word)){
        word = word.slice(0,-1);
      }
  
      if (!spell.correct(word)) {
        hasMistakes = true;
        correctSpelling = spell.suggest(word);
        if (correctSpelling.length) {
          hasCorrections = true;
          corrections[word] = correctSpelling;
        } else {
          corrections[word] = null;
        }
      }
    }
  
    for (var correction in corrections) {
      if (correction && corrections[correction]) {
        var regex = new RegExp(correction, 'g');
        str = str.replace(regex, corrections[correction][0]);
      }
    }
  
    if (hasMistakes){
      output.suggestion = hasCorrections ? str : null;
      output.corrections = corrections;
    } else {
      output.suggestion = false;
    }
  
    return output;
};
  
function getEnding(str) {
    var lastChar = str.slice(-1);
    if (!lastChar.match(/^[0-9a-z]+$/)) {
      return lastChar;
    } else {
      return false;
    }
}
  
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = Typo;