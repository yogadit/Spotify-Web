var redirect_uri = "http://localhost/UASPTI/home.html";

// var client_id = "";
// var client_secret = "";

var client_id = "b588b8df0eb942adb9378f36ea72ce87"; // test ini pny kage
var client_secret = "bb2ced831fdc43499631d5cf4c10a1b6"; // In a real app you should not expose your client_secret to the user // pny kage

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

function onPageLoad() {
  client_id = localStorage.getItem("client_id");
  client_secret = localStorage.getItem("client_secret");

  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    access_token = localStorage.getItem("access_token");
    if (access_token == null) {
      // we don't have an access token so present token section
      document.getElementById("tokenSection").style.display = "block";
    } else {
      // we have an access token so present device section
      document.getElementById("deviceSection").style.display = "block";
      refreshDevices();
      refreshPlaylists();
      currentlyPlaying();
    }
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri);
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

function requestAuthorization() {
  client_id = window.client_id;
  client_secret = window.client_secret;
  localStorage.setItem("client_id", client_id);
  localStorage.setItem("client_secret", client_secret);

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  url += "&show_dialog=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url;
}

function refreshDevices() {
  callAuthorizationApi("GET", DEVICES, null, handleAuthorizationResponse);
}

function search() {
  filter = document.getElementById("searchType").value;
  query = document.getElementById("searchName").value;
  let url = "?q=" + encodeURIComponent(filter + ":" + query);
  url += "&type=" + encodeURIComponent(filter);
  url += "&market=ID";

  callApi("GET", SEARCH + url, null, handleApiResponse);
}
