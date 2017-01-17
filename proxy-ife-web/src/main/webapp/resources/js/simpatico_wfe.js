var topBarHeight = 5;
var selectedText = null;
var workflowModel = null;
var actualBlockIndex = -1;
var prevBlockIndex = -1;
var actualBlockId = null;
var prevBlockId = null;
var moveToBlock = true;
var ruleMap = {};
var blockCompiledMap = {};
var blockMap = {};
var fieldMap = {};
var uncompletedFieldMap = {};

$( function() {
	$(document).tooltip();
	
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
		/*var splitArray = selectedText.split(" ");
		if(splitArray.length > 1) {
			$("#tabs").tabs("option", "disabled", [3] );
		}*/
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
	    	var originalText = value.substring(item.start, item.end);
	      annotatedText = annotatedText + 
	      ' <a class="simpatico-label" title="' + item.description.description + 
	      '">' + originalText +'</a> ';
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
		    	var originalText = value.substring(json.simplifications[item].start, json.simplifications[item].end);
	        annotatedText = annotatedText + value.substring(index, json.simplifications[item].start-1);
	        annotatedText = annotatedText + ' <a class="simpatico-label" title="' + json.simplifications[item].simplification + 
	        '">' + originalText +'</a> '
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

function compareLinkItem(a, b) {
	if(a.offset < b.offset) {
		return -1;
	} else if(a.offset > b.offset) {
		return 1;
	} else {
		if(a.score < b.score) {
			return -1;
		}
		if(a.score > b.score) {
			return 1;
		}
		return 0;
	}
}

function wikipedia(source, target) {
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=1&text=" + value;
	$.getJSON(url)
	  .done(function(json) {
	    var index = 0;
	    var annotatedText = "";
	    json.linkings.sort(compareLinkItem);
	    var actualOffset = -1;
	    var actualLinkItem = null;
	    for (itemName in json.linkings) {
	    	var item = json.linkings[itemName];
	    	if(actualOffset == -1) {
	    		actualOffset = item.offset;
	    	}
	    	if(item.offset > actualOffset) {
		    	annotatedText = annotatedText + value.substring(index, actualLinkItem.offset-1);
		    	var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
		      annotatedText = annotatedText + 
		      ' <a class="simpatico-label" target="_blank" href="' + actualLinkItem.page + 
		      '">' + originalText +'</a> ';
		      index = actualLinkItem.offset + actualLinkItem.length;
		      actualLinkItem = item;
		      actualOffset = item.offset;
	    	} else {
	    		actualLinkItem = item;
	    	}
	    }
	    if(actualLinkItem != null) {
	    	annotatedText = annotatedText + value.substring(index, actualLinkItem.offset-1);
	    	var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
	      annotatedText = annotatedText + 
	      ' <a class="simpatico-label" target="_blank" href="' + actualLinkItem.page + 
	      '">' + originalText +'</a> ';
	      index = actualLinkItem.offset + actualLinkItem.length;
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

function getSimpaticoBlockElement(simpaticoId) {
	var element = $("[data-simpatico-block-id='" + simpaticoId + "'");
	return element;
}

function getSimpaticoFieldElement(simpaticoId) {
	var element = $("[data-simpatico-field-id='" + simpaticoId + "'");
	return element;
}

function getSimpaticoContainer() {
	var container = $("[data-simpatico-id='simpatico_edit_block'");
	return container;
}

function loadModel() {
	var url = "api/wfe/model/page?uri=http://simaptico.eu/test&idProfile=test";
	$.getJSON(url)
  .done(function(json) {
  	workflowModel = json;
  	for(item in json.blocks) {
  		blockMap[json.blocks[item].id] = json.blocks[item];
  	} 
  	for(item in json.rules) {
  		ruleMap[json.rules[item].blockId] = json.rules[item];
  	}
  	for(item in json.fields) {
  		fieldMap[json.fields[item].id] = json.fields[item]; 
  	}
  	//console.log(JSON.stringify(json));
  	initModule();
  })
  .fail(function( jqxhr, textStatus, error) {
  	console.log(textStatus + ", " + error);
  	alert(textStatus + ", " + error);
  });
}

function evalBlockEdited(blockId) {
	var blockEdited = blockCompiledMap[blockId];
	return (blockEdited != null);
}

function evalContextVar(expression) {
	var context = workflowModel.context;
	var result = eval(expression);
	return result;
}

function evaluateCondition(condition) {
	if(condition.type == "BLOCK") {
		return evalBlockEdited(condition.value);
	}
	if(condition.type == "VAR") {
		return evalContextVar(condition.value);
	}
	return false;
}

function setActualBlock(index) {
	prevBlockId = actualBlockId;
	prevBlockIndex = actualBlockIndex;
	actualBlockIndex = index;
	actualBlockId = workflowModel.blocks[actualBlockIndex].id;
	moveToBlock = true;
}

function getNextBlock() {
	moveToBlock = false;
	for(i = actualBlockIndex+1; i < workflowModel.blocks.length; i++) {
		var block = workflowModel.blocks[i];
		var rule = ruleMap[block.id];
		if(block.type == "CONTAINER") {
			continue;
		}
		if(rule.conditions) {
			var eligible = true;
			for(j = 0; j < rule.conditions.length; j++) {
				var condition = rule.conditions[j];
				if(!evaluateCondition(condition)) {
					eligible = false;
					break;
				}
			}
			if(eligible) {
				setActualBlock(i);
				break;
			}
		} else {
			setActualBlock(i);
			break;
		}
	}
}

function getPrevBlock() {
	moveToBlock = false;
	for(i = actualBlockIndex-1; i >= 0; i--) {
		var block = workflowModel.blocks[i];
		var rule = ruleMap[block.id];
		if(block.type == "CONTAINER") {
			continue;
		}
		if(rule.conditions) {
			var eligible = true;
			for(j = 0; j < rule.conditions.length; j++) {
				var condition = rule.conditions[j];
				if(!evaluateCondition(condition)) {
					eligible = false;
					break;
				}
			}
			if(eligible) {
				setActualBlock(i);
				break;
			}
		} else {
			setActualBlock(i);
			break;
		}
	}
}

function initModule() {
	for (i = 0; i < workflowModel.blocks.length; i++) {
		var block = workflowModel.blocks[i];
		var rule = ruleMap[block.id];
		var element = document.evaluate(block.xpath, document, null, 
				XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if(element != null) {
			//add id
			$(element).attr("data-simpatico-block-id", block.id);
			if(rule.conditions) {
				showElement(block.id, rule.initialState);
			} else {
				showElement(block.id, rule.initialState);
			}
		}
	}
	for (i = 0; i < workflowModel.fields.length; i++) {
		var field = workflowModel.fields[i];
		var element = document.evaluate(field.xpath, document, null, 
				XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if(element != null) {
			//add id
			$(element).attr("data-simpatico-field-id", field.id);
		}
	}
	nextBlock();
}

function showElement(simpaticoId, state) {
	//TODO enable/disable input flieds?
	var element = getSimpaticoBlockElement(simpaticoId);
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
	var element = getSimpaticoBlockElement(simpaticoId);
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
			//add error message
			$(container).append(createErrorMsg(uncompletedFieldMap));
			var position = $(container).offset().top - topBarHeight;
			$('html, body').animate({scrollTop: position}, 200);
		}
	}
}

function resetBlock(simpaticoId) {
	var element = getSimpaticoBlockElement(simpaticoId);
	if(element != null) {
		var container = getSimpaticoContainer();
		if(container != null) {
			$(container).replaceWith(element);
		}
	}
}

function setBlockVars(blockId) {
	var block = blockMap[blockId];
	if(block != null) {
		for(index in block.fields) {
			var fieldId = block.fields[index];
			var field = fieldMap[fieldId];
			if(field != null) {
				if(field.mapping.type == "CONTEXT") {
					workflowModel.context[field.mapping.key] = eval(field.mapping.value);
				} else if(field.mapping.type == "FIELD") {
					if(field.mapping.binding == "VAR") {
						var element = getSimpaticoFieldElement(field.id);
						if(element != null) {
							var value = getInputValue(element);
							if(value != null) {
								workflowModel.context[field.mapping.key] = value;
							} else {
								delete workflowModel.context[field.mapping.key];
							}
						}
					}
				}
			}
		}
	}
}

function revertBlockVars(blockId) {
	var block = blockMap[blockId];
	if(block != null) {
		for(index in block.fields) {
			var fieldId = block.fields[index];
			var field = fieldMap[fieldId];
			if(field != null) {
				if(field.mapping.type == "CONTEXT") {
					delete workflowModel.context[field.mapping.key];
				} else if(field.mapping.type == "FIELD") {
					if(field.mapping.binding == "VAR") {
						//TODO reset input value?
						delete workflowModel.context[field.mapping.key];
					}
				}
			}
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

function createErrorMsg(obj) {
	return $('<label/>', {
		text: '',
		id: 'div_simpatico_error_msg'
	});
}

function setErrorMsg(obj) {
	var element = $("#div_simpatico_error_msg");
	if(element != null) {
		$(element).text(JSON.stringify(obj));
	}
}

function prevBlock() {
	//TODO reset form?
	if(actualBlockId) {
		delete blockCompiledMap[actualBlockId];
		revertBlockVars(actualBlockId);
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
	if(actualBlockId) {
		if(isBlockCompleted(actualBlockId)) {
			blockCompiledMap[actualBlockId] = true;
			setBlockVars(actualBlockId);
		} else {
			delete blockCompiledMap[actualBlockId];
			setErrorMsg(uncompletedFieldMap);
		}
	}
	getNextBlock();
	if(!moveToBlock) {
		return;
	}
	if(prevBlockId != null) {
		showElement(prevBlockId, "HIDE");
		resetBlock(prevBlockId);
	}
	fillBlock();
	showElement(actualBlockId, "SHOW");
	editBlock(actualBlockId);
}

function fillBlock() {
	var block = blockMap[actualBlockId];
	if(block != null) {
		for(index in block.fields) {
			var fieldId = block.fields[index];
			var field = fieldMap[fieldId];
			if(field != null) {
				if((field.mapping.type == "FIELD") && 
						(field.mapping.binding == "IN" || field.mapping.binding == "INOUT")) {
					//TODO get value from external source
					var value = null;
					var element = getSimpaticoFieldElement(field.id);
					if(element != null) {
						//setElementValue(element, value);
						//workflowModel.context[field.mapping.key] = value;
					}
				}
			}
		}
	}
}

function isBlockCompleted(blockId) {
	uncompletedFieldMap = {};
	var result = true;
	var block = blockMap[blockId];
	if(block != null) {
		for(index in block.fields) {
			var fieldId = block.fields[index];
			var field = fieldMap[fieldId];
			if(field != null) {
				if(field.required) {
					var element = getSimpaticoFieldElement(field.id);
					if(element != null) {
						var value = getInputValue(element);
						if((value == null) || (value == "")) {
							result = false;
							uncompletedFieldMap[field.id] = field;
						}
					}
				}
			}
		}
	}
	return result;
} 

function getInputValue(element) {
	//TODO get input value
	if($(element).is(':checkbox')) {
		if($(element).is(':checked')) {
			return $(element).val();
		}
	} else {
		return $(element).val();
	}
	return null;
}

function setElementValue(element, value) {
	$(element).val(value);
}
