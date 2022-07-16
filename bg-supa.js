const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaXBtYmpqZGlucmtxanpoc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU5MDE4ODksImV4cCI6MTk3MTQ3Nzg4OX0.PzJP_QTN7zW0Wz0euTlMoSgrlIJvn93tpfWpvgVQ4qA';
const SUPABASE_URL = "https://taipmbjjdinrkqjzhsmm.supabase.co";
const { createClient } = supabase;
supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('supabase?', supabase);

var user_settings = {};
var editor_on = false;
var tracker_on = false;

async function getUserSettings(){
  let { data: settings, error } = await supabase
  .from('settings')
  .select('approved_domains')
  .eq('user_id', supabase.auth.currentUser.id);
  if (settings) {
    user_settings['approved_domains'] = settings[0].approved_domains
  }
}

function arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

async function eventTriggerList(){
  return await chrome.storage.sync.get(['event_trigger_list'], function(result){
    console.log(result);
    return result.value ? JSON.parse(result.value) : {};
  });
}

async function saveEventTrigger(evt){
  var list = null;
  chrome.storage.sync.get(['event_trigger_list'], function(result){
    console.log(result);
    list = result.value ? JSON.parse(result.value) : [];
    list.push(evt);
    chrome.storage.sync.set({'event_trigger_list': JSON.stringify(list)});
    return list;
  });
}

function handleActions(evt) {
 chrome.tabs.query({active: true, currentWindow: true}, tabs => {
   chrome.tabs.sendMessage(tabs[0].id, evt, config => {
     console.log("config: "+config);
     // do something with config
   });
 });
}

function handle_editor(response){

      if (editor_on){
        handleActions("page_edit_on");
        response({type: "action", status: "page_edit_on", message: true});
      }
      else {
        handleActions("page_edit_off");
        response({type: "action", status: "page_edit_off", message: true});
      }
}

function handle_tracker(response){

      if (tracker_on){
        handleActions("event_track_on");
        response({type: "action", status: "event_track_on", message: true});
      }
      else {
        handleActions("event_track_off");
        response({type: "action", status: "event_track_off", message: true});
      }
}

