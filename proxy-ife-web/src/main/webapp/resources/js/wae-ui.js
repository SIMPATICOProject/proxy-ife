var waeUI = new function() {
	
	this.blockMap = {};
	var moduleUri = "http://simaptico.eu/test";
	var idProfile = "test";
	var moduleErrorMessage;
	var topBarHeight = 5;
	
	this.loadModel = function() {
		waeEngine.loadModel(moduleUri, idProfile, moduleLoaded, moduleLoadError);
	};
	
	function moduleLoaded(map) {
		this.blockMap = map;
		for(var key in map) {
			if(map.hasOwnProperty(key)) {
				showElement(key, "HIDE");
			}
		}
		waeEngine.nextBlock(doActions, moduleErrorMsg);
	};
	
	function moduleLoadError(text) {
		alert(text);
	};
	
	function showElement(simpaticoId, state) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			if(state == "SHOW") {
				element.fadeTo("fast", 1);
				//$(element).children().prop('disabled', false);
			} else if(state == "HIDE") {
				element.fadeTo("fast", 0.3);
				//$(element).children().prop('disabled', true);
			}
		}
	};
	
	function resetBlock(simpaticoId) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			var container = waeEngine.getSimpaticoContainer();
			if(container != null) {
				$(container).replaceWith(element);
			}
		}
	};
	
	function editBlock(simpaticoId) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			element.wrap("<div data-simpatico-id='simpatico_edit_block' class='block_edited'></div>" );
			var container = waeEngine.getSimpaticoContainer();
			if(container != null) {
				//add prev button
				if(waeEngine.getActualBlockIndex() > 0) {
					$(container).append(createPrevButton());
				}
				//add next button
				if(waeEngine.getActualBlockIndex() < (waeEngine.getBlocksNum() - 1)) {
					$(container).append(createNextButton());
				}
				//add error message
				$(container).append(createErrorMsg());
				var position = $(container).offset().top - topBarHeight;
				$('html, body').animate({scrollTop: position}, 200);
			}
		}
	};
	
	function doActions(actions) {
		moduleErrorMessage = "";
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "HIDE") {
				resetBlock(blockId);
				showElement(blockId, "HIDE");
			}
		}
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "SHOW") {
				showElement(blockId, "SHOW");
				editBlock(blockId);
				break;
			}
		}
	};
	
	function moduleErrorMsg(text) {
		moduleErrorMessage = text;
		var element = $("#div_simpatico_error_msg");
		if(element != null) {
			$(element).text(text);
		}
	};
	
	function createErrorMsg() {
		return $('<label/>', {
			text: '',
			id: 'div_simpatico_error_msg'
		});
	};

	function createNextButton() {
	  return $('<button/>', {
	  	type: 'button',
	    text: 'Prossimo',
	    class: 'ui-button ui-widget',
	    id: 'btn_simpatico_next'
	  }).click(nextBlock);
	};
	
	function nextBlock() {
		waeEngine.nextBlock(doActions, moduleErrorMsg)
	};

	function createPrevButton() {
	  return $('<button/>', {
	    type: 'button',
	  	text: 'Precedente',
	  	class: 'ui-button ui-widget',
	    id: 'btn_simpatico_prev'
	  }).click(prevBlock);
	};
	
	function prevBlock() {
		waeEngine.prevBlock(doActions, moduleErrorMsg);
	};
}