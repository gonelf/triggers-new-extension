console.log("page_edit_on injected");
page_edit_on = true;
var boxes = "<box id='edit_box_left' class='trgg_edit_box trgg_edit_box_left'>&nbsp;</box>"+
"<box id='edit_box_top' class='trgg_edit_box_top trgg_edit_box'>&nbsp;</box>"+
"<box id='edit_box_bottom' class='trgg_edit_box_bottom trgg_edit_box'>&nbsp;</box>"+
"<box id='edit_box_right' class='trgg_edit_box_right trgg_edit_box'>&nbsp;</box>";
jq("body").append(boxes);
// jq("body").css("box-shadow", "inset 0px 0px 10px #800080");

// send message to the extension test
// var data = {"target":"msg_to_triggers", "data":{"id":triggers_ext_id, "msg": "oi"}};
// var destination = document.getElementById("triggers_init").contentWindow;
// destination.postMessage(data,'*');
