async function init(){
    for (const form of document.getElementsByTagName("form")){
        form.onsubmit=onClickedSubmit;
    }

    // getCWkatasFromCollection();

    await fetchCollections("collections.json");

    const userID = window.localStorage.getItem('userid');
    let completedKatas=null;
    if (userID){
        const userIdInputElement = document.getElementById('userid');
        userIdInputElement.value = userID;
        completedKatas = await getCWdata(userID);
    }
    
    generateTable(completedKatas);
}
onload=init;

async function onClickedSubmit(event){
    event.preventDefault();
    const fd = new FormData(event.target);
    const formdata = [];
    for(var pair of fd.entries()) {
      formdata.push([pair[0],pair[1]]);
    }
    const userID = formdata.filter(e=>e[0]==='userid')?.[0][1];
    window.localStorage.setItem('userid', userID);
    
    const completedKatas = await getCWdata(userID);
    generateTable(completedKatas);
}

async function fetchCollections(file){
  fetch(file)
  .then(response => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem fetching ${file}. Status Code: ${response.status}`);
        return null;
      }
      return response.json();
  })
  .then(data => {
      window.localStorage.setItem('collections', JSON.stringify(data));
  })
  .catch(err => {
    console.log('Fetch Error :-S', err);
  });
}

function getCWkatasFromCollection(collection="functional-fruits"){
    URL_BASE = "https://www.codewars.com/collections/";
}

async function getCWdata(userid) {
    let result = [];
    let page = 0;
    let nextBatch=[];
    do {
        nextBatch = await getCWpage(userid, page);
        result = result.concat(nextBatch);
        page++;
    } while ((nextBatch?.length ?? 0) >0);
    return result;
}

const getCWpage = async (userid, page) => {
    const url = `https://www.codewars.com/api/v1/users/${userid}/code-challenges/completed?page=${page}`;
    return await fetch(url)
    .then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem fetching ${url}. Status Code: ${response.status}`);
          return null;
        }
        return response.json();
    })
    .then(data => {
        return data.data;
    })
    .catch(err => {
      console.log('Fetch Error :-S', err);
    });    
}

function generateTableContent(completedKatas){
    const collections = JSON.parse(window.localStorage.getItem('collections'));
    const completedKataDict = completedKatas?.reduce((obj,elem)=>{
        obj[elem.id]= elem;
        return obj;
    },{}) ?? {};
    for (const collIndex in collections){
        let doneInJS = 0;
        let doneInOther = 0;
        const incompleteInJS = [];
        for (const kataID of collections[collIndex].katas){
            if (kataID in completedKataDict)
                if (completedKataDict[kataID].completedLanguages.includes("javascript")){
                    doneInJS++;
                    continue;
                } else
                    doneInOther++;
            incompleteInJS.push(kataID);
        }
        collections[collIndex].total          = collections[collIndex].katas.length;
        collections[collIndex].doneInJS       = doneInJS;
        collections[collIndex].doneInOther    = doneInOther;
        collections[collIndex].percInJS       = Math.round((doneInJS / collections[collIndex].total)*10000)/100 + '%';
        collections[collIndex].incompleteInJS = incompleteInJS;
        delete collections[collIndex].katas;
    }
    return {
        "labels": ["Tutorial", "Homework CW collection", "Total", "Done in JS", "Done in *", "Done in JS%", "Incomplete in JS"],
        "rows":   collections
    }
}

function generateTable(completedKatas) {
    const tableContent = generateTableContent(completedKatas);
    const rows = tableContent.rows;
    const labels = tableContent.labels;
    const tabs = document.getElementsByTagName("table");
    for (const tab of tabs) {
        tab.replaceChildren();
        // TABLE HEAD
        const thead = tab.createTHead();
        let tRow = thead.insertRow();
        for (const label of labels) {
            const th = document.createElement("th");
            const text = document.createTextNode(label);
            th.appendChild(text);
            tRow.appendChild(th);
        }
        // TABLE FOOT
        const tfoot = tab.createTFoot();
        tRow = tfoot.insertRow()
        const cell = tRow.insertCell();
        cell.colSpan = labels.length;

        // TABLE BODY
        if (rows){
            const tbody = tab.createTBody();
            let line = 0;
            for (const row of rows) {
                line++;
                const tRow = tbody.insertRow();
                if (line % 2 == 0) tRow.className = "stripe";
                for (const key in row) {
                    const cell = tRow.insertCell();
                    if (Array.isArray(row[key])){
                        for (const item of row[key]){
                            const a = document.createElement('a');
                            const linkText = document.createTextNode("kata");
                            a.appendChild(linkText);
                            a.title = item;
                            a.href = `https://www.codewars.com/kata/${item}`;
                            a.target="_blank";
                            cell.appendChild(a);
                            cell.appendChild(document.createElement('br'));
                        }
                    } else {
                        const text = document.createTextNode(row[key]);
                        cell.appendChild(text);
                    }
                }
            }
        }
    }
}