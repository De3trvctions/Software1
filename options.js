const numberText = document.querySelector("#number_inputbox");
const checkPage = document.querySelector("#menu_page_checkbox");
const checkPageMenuitem = document.querySelector("#menuitem_page_checkbox");
const checkTab = document.querySelector("#menu_tab_checkbox");
const checkOnlyCurrent = document.querySelector("#onlycurrent_checkbox");
const checkClearList = document.getElementById("menuitem_clearlist_checkbox");
const saveLastSessionData = document.getElementById("save_session_button");

async function numberChanged(e) {
  let showNumber = parseInt(numberText.value);
  if (isNaN(showNumber) ||
      showNumber > numberText.max ||
      showNumber < numberText.min)
    showNumber = browser.sessions.MAX_SESSION_RESULTS;

  await Storage.set({
    showNumber: showNumber
  });

  numberText.value = showNumber;
  browser.extension.getBackgroundPage().ClosedTabListChanged();
}

async function checkboxChanged(e) {
  switch (e.target.id) {
  case "menu_tab_checkbox":
    await Storage.set({
      showTabMenu: checkTab.checked
    });
    break;
  case "menu_page_checkbox":
    await Storage.set({
      showPageMenu: checkPage.checked,
      showPageMenuitem: false
    });
    checkPageMenuitem.checked = false;
    break;
  case "menuitem_page_checkbox":
    await Storage.set({
      showPageMenu: false,
      showPageMenuitem: checkPageMenuitem.checked
    });
    checkPage.checked = false;
    break;
  case "onlycurrent_checkbox":
    await Storage.set({
      onlyCurrent: checkOnlyCurrent.checked
    });
    break;
  case checkClearList.id:
    await Storage.set({
      showClearList: checkClearList.checked
    });
    break;
  }
  browser.extension.getBackgroundPage().ClosedTabListChanged();
}

function init() {
  [
    "contextmenus_headline",
    "menuitem_number_label",
    "onlycurrent_label",
    "menus_headline",
    "menu_tab_label",
    "menu_page_label",
    "menuitem_page_label",
    "menuitem_clearlist_label"
  ].forEach((id) => {
    document.querySelector("#" + id).textContent = browser.i18n.getMessage(id);
  });
  numberText.title = browser.i18n.getMessage("numberText_title", browser.sessions.MAX_SESSION_RESULTS);

  numberText.max = browser.sessions.MAX_SESSION_RESULTS;
  loadOptions();
  numberText.addEventListener("change", numberChanged);
  checkTab.addEventListener("change", checkboxChanged);
  checkPage.addEventListener("change", checkboxChanged);
  checkPageMenuitem.addEventListener("change", checkboxChanged);
  checkOnlyCurrent.addEventListener("change", checkboxChanged);
  checkClearList.addEventListener("change", checkboxChanged);
  saveLastSessionData.addEventListener("click", writeFile);
}

//Fired if user had clicked "save_session_button"
//Get the data from the localStorage and create a text file with a link for download
function writeFile(){
  try{
    console.log("writing");//for debugging
    var str = JSON.stringify(localStorage.getItem("data"));
    var data = encode(str);
    var blob = new Blob([data],{type:'text/plain'});
    var file = new File([blob],"outputJSON.txt");
    var fileUrl = window.URL.createObjectURL(file);

    //Setup the download link
    var downloadLink = document.getElementById("download_link");
    downloadLink.setAttribute("href",fileUrl);
    downloadLink.setAttribute("download","output.txt");
    downloadLink.innerHTML = "Click here to download the file";
    document.body.appendChild(downloadLink);
    console.log("done");//for debugging 
  }
  //simple error log for debug
  catch(error){
    console.log(error);
  }
}

//For encode the last session data into a blob for text output
function encode ( string ){
  var output = [];
  for ( var i = 0; i < string.length; i++ ) {
    output[i] = string.charCodeAt(i);
  }
  return new Uint8Array( output );
}

function loadOptions() {
  Storage.get().then((result) => {
    numberText.value = result.showNumber;
    checkTab.checked = result.showTabMenu;
    checkPage.checked = result.showPageMenu;
    checkPageMenuitem.checked = result.showPageMenuitem;
    checkOnlyCurrent.checked = result.onlyCurrent;
    checkClearList.checked = result.showClearList;
  });
}

init();
