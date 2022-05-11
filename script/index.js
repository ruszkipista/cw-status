// import {CSVToArray} from "csv-parser";

function init(){
    for (let form of document.getElementsByTagName("form")){
        form.onsubmit=onClickedSubmit;
    }

    let collections = fetchCollections("/collections.csv");
}
onload=init;

function fetchCollections(file){
  fetch(file)
  .then(response => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem fetching ${file}. Status Code: ${response.status}`);
        return null;
      }
      // get text from the response
      response.text().then(dataTxt=> {
        const dataObj = Papa.parse(dataTxt, {header: true});
        window.localStorage.setItem('collections', JSON.stringify(dataObj));
      });
  })
  .catch(err => {
    console.log('Fetch Error :-S', err);
  });
}

function onClickedSubmit(event){
    let fd = new FormData(event.target);
    let formdata = [];
    for(var pair of fd.entries()) {
      formdata.push([pair[0],pair[1]]);
    }
    window.localStorage.setItem('formdata', JSON.stringify(formdata));
}

function create_table() {
    formdata = JSON.parse(window.localStorage.getItem('formdata'));
    window.localStorage.removeItem('formdata');
    let labels = ["Name", "Value"];
    let tabs = document.getElementsByTagName("table");
    for (let tab of tabs) {
        // TABLE HEAD
        let thead = tab.createTHead();
        let row = thead.insertRow();
        for (let label of labels) {
            let th = document.createElement("th");
            let text = document.createTextNode(label);
            th.appendChild(text);
            row.appendChild(th);
        }
        // TABLE FOOT
        let tfoot = tab.createTFoot();
        row = tfoot.insertRow()
        let cell = row.insertCell();
        cell.colSpan = labels.length;

        // TABLE BODY
        let tbody = tab.createTBody();
        for (let line = 0; line < formdata.length; line++) {
            let row = tbody.insertRow();
            if (line % 2 == 0) { row.className = "stripe" };
            for (let value of formdata[line]) {
                let cell = row.insertCell();
                let text = document.createTextNode(value);
                cell.appendChild(text);
            }
        }
    }
}

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );

    // Create an array to hold our data. Give the array a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){

            // Since we have reached a new row of data, add an empty row to our data array.
            arrData.push( [] );
        }

        // Now that we have our delimiter out of the way, let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            // We found a quoted value. When we capture this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }

        // Now that we have our value string, let's add it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}