const handleMessage = async function(msg, sender, response){
  console.log('handle...');
  console.log(msg.command);
  if(msg.command == 'logoutAuth'){
    let { error } = await supabase.auth.signOut();
    //check for error here.. then choose response..
    response({type: "un-auth", status: "success", message: true});
  }
  else if(msg.command == 'checkAuth'){
    var user = await supabase.auth.user();
    if (user) {
      // User is signed in.
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  else if(msg.command == 'loginUser'){
    console.log(msg.data);
    var email = msg.data.e;
    var pass = msg.data.p;
    let { user, error } = await supabase.auth.signIn({
      email: email,
      password: pass
    });
    console.log(error, user);
    if (user) {
      // User is signed in.
      getUserSettings();

      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  else if(msg.command == 'signupUser'){
    console.log(msg.data);
    var email = msg.data.e;
    var pass = msg.data.p;
    let { user, error } = await supabase.auth.signUp({
      email: email,
      password: pass
    });
    console.log(error, user);
    if (user) {
      // User is signed in.
      getUserSettings();

      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  else if(msg.command === "event_edit:Action"){
    editor_on = editor_on ? false : true;
    if (tracker_on) {
      tracker_on = false;
      handle_tracker(response);
    }

    handle_editor(response);
  }
  else if(msg.command === "event_track:Action"){
    tracker_on = tracker_on ? false : true;
    if (editor_on) {
      editor_on = false
      handle_editor(response);
    }

    handle_tracker(response);
  }
  else if (msg.command === "event_save:Action") {
    // console.log(msg.data);
    msg.data['user_id'] = supabase.auth.user().id;
    // save event
    const { data, error } = await supabase
    .from('events')
    .insert([
      msg.data
    ])

    if (data) {
      // send response
      response({type: "action", status: true, message: "event saved", data: data});
    }
    else {
      response({type: "action", status: false, message: "event not saved", data: error});
    }
  }

  else if (msg.command === "event_update:Action") {
    // console.log(msg.data);
    msg.data['user_id'] = supabase.auth.user().id;
    // save event
    var UID = msg.data.UID
    delete msg.data.UID;
    const { data, error } = await supabase
    .from('events')
    .update( msg.data )
    .eq('UID', UID)

    if (data) {
      // send response
      response({type: "action", status: true, message: "event updated", data: data});
    }
    else {
      response({type: "action", status: false, message: "event not updated", data: error});
    }
  }

  else if (msg.command === "event_delete:Action") {
    console.log(msg.command);
    // console.log(msg.data);
    msg.data['user_id'] = supabase.auth.user().id;
    // save event
    var UID = msg.data.UID
    delete msg.data.UID;
    const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('UID', UID)

    if (data) {
      // send response
      response({type: "action", status: true, message: "event deleted", data: data});
    }
    else {
      response({type: "action", status: false, message: "event not deleted", data: error});
    }
  }
  else if(msg.command === "event_triggered:Action"){
    // tracker_on = tracker_on ? false : true;
    let key = 'event_trigger_list';
    if (tracker_on) {
      // save event
      await chrome.storage.local.get([key], function(result){
        // console.log(result[key]);
        list = result[key] ? JSON.parse(result[key]) : [];
        // console.log(msg.data);
        list.push(msg.data);
        // console.log(list);
        chrome.storage.local.set({'event_trigger_list': JSON.stringify(list)});

        response({type: "action", status: true, message: "event trigger saved", data: JSON.stringify(list)})
      });
    }
  }
  else if(msg.command === "clear_live_tracker:Action"){
    // tracker_on = tracker_on ? false : true;
    let key = 'event_trigger_list';
    if (tracker_on) {
      // save event
      list = []
      chrome.storage.local.set({'event_trigger_list': JSON.stringify(list)});

      response({type: "action", status: true, message: "event list cleared", data: JSON.stringify(list)})

    }
  }
  else if (msg.command === "event_get_list:Action") {
    // console.log("event_get_list:Action");
    // console.log(tracker_on);
    let key = 'event_trigger_list';
    if (tracker_on) {
      // save event
      await chrome.storage.local.get([key], function(result){
        list = result[key] ? JSON.parse(result[key]) : [];
        response({type: "action", status: true, message: "event list", data: JSON.stringify(list)})
      });
    }
  }
  else {
    // console.log("default response");
    // console.log(msg.command);
    response({type: "unknown", status: "nothing done", message: false});
  }
  return true;
}


chrome.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, sender, response);
  return true;
});

// detect refresh
chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // console.log("updated");
    // console.log(changeInfo);
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.status === "complete") {

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
         // since only one tab should be active and in the current window at once
         // the return variable should only have one entry
         var activeTab = tabs[0];
         var activeTabId = activeTab.id; // or do whatever you need
         console.log(activeTab.url);
         if (typeof user_settings !== 'undefined'){
           user_settings.approved_domains.forEach((domain, i) => {
             if (activeTab.url.includes(domain)){
               console.log(activeTab.url+":"+domain);
               if (editor_on) {
                 handle_editor();
               }
               else if (tracker_on) {
                 handle_tracker();
               }
             }
           });
         }
      });
    }
  }
);

// handle install and update
chrome.runtime.onInstalled.addListener(details => {
  // console.log(details);
  if (details.reason === "update") {
    if (supabase.auth.currentSession) {
      getUserSettings();
    }
    //chrome.runtime.setUninstallURL('https://example.com/extension-survey');
  }
});

//
// // listen to messages from the web
// chrome.runtime.onMessageExternal.addListener(function(request, sender, response){
//   console.log("external message");
//   handleMessage("message form the web: "+request, sender, response);
// });
