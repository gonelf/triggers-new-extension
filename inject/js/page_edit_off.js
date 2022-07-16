console.log("page_edit_off injected");
page_edit_on = false;
clean();
jq(".trgg_edit_box").remove();
clearInterval(trigger_identify_events);
jq(".trigger_event").removeClass("trigger_identify_events");
