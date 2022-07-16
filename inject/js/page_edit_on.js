console.log("page_edit_on injected");
page_edit_on = true;
var boxes = "<box id='edit_box_left' class='trgg_edit_box trgg_edit_box_left'>&nbsp;</box>"+
"<box id='edit_box_top' class='trgg_edit_box_top trgg_edit_box'>&nbsp;</box>"+
"<box id='edit_box_bottom' class='trgg_edit_box_bottom trgg_edit_box'>&nbsp;</box>"+
"<box id='edit_box_right' class='trgg_edit_box_right trgg_edit_box'>&nbsp;</box>";
jq("body").append(boxes);
var trigger_identify_events = setInterval(()=>{jq(".trigger_event").addClass("trigger_identify_events");}, 100)
