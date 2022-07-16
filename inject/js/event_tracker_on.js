jq("body").css("margin-right", "20%");
jq("nav").css("margin-right", "20%");
jq("body").append(`
<div id='event_tracker' class='event_tracker'>
  <div class='title'>
    <b>Live tracker</b>
    <button id='clear_live_tracker' type="button" class='float_right' value='Clear'>Clear</button>
    <button id='stop_live_tracker' type="button" class='float_right' value='Stop'>Stop</button>
    <div id='event_tracker_container'></div>
  </div>
</div>`);
evtnr_live_on = true;
window.postMessage({ type: "FROM_PAGE", action: "load_event_list" });
