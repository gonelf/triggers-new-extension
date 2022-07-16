// chrome.extension.sendMessage({}, function(response) {
	// var readyStateCheckInterval = setInterval(function() {
var jq = jQuery.noConflict();

	function rgb2hex(rgb){
	 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	 return (rgb && rgb.length === 4) ? "#" +
	  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	}

	function doUndo(){
	  document.execCommand('undo', false, null);
	}

	function doRedo(){
	  document.execCommand('redo', false, null);
	}

	function create_delete(top, right, target){
		top-=17;
		right-=8;
		// console.log(browser.runtime.getURL("src/inject/img/delete.png"));
		return '<div id="delete" class="delete" style="top: '+top+'px; left: '+right+'px;"><img class="del" src="'+icon_delete+'" /></div>';
	}

	function create_event_editor(top, left, width=0) {
		property_count = 1;
		return `
		<div id="editor" class="trgg_event_editor" style="top: ${top}px; left: ${left}px;">
			<div class="trgg_editor_header">
				<div style="float: left">
					<h5 id"editor_title" class="editor_title">Add event</h5>
				</div>
				<div style="float: right">
					<input type="button" class="editor_close" value="Close" />
				</div>
			</div>
			<hr/>
			<p>Trigger type</p>
			<form id="editor_form">
				<select name="trigger" id="editor_trigger">
					<option value="click">Click</option>
					<option value="submit">Submit</option>
					<option value="pageload">PageLoad</option>
				</select>
				<p>Name</p>
				<input type="text" name="name" id="editor_name" />
				<p>Event properties</p>
				<div id="editor_event_properties">
					<input type="text" id="prop0_key" name="prop0_key" placeholder="Key" />
					<input type="text" id="prop0_value" name="prop0_value" placeholder="Value"/>
					<input type="button" class="editor_add_property" value="+ property" />
				</div>
				<p>Location</p>
			 	<select name="page" id="editor_page">
					<option value="this">This page</option>
					<option value="any">Any page</option>
				</select>
				<hr/>
				<input type="button" class="editor_delete" value="Delete" />
				<input type="button" class="editor_save" value="Save" />
				<input type="button" class="editor_update" value="Update" />
				<input type="hidden" class="editor_event_id" value="" />
			</form>
		</div>`;
	}

	var property_count = 1;

	function add_event_property(){
		// jq(".editor_add_property").remove();
		let property = `
		<div>
			<input type="text" id="prop${property_count}_key" name="prop${property_count}_key" placeholder="Key" />
			<input type="text" id="prop${property_count}_value" name="prop${property_count}_value" placeholder="Value"/>
			<input type="button" class="remove_property" value="delete" />
		</div>`;
		jq("#editor_event_properties").append(property);
		property_count+=1;
	}

	function clean(){
		console.log("clean");
		jq("#editor").remove();
		// jq(".delete").remove();
		if(jq(target) && target!=null){
			jq(target).attr("contenteditable", false);
			jq(target).removeClass("select");
			target = null;
		}
	}

	function update_status(){
		switch (page_edit_change_status) {
			case "none":

				break;
			case "element":

				break;
			case "new_element":
				console.log("new_element");
				clean();
				page_edit_status = "element"
				break;
			case "unfocus":
				jq("#editor").remove();
				clean();
				break;
			case "menu":

				break;
			case "delete":
				console.log("delete");
				clean();
				jq("#editor").remove();
				page_edit_status = "none";
				break;
		}
		page_edit_change_status = "none";
	}

	function getPathTo(element) {
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element===document.body)
        return "HTML/"+element.tagName;

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];

        if (sibling===element)
            return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
	}

	function update_event(data){
		console.log("upddate event data");
		console.log(data);
		trigger_page_events.forEach((event, i) => {
			if (event.UID === data.UID) {
				trigger_page_events[i] = data;
			}
		});
	}

	function add_event(data){
		console.log("add event");
		console.log(data);
		jq(target).addClass("trigger_event");
		jq(target).addClass("trigger_identify_events");
		jq(target).attr("trigger_event_count", trigger_page_events.length)
		trigger_page_events.push(data);
	}

	function delete_event(data){
		console.log("delete event");
		console.log(data);
		jq(target).removeClass("trigger_event");
		jq(target).removeClass("trigger_identify_events");
		jq(target).removeAttr("trigger_event_count");

		trigger_page_events.forEach((event, i) => {
			if (event.UID === data.UID) {
				delete trigger_page_events[i];
			}
		});
	}


	function arrayContains(needle, arrhaystack)
	{
	    return (arrhaystack.indexOf(needle) > -1);
	}

	var page_edit_on = false;
	var target=null, fontcolor, bgcolor, target_infos;
	var page_edit_status = "none", page_edit_change_status = "none";
	var page_edit_status_interval;
	var page_edit_elements = ["editor", "delete"];
	var page_edit_alowed_page_elements = ["button", "a"];


	let allowed_actions = ["save", "update", "delete", "update_event_list"];

	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		// jq( "form" ).on( "submit", function( event ) {
		//   event.preventDefault();
		//   // console.log( $( this ).serialize() );
		// });

		page_edit_status_interval = setInterval(update_status, 10);
		// get messa from content script
		window.addEventListener("message", function(event){
			console.log("content inject");
			console.log(event.data.action);
			if(event.data.type
		    && (event.data.type == "TO_PAGE")
		    // && (event.data.action === "save" || event.data.action === "update" ||
				// 		event.data.action === "delete" || event.data.action === "update_event_list")
				&& arrayContains(event.data.action, allowed_actions)
		    && typeof chrome.app.isInstalled !== 'undefined'){
					let resp = event.data.data;

					if (resp.status === true){
						if (event.data.action === "save"){
							add_event(resp.data[0])
							toastr.success(resp.message);
						}
						if (event.data.action === "update") {
							update_event(resp.data[0]);

							toastr.success(resp.message);
						}
						if (event.data.action === "delete") {
							delete_event(resp.data[0]);

							toastr.success(resp.message);
						}
						if (event.data.action === "update_event_list") {
							console.log(jq("#event_tracker"));
							if(jq("#event_tracker")){
								jq("#event_tracker_container").html("");
								let list = JSON.parse(resp.data);
								console.log(list);
								list.reverse().forEach((item, i) => {
									let event_view = `<div class="tracker_item">
										<p>#${list.length-i}</p>
										<div><b>Name: </b>${item.name}</div>
										<div><b>Trigger:</b> ${item.trigger}</div>
										<div><b>Properties</b></div>
										<div>${JSON.stringify(item.properties)}</div>
									</div>`
									jq("#event_tracker_container").append(event_view);
								});
							}
 						}

		      }

		      if (resp.status === false){
						toastr.warning(resp.message);
		      }

					clean();
		    }
		}, false);

		jq(document).on("click", "button, a", function(e){
			//e.preventDefault();
			id = e.target.id;
			tag = jq(e.target)[0].nodeName.toLowerCase();


			// console.log("page_edit_on", page_edit_on);
			// console.log("e.target.id", id);
			// console.log("e.target", tag);
			// console.log("page_edit_elements", page_edit_elements.includes(e.target.id));

			if(page_edit_on && !page_edit_elements.includes(id) && page_edit_alowed_page_elements.includes(tag)) {

				console.log("click select");

				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();
				page_edit_change_status = "new_element";
				update_status();

				var top = jq(this).offset().top;
				var left = jq(this).offset().left;
				var width = jq(this).outerWidth();
				var height = jq(this).outerHeight();
				var margin = 10;
				jq(this).addClass("select");
				target = this;
				// jq("body").append(create_delete(top, left+width));
				jq("body").append(create_event_editor(top+height+margin, left, width));
				if (jq(this).attr("trigger_event_count")) {
					target_infos = trigger_page_events[jq(this).attr("trigger_event_count")];
					console.log(target_infos);
					jq(".editor_title").text("Edit event");
					jq("#editor_trigger").val(target_infos.trigger);
					jq("#editor_name").val(target_infos.name);
					var prop_keys = Object.keys(target_infos.properties);
					prop_keys.forEach((key, i) => {
						if (i>0) add_event_property();
						jq(`#prop${i}_key`).val(key)
						jq(`#prop${i}_value`).val(target_infos.properties[key])
					});
					console.log(target_infos.page);
					jq("#editor_page").val("this")
					if(target_infos.page === "any") {jq("#editor_page").val("any")}
					jq(".editor_save").hide();
					jq(".editor_update").show();
					jq(".editor_event_id").val(target_infos.UID);

				}
				// jq("body").append(create_editor(0, 0, width));
				// jq(this).attr("contenteditable", true);
				// jq(this).focus();
				// console.log("this", this);
				return false;
			}
		});

		// jq(document).on("focusout", ".select", function(e){
		// 	if(page_edit_on){
		//
		// 		console.log("focusout");
		// 		page_edit_change_status = "unfocus";
		// 		update_status();
		// 	}
		// });
		//
		// jq(document).on("click", ".delete, .editor_delete", function(e){
		// 	if(page_edit_on){
		// 		console.log("delete");
		// 		console.log("target", target);
		// 		jq(target).remove();
		// 		page_edit_change_status = "delete";
		// 	}
		// });
		// font colorpicker
		jq(document).on("input", ".font-colorpicker", function(e){
			if(page_edit_on){

				console.log("colorpicker change");
				var newcolor = e.target.value;
				console.log(newcolor);
				jq(target).css("color", newcolor);
			}
		});

		jq(document).on("change", ".font-colorpicker", function(e){
			if(page_edit_on){

				console.log("colorpicker close");
				jq(target).focus();
			}
		});
		// bg colorpicker
		jq(document).on("input", ".bg-colorpicker", function(e){
			if(page_edit_on){

				console.log("bg-colorpicker change");
				var newcolor = e.target.value;
				console.log(newcolor);
				jq(target).css("background-color", newcolor);
			}
		});

		jq(document).on("change", ".bg-colorpicker", function(e){
			if(page_edit_on){

				console.log("bg-colorpicker close");
				jq(target).focus();
			}
		});

		jq(document).on("input", ".editor_link", function(e){
			if(page_edit_on){
				console.log("link change");
				link = jq("#editor_link")[0].value;
				jq(target).attr("href", link);
			}
		});

		jq(document).on("click", ".editor_clone_item", function(e){
			if(page_edit_on){
				console.log("clone click");
				console.log(target, "'"+copy+"'");
				var copy = jq(target).clone();
				jq(copy).attr("contenteditable", false);
				jq(copy).removeClass("select");
				jq(copy).insertAfter(jq(target));
			}
		});

		jq(document).on("click", ".editor_close", function(e){
			if(page_edit_on){
				console.log("editor close");
				page_edit_change_status = "unfocus";
				update_status();
			}
		});

		jq(document).on("click", ".editor_undo", function(e){
			if(page_edit_on){
				console.log("editor undo");
				doUndo();
			}
		});

		jq(document).on("click", ".editor_save", function(e){
			if(page_edit_on){
				console.log("editor save");
				var trigger = jq("#editor_trigger").val();
				var name = jq("#editor_name").val();
				var xpath = getPathTo(target);
				var props = jq("#editor_event_properties :text");
				var properties = {};
				for (var i = 0; i < props.length; i+=2) {
					properties[props[i].value] = props[i+1].value;
				}
				var page = jq("#editor_page").val();
				if(page === "this") page = window.location.href.split("?")[0]
				console.log();
				// send message to content_script
				var data = {xpath: xpath, name: name, trigger: trigger, properties: properties, page: page}
				// console.log(data);
				window.postMessage({ type: "FROM_PAGE", action: "save", data: data });
			}
		});

		jq(document).on("click", ".editor_update", function(e){
			if(page_edit_on){
				console.log("editor update");
				var trigger = jq("#editor_trigger").val();
				var name = jq("#editor_name").val();
				var xpath = getPathTo(target);
				var props = jq("#editor_event_properties :text");
				var properties = {};
				for (var i = 0; i < props.length; i+=2) {
					properties[props[i].value] = props[i+1].value;
				}
				var page = jq("#editor_page").val();
				if(page === "this") page = window.location.href.split("?")[0]
				var UID = jq(".editor_event_id").val();

				// send message to content_script
				var data = {xpath: xpath, name: name, trigger: trigger, properties: properties, page: page, UID: UID}
				// console.log(data);
				window.postMessage({ type: "FROM_PAGE", action: "update", data: data });
			}
		});

		jq(document).on("click", ".editor_delete", function(e){
			if(page_edit_on){
				console.log("editor delete");
				var r = confirm("Are you sure you want to delete this event?");
				if (r === true) {
					var UID = jq(".editor_event_id").val();

					// send message to content_script
					var data = {UID: UID}
					// console.log(data);
					window.postMessage({ type: "FROM_PAGE", action: "delete", data: data });
				} else {
				  // txt = "You pressed Cancel!";
				}
			}
		});

		jq(document).on("click", "#stop_live_tracker", function(e) {
			if(evtnr_live_on){
				window.postMessage({ type: "FROM_PAGE", action: "stop_live_tracker" });
			}
		});
		jq(document).on("click", "#clear_live_tracker", function(e) {
			if(evtnr_live_on){
				window.postMessage({ type: "FROM_PAGE", action: "clear_live_tracker" });
			}
		});
		jq(document).on("click", ".editor_add_property", function(e){
			add_event_property();
		})
	}
}, 10);
// });
