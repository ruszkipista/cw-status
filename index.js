async function init(){
    for (const form of document.getElementsByTagName("form")){
        form.onsubmit=onClickedSubmit;
    }

    const statusElement = document.getElementById("status");
    const userID = window.localStorage.getItem('userid');
    if (userID){
        const userIdInputElement = document.getElementById('userid');
        userIdInputElement.value = userID;
        statusElement.innerText = "Wait for it...";
    }

    let collectionsTxt = await fetchCollections("collections.json");
    const collections = JSON.parse(collectionsTxt);
    for (const collIndex in collections){
        const collectionID = collections[collIndex].collection;
        collections[collIndex].katas = await getCWkatasFromCollection(collectionID);
    }
    window.localStorage.removeItem('collections');
    collectionsTxt = JSON.stringify(collections);
    window.sessionStorage.setItem('collections', collectionsTxt);

    if (userID){
        const completedKatas = await getCWdata(userID);
        const tableContent = generateTableContent(collections, completedKatas);   
        generateTable(tableContent);
    }
    statusElement.innerText = "";
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
    const collections = JSON.parse(window.sessionStorage.getItem('collections'));
    const tableContent = generateTableContent(collections, completedKatas);
    generateTable(tableContent);
}

async function fetchCollections(file){
  return await fetch(file)
  .then(response => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem fetching ${file}. Status Code: ${response.status}`);
        return null;
      }
      return response.json();
  })
  .then(data => {
      return JSON.stringify(data);
  })
  .catch(err => {
    console.log('Fetch Error :%s', err);
  });
}

async function getCWkatasFromCollection(collection){
    const targetUrl = `https://www.codewars.com/collections/${collection}`;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    return await fetch(url)
    .then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem fetching ${url}. Status Code: ${response.status}`);
          return null;
        }
        return response.json();
    })
    .then(data => {
        // target anchor elements like this
        // <a href="/kata/52adc142b2651f25a8000643">Sleigh Authentication</a>
        // and get with kataID:52adc142b2651f25a8000643 and kataName:Sleigh Authentication
        const matches = data.contents.matchAll(/<a class="ml-2" href="\/kata\/(.*?)">(.*?)<\/a>/g);
        const katas=[];
        // the kataName might contain HTML entity, convert them back to character
        for (const match of matches) katas.push({"id":match[1],"name":decodeHtmlEntity(match[2])});
        return katas;
    })
    .catch(err => {
      console.log('Fetch Error :%s', err);
    });
}

const decodeHtmlEntity = html=> {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
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
      console.log('Fetch Error :%s', err);
    });    
}

function generateTableContent(collections, completedKatas){
    const completedKataDict = completedKatas?.reduce((obj,elem)=>{
        obj[elem.id]= elem;
        return obj;
    },{}) ?? {};
    for (const collIndex in collections){
        let doneInJS = 0;
        let doneInOther = 0;
        const incompleteInJS = [];
        for (const kata of collections[collIndex].katas){
            if (kata.id in completedKataDict)
                if (completedKataDict[kata.id].completedLanguages.includes("javascript")){
                    doneInJS++;
                    if (completedKataDict[kata.id].completedLanguages.length>1)
                        doneInOther++;
                    continue;
                } else
                    doneInOther++;
            incompleteInJS.push(kata);
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

function generateTable(tableContent, tab=document.getElementsByTagName("table")[0]) {
    const rows = tableContent.rows;
    const labels = tableContent.labels;
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
                        const linkText = document.createTextNode(item.name);
                        a.appendChild(linkText);
                        a.href = `https://www.codewars.com/kata/${item.id}`;
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