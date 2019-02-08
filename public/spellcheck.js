
var userWords = [
];

  var input = document.getElementById("textInput"),
    ul = document.getElementById("searchResults"),
    inputTerms,
    termsArray,
    prefix,
    terms,
    results,
    sortedResults,
    suggestions,
    searchIndex,
    results = [];
  

  var search = function() {
    searchIndex = userWords;
    results = [];
    inputTerms = input.value.toLowerCase();
    termsArray = inputTerms.split(" ");
    prefix =
      termsArray.length === 1 ? "" : termsArray.slice(0, -1).join(" ") + " ";
    terms = termsArray[termsArray.length - 1].toLowerCase();
    if (terms != "" | null | undefined) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'http://localhost:8080/api/spell-check/',
            data: '{"input":"'+terms+'"}',
            success: function(data) {
                try{
                    suggestions = data[terms];
                    if (suggestions != undefined | null) {
                        searchIndex = suggestions;
                    }
                    for (var i = 0; i < searchIndex.length; i++) {
                        var a = searchIndex[i].toLowerCase(),
                        t = a.indexOf(terms);
                        if (t > -1) {
                        results.push(a);
                        }
                    }
                    evaluateResults();
                }catch(e){
                    
                }
            }

        });
    }
  };
  
  var evaluateResults = function() {
    if (results.length > 0 && inputTerms.length > 0 && terms.length !== 0) {
      sortedResults = results.sort(sortResults);
      appendResults();
    } else if (inputTerms.length > 0 && terms.length !== 0) {
      ul.innerHTML =
        "<li><strong>" +
        inputTerms +
        '&nbsp&nbsp</strong><small><a target="_blank" href="https://bing.com/search?q=' +
        encodeURIComponent(inputTerms) +
        '">Try Bing?</a></small></li>';
    } else if (inputTerms.length !== 0 && terms.length === 0) {
      return;
    } else {
      clearResults();
    }
  };
  
  var sortResults = function(a, b) {
    if (a.indexOf(terms) < b.indexOf(terms)) return -1;
    if (a.indexOf(terms) > b.indexOf(terms)) return 1;
    return 0;
  };
  
  var appendResults = function() {
    clearResults();
  
    for (var i = 0; i < sortedResults.length && i < 5; i++) {
      var li = document.createElement("li"),
        // result =prefix + sortedResults[i].toLowerCase().replace(terms, "<strong>" + terms + "</strong>");
        result =
          sortedResults[i]
            .toLowerCase()
            .replace(terms, "<strong>" + terms + "</strong>");
  
      li.innerHTML = result;
      ul.appendChild(li);
    }
  
    if (ul.className !== "term-list") {
      ul.className = "term-list";
    }
  };
  
  var clearResults = function() {
    ul.className = "term-list hidden";
    ul.innerHTML = "";
  };
  
  input.addEventListener("keyup", search, false);