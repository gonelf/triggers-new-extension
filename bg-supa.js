const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaXBtYmpqZGlucmtxanpoc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU5MDE4ODksImV4cCI6MTk3MTQ3Nzg4OX0.PzJP_QTN7zW0Wz0euTlMoSgrlIJvn93tpfWpvgVQ4qA';
const SUPABASE_URL = "https://taipmbjjdinrkqjzhsmm.supabase.co";
const { createClient } = supabase;
supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('supabase?', supabase);

var editor_on = false;

function handleActions(evt) {
 chrome.tabs.query({active: true, currentWindow: true}, tabs => {
   chrome.tabs.sendMessage(tabs[0].id, evt, config => {
     console.log("config: "+config);
     // do something with config
   });
 });
}

const handleMessage = async function(msg, sender, response){
  console.log('handle...');
  if(msg.command == 'logoutAuth'){
    let { error } = await supabase.auth.signOut();
    //check for error here.. then choose response..
    response({type: "un-auth", status: "success", message: true});
  }
  if(msg.command == 'checkAuth'){
    var user = await supabase.auth.user();
    if (user) {
      // User is signed in.
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  if(msg.command == 'loginUser'){
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
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  if(msg.command == 'signupUser'){
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
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  if(msg.command === "page_edit:Action"){
    editor_on = editor_on ? false : true;
    if (editor_on){
      handleActions("page_edit_on");
      response({type: "action", status: "page_edit_on", message: true});
    }
    else {
      handleActions("page_edit_off");
      response({type: "action", status: "page_edit_off", message: true});
    }
  }
  else {
    response({type: "unknown", status: "nothing done", message: false});
  }
  return true;
}


chrome.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, sender, response);
  return true;
});
