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
		return '<div id="editor" class="trgg_event_editor" style="top: '+top+'px; left: '+left+'px;">'+
			'<h5>Add event</h5>'+
			'<hr/>'+
			'<p>Trigger type</p>'+
			'<select>'+
				'<option value=”click”>Click</option>'+
				'<option value=”submit”>Submit</option>'+
				'<option value=”pageload”>PageLoad</option>'+
			'</select>'+
			'<p>Name</p>'+
			'<input type="text" name="Event name" />'+
			'<p>Event properties</p>'+
			'<input type="text" name="prop1_key" placeholder="Key" />'+
			'<input type="text" name="prop1_value" placeholder="Value"/>'+
			'<input type="button" class="editor_add_property" value="+ property" />'+
			'<hr/>'+
			'<input type="button" class="editor_close" value="Cancel" />'+
			'<input type="button" class="editor_save" value="Save" />'+
		'</div>';
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


	var page_edit_on = false;
	var target=null, fontcolor, bgcolor;
	var page_edit_status = "none", page_edit_change_status = "none";
	var page_edit_status_interval;
	var page_edit_elements = ["editor", "delete"];
	var page_edit_alowed_page_elements = ["button", "a"];

	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		page_edit_status_interval = setInterval(update_status, 10);

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

		jq(document).on("click", ".delete, .editor_delete", function(e){
			if(page_edit_on){
				console.log("delete");
				console.log("target", target);
				jq(target).remove();
				page_edit_change_status = "delete";
			}
		});
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
	}
}, 10);
// });