var topBarHeight = 5;
var selectedText = null;
var workflowModel = null;
var actualBlockIndex = -1;
var prevBlockIndex = -1;
var actualBlockId = null;
var prevBlockId = null;
var moveToBlock = true;
var dependencyMap = {};
var editedMap = {};

$( function() {
	var dialog_simplify = $("#dialog-simplify").dialog({
		autoOpen: false,
	  modal: true,
	  resizable: true,
    height: "auto",
    width: 600,	  
	  buttons: {
	  	close: function() {
	  		$(this).dialog( "close" );
	    }
	  }
	});
	
	$("#tabs").tabs({
		beforeActivate: function( event, ui ) {
			if(ui.newPanel["0"].id == "tab-definizioni") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					definizioni(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} if(ui.newPanel["0"].id == "tab-semplificazione") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					semplificazione(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} else if(ui.newPanel["0"].id == "tab-wikipedia") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					wikipedia(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			}
		},
		load:function( event, ui ) { 
  		/* After page load*/  
  	}		
	});
	
	$("#open-dialog").on("click", function() {
		$("#tabs").tabs( "option", "active", 0);
		$("#tabs").tabs("option", "disabled", [] );
		selectedText = getSelectedText().trim();
		var splitArray = selectedText.split(" ");
		if(splitArray.length > 1) {
			$("#tabs").tabs("option", "disabled", [3] );
		}
		dialog_simplify.dialog("open");
	});
	
	$("#start-engine").on("click", function() {
		loadModel();
	});
	
	var initUserData = function() {
		var data = JSON.parse(localStorage.userData || 'null');
		if (!!data) {
			$("#userdata").show();
			$("#access").hide();
			$("#userdata").text(data.name + ' '+ data.surname);
		} else {
			$("#access").show();
			$("#userdata").hide();
		}
	}
	initUserData();
	
	$("#access").on("click", function() {
    var aacBase = 'https://tn.smartcommunitylab.it/aac';
		var base = window.location.href;
    var arr = base.split("/");
    var redirect = arr[0]+'//'+arr[2]+'/ife/callback';
    var authority = 'google';
//    	var authority = 'adc';

		var url = aacBase + '/eauth/authorize/'+authority+'?response_type=code&'
		+ 'redirect_uri='+redirect+'&client_id=8ab03990-d5dd-47ea-8fc6-c92a3b0c04a4';
        var win = window.open(url, 'AuthPopup', 'width=1024,height=768,resizable=true,scrollbars=true,status=true');
        window.addEventListener('message', function (event) {
        	$.ajax({
                url: '/ife/userapi/profile',
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                	localStorage.userData = JSON.stringify(data);
        			initUserData();
                },
                error: function(err) { 
                	console.log(err);
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + event.data.access_token);
                }
              });
        	localStorage.aacTokenData = JSON.stringify(event.data);
            
        }, false);

	});
});

function getSelectedText(){
	var text = "";
  if (window.getSelection()) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
};

var annotatedText = [];


