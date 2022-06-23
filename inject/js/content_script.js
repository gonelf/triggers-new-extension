// inject
function inject (src, id) {
  var injected_page = src;
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL(injected_page);
  s.id = id;
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

function inject_code(actualCode, id){
  var s = document.createElement('script');
  s.textContent = actualCode;
  s.id = id;
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

function remove_code(id){
  $('html').find('script[id="'+id+'"]').remove();
}

var images = 'var icon_delete = "'+chrome.runtime.getURL("src/inject/img/delete.png")+'";'+
'var icon_text_color = "'+chrome.runtime.getURL("src/inject/img/color-text.png")+'";'+
'var icon_bucket = "'+chrome.runtime.getURL("src/inject/img/bucket.png")+'";';
inject_code(images);

inject("inject/js/jquery.min.js");
// inject("src/inject/js/state-machine.min.js");
inject("inject/js/content_inject.js");

// commms
const evtToPage = chrome.runtime.id;
const evtFromPage = chrome.runtime.id + '-response';

var ext_id = "var triggers_ext_id = '"+evtToPage+"';";
inject_code(ext_id);

// // this creates a script element with the function's code and passes event names
const script = document.createElement('script');
script.textContent = `(${inPageContext})("${evtToPage}", "${evtFromPage}")`;
document.documentElement.appendChild(script);
script.remove();
//
// // this function runs in page context and registers a listener
function inPageContext(listenTo, respondWith) {
  addEventListener(listenTo, () => {
    dispatchEvent(new CustomEvent(respondWith, {
      detail: window.config,
    }));
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg);

  addEventListener(evtFromPage, e => sendResponse(e.detail), {once: true});
  dispatchEvent(new Event(evtToPage));

  // if (msg === 'getConfig') {
  //   // DOM messaging is synchronous so we don't need `return true` in onMessage
  //   addEventListener(evtFromPage, e => sendResponse(e.detail), {once: true});
  //   dispatchEvent(new Event(evtToPage));
  // }
  if (msg === "page_edit_on") {
    inject("inject/js/page_edit_on.js", "ext-edit_on");
  }
  if (msg === "page_edit_off") {
    inject("inject/js/page_edit_off.js", "ext-edit_off");
  }
});