function definizioni(source, target) {
  //var value = document.getElementById(source).innerText;
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=0&text=" + value;
  //$.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']')
	$.getJSON(url)
	  .done(function(json) {
	    //console.log(JSON.stringify(baconGoodness));
	    var index = 0;
	    var annotatedText = "";
	    for (itemName in json.readability.forms) {
	    	item = json.readability.forms[itemName];
	    	annotatedText = annotatedText + value.substring(index, item.start-1);
	      annotatedText = annotatedText + ' <a  title="' + item.description.description + 
	      '" style="background-color:#FFFFFF;color:#000000;text-decoration:underline">' + 
	      value.substring(item.start, item.end) +'</a> '
	      index = item.end;
	    }
	    annotatedText = annotatedText + value.substring(index, value.length);
	    //console.log('annotatedText ' + annotatedText);
	    document.getElementById(target).innerHTML = '<p>' + annotatedText + '</p>';
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
}

function semplificazione(source, target) {
  //var value = document.getElementById(source).innerText;
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=1&text=" + value;
  //$.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']')
	$.getJSON(url)
	  .done(function(json) {
	    //console.log(JSON.stringify(baconGoodness));
	    var index = 0;
	    var annotatedText = "";
	    if(json.simplifications) {
	    	//console.log(JSON.stringify(json.simplifications));
		    for (item in json.simplifications) {
	        annotatedText = annotatedText + value.substring(index, json.simplifications[item].start-1);
	        annotatedText = annotatedText + ' <a  title="' + json.simplifications[item].simplification + 
	        '" style="background-color:#FFFFFF;color:#000000;text-decoration:underline">' + 
	        value.substring(json.simplifications[item].start, json.simplifications[item].end) +'</a> '
	        index = json.simplifications[item].end;
		    }
		    annotatedText = annotatedText + value.substring(index, value.length);
		    document.getElementById(target).innerHTML = '<p>' + annotatedText + '</p>';
	    } else {
	    	document.getElementById(target).innerHTML = '<p>' + source + '</p>';
	    } 
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
}

function wikipedia(source, target) {
	var value = source;
	var url = "/ife/api/proxy/wikipedia?content=" + value;
	$.getJSON(url)
	  .done(function(json) {
	    //console.log(JSON.stringify(baconGoodness));
	  	if(json.error) {
		  	console.log(json.error.code + ", " + json.error.info);
		  	document.getElementById(target).innerHTML = '<p>Termine non identificato</p>';
	  	} else {
	  		var annotatedText = json.parse.text['*'];
	  		//console.log('annotatedText ' + annotatedText);
	  		document.getElementById(target).innerHTML = annotatedText;
	  	}
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
}

function getSimpaticoElement(simpaticoId) {
	var element = $("[data-simpatico-id='" + simpaticoId + "'");
	return element;
}

function getSimpaticoContainer() {
	var container = $("[data-simpatico-id='simpatico_edit_block'");
	return container;
}

function loadModel() {
	var url = "model.json";
	$.getJSON(url)
  .done(function(json) {
  	workflowModel = json;
  	for(item in json.rules) {
  		dependencyMap[json.rules[item].blockId] = json.rules[item];
  	}
  	//console.log(JSON.stringify(json));
  	initModule();
  })
  .fail(function( jqxhr, textStatus, error) {
  	console.log(textStatus + ", " + error);
  	alert(textStatus + ", " + error);
  });
}

function evalFormVar(elementId) {
	var element = $("#" + elementId);
	if(element != null) {
		//TODO check generic input field value
		return $(element).is(':checked');
	} else {
		return false;
	} 
}

function evalBlockEdited(blockId) {
	var blockEdited = editedMap[blockId];
	return (blockEdited != null);
}

function evalContextVar(expression) {
	//TODO evaluate expression on context variables
	var context = workflowModel.context;
	var result = eval(expression);
	return result;
}

function getNextBlock() {
	moveToBlock = false;
	for(i = actualBlockIndex+1; i < workflowModel.blocks.length; i++) {
		var block = workflowModel.blocks[i];
		var rule = dependencyMap[block.id];
		if(rule.conditions) {
			var eligible = true;
			for(j = 0; j < rule.conditions.length; j++) {
				var condition = rule.conditions[j];
				if(condition.type == "block") {
					if(!evalBlockEdited(condition.value)) {
						eligible = false;
						break;
					}
				} else if(condition.type == "form_var") {
					if(!evalFormVar(condition.value)) {
						eligible = false;
						break;
					}
				} else if(condition.type == "context_var") {
					var result = evalContextVar(condition.value);
					if(!result) {
						eligible = false;
						break;
					}
				}
			}
			if(eligible) {
				prevBlockId = actualBlockId;
				prevBlockIndex = actualBlockIndex;
				actualBlockIndex = i;
				actualBlockId = workflowModel.blocks[actualBlockIndex].id;
				moveToBlock = true;
				break;
			}
		} else {
			prevBlockId = actualBlockId;
			prevBlockIndex = actualBlockIndex;
			actualBlockIndex = i;
			actualBlockId = workflowModel.blocks[actualBlockIndex].id;
			moveToBlock = true;
			break;
		}
	}
}

function getPrevBlock() {
	moveToBlock = false;
	for(i = actualBlockIndex-1; i >= 0; i--) {
		var block = workflowModel.blocks[i];
		var rule = dependencyMap[block.id];
		if(rule.conditions) {
			var eligible = true;
			for(j = 0; j < rule.conditions.length; j++) {
				var condition = rule.conditions[j];
				if(condition.type == "block") {
					if(!evalBlockEdited(condition.value)) {
						eligible = false;
						break;
					}
				} else if(condition.type == "form_var") {
					if(!evalFormVar(condition.value)) {
						eligible = false;
						break;
					}
				} else if(condition.type == "context_var") {
					var result = evalContextVar(condition.value);
					if(!result) {
						eligible = false;
						break;
					}
				}
			}
			if(eligible) {
				prevBlockId = actualBlockId;
				prevBlockIndex = actualBlockIndex;
				actualBlockIndex = i;
				actualBlockId = workflowModel.blocks[actualBlockIndex].id;
				moveToBlock = true;
				break;
			}
		} else {
			prevBlockId = actualBlockId;
			prevBlockIndex = actualBlockIndex;
			actualBlockIndex = i;
			actualBlockId = workflowModel.blocks[actualBlockIndex].id;
			moveToBlock = true;
			break;
		}
	}
}

function initModule() {
	for (i = 0; i < workflowModel.blocks.length; i++) {
		var block = workflowModel.blocks[i];
		var rule = dependencyMap[block.id];
		var element = document.evaluate(block.xpath, document, null, 
				XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if(element != null) {
			//add id
			$(element).attr("data-simpatico-id", block.id);
			if(rule.conditions) {
				//TODO evaluate conditions
				showElement(block.id, rule.initialState);
			} else {
				showElement(block.id, rule.initialState);
			}
		}
	}
	nextBlock();
}

function showElement(simpaticoId, state) {
	//TODO enable/disable input flieds
	var element = getSimpaticoElement(simpaticoId);
	if(element != null) {
		if(state == "SHOW") {
			element.fadeTo("fast", 1);
			//$(element).children().prop('disabled', false);
		} else if(state == "HIDE") {
			element.fadeTo("fast", 0.3);
			//$(element).children().prop('disabled', true);
		}
	}
}

function editBlock(simpaticoId) {
	var element = getSimpaticoElement(simpaticoId);
	if(element != null) {
		element.wrap("<div data-simpatico-id='simpatico_edit_block' class='block_edited'></div>" );
		var container = getSimpaticoContainer();
		if(container != null) {
			//add prev button
			if(actualBlockIndex > 0) {
				$(container).append(createPrevButton());
			}
			//add next button
			if(actualBlockIndex < (workflowModel.blocks.length - 1)) {
				$(container).append(createNextButton());
			}
			var position = $(container).offset().top - topBarHeight;
			$('html, body').animate({scrollTop: position}, 200);
		}
	}
}

function resetBlock(simpaticoId) {
	var element = getSimpaticoElement(simpaticoId);
	if(element != null) {
		var container = getSimpaticoContainer();
		if(container != null) {
			$(container).replaceWith(element);
		}
	}
}

function doAction(blockId) {
	var rule = dependencyMap[blockId];
	if((rule != null) && (rule.action)) {
		if(rule.action.type == "context_var") {
			workflowModel.context[rule.action.key] = eval(rule.action.value);
		}
	}
}

function revertAction(blockId) {
	var rule = dependencyMap[blockId];
	if((rule != null) && (rule.action)) {
		if(rule.action.type == "context_var") {
			delete workflowModel.context[rule.action.key];
		}
	}
}

function createNextButton() {
  return $('<button/>', {
  	type: 'button',
    text: 'Prossimo',
    class: 'ui-button ui-widget',
    id: 'btn_simpatico_next'
  }).click(nextBlock);
}

function createPrevButton() {
  return $('<button/>', {
    type: 'button',
  	text: 'Precedente',
  	class: 'ui-button ui-widget',
    id: 'btn_simpatico_prev'
  }).click(prevBlock);
}

function prevBlock() {
	//TODO reset form
	if(actualBlockId) {
		delete editedMap[actualBlockId];
		revertAction(actualBlockId);
	}
	getPrevBlock();
	if(!moveToBlock) {
		return;
	}
	if(prevBlockId != null) {
		showElement(prevBlockId, "HIDE");
		resetBlock(prevBlockId);
	}
	showElement(actualBlockId, "SHOW");
	editBlock(actualBlockId);
}

function nextBlock() {
	//TODO check form complited
	if(actualBlockId) {
		editedMap[actualBlockId] = true;
		doAction(actualBlockId);
	}
	getNextBlock();
	if(!moveToBlock) {
		return;
	}
	if(prevBlockId != null) {
		showElement(prevBlockId, "HIDE");
		resetBlock(prevBlockId);
	}
	showElement(actualBlockId, "SHOW");
	editBlock(actualBlockId);
}


