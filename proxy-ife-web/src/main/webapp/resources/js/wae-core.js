var waeEngine = new function() {
	
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
	var contextVar = {};
	
	function getActualBlockIndex() {
		return actualBlockIndex;
 	}; 	
	this.getActualBlockIndex = getActualBlockIndex;
	
	function getBlocksNum() {
		return workflowModel.blocks.length;
	}; 
	this.getBlocksNum = getBlocksNum;
	
	function getSimpaticoBlockElement(simpaticoId) {
		var element = $("[data-simpatico-block-id='" + simpaticoId + "'");
		return element;
	};
	this.getSimpaticoBlockElement = getSimpaticoBlockElement;

	function getSimpaticoFieldElement(simpaticoId) {
		var element = $("[data-simpatico-field-id='" + simpaticoId + "'");
		return element;
	};
	this.getSimpaticoFieldElement= getSimpaticoFieldElement;

	function getSimpaticoContainer() {
		var container = $("[data-simpatico-id='simpatico_edit_block'");
		return container;
	};
	this.getSimpaticoContainer = getSimpaticoContainer;

	function loadModel(uri, idProfile, callback, errorCallback) {
		var url = "api/wfe/model/page?uri=" + uri + "&idProfile=" + idProfile;
		$.getJSON(url)
	  .done(function(json) {
	  	workflowModel = json;
	  	for(item in json.blocks) {
	  		blockMap[json.blocks[item].id] = json.blocks[item];
	  	} 
	  	for(item in json.fields) {
	  		fieldMap[json.fields[item].id] = json.fields[item]; 
	  	}
	  	//console.log(JSON.stringify(json));
	  	initModule();
	  	callback(blockMap);
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	errorCallback(textStatus + ", " + error);
	  });
	};
	this.loadModel = loadModel;

	function evalBlockEdited(blockId) {
		var blockEdited = blockCompiledMap[blockId];
		return (blockEdited != null);
	};

	function evalContextVar(expression) {
		var context = contextVar;
		var result = eval(expression);
		return result;
	};

	function setActualBlock(index) {
		prevBlockId = actualBlockId;
		prevBlockIndex = actualBlockIndex;
		actualBlockIndex = index;
		actualBlockId = workflowModel.blocks[actualBlockIndex].id;
		moveToBlock = true;
	};

	function checkDependencies(block) {
		var result = true;
		if(block.dependencies) {
			for(var i = 0; i < block.dependencies.length; i++) {
				var blockId = block.dependencies[i];
				var completed = evalBlockEdited(blockId);
				if(!completed) {
					result = false;
					break;
				}
			}
		}
		return result;
	};

	function getNextBlock() {
		moveToBlock = false;
		for(var i = actualBlockIndex+1; i < workflowModel.blocks.length; i++) {
			var block = workflowModel.blocks[i];
			if(block.type == "CONTAINER") {
				continue;
			}
			if(!checkDependencies(block)) {
				continue;
			}
			if(block.condition) {
				if(!evalContextVar(block.condition)) {
					continue;
				}
			}
			setActualBlock(i);
			break;
		}
	};

	function getPrevBlock() {
		moveToBlock = false;
		for(var i = actualBlockIndex-1; i >= 0; i--) {
			var block = workflowModel.blocks[i];
			var rule = ruleMap[block.id];
			if(block.type == "CONTAINER") {
				continue;
			}
			if(!checkDependencies(block)) {
				continue;
			}
			if(block.condition) {
				if(!evalContextVar(block.condition)) {
					continue;
				}
			}
			setActualBlock(i);
			break;
		}
	};

	function initModule() {
		for(var i = 0; i < workflowModel.blocks.length; i++) {
			var block = workflowModel.blocks[i];
			var element = document.evaluate(block.xpath, document, null, 
					XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if(element != null) {
				//add id
				$(element).attr("data-simpatico-block-id", block.id);
				//hide element
				//showElement(block.id, "HIDE");
			}
		}
		for(var i = 0; i < workflowModel.fields.length; i++) {
			var field = workflowModel.fields[i];
			var element = document.evaluate(field.xpath, document, null, 
					XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if(element != null) {
				//add id
				$(element).attr("data-simpatico-field-id", field.id);
			}
		}
	};

	function setBlockVars(blockId) {
		var block = blockMap[blockId];
		if(block != null) {
			for(index in block.fields) {
				var fieldId = block.fields[index];
				var field = fieldMap[fieldId];
				if(field != null) {
					if(field.mapping.binding == "OUT" || field.mapping.binding == "INOUT") {
						var element = getSimpaticoFieldElement(field.id);
						if(element != null) {
							var value = getInputValue(element);
							if(value != null) {
								contextVar[field.mapping.key] = value;
							} else {
								delete contextVar[field.mapping.key];
							}
						}
					}
				}
			}
		}
	};

	function revertBlockVars(blockId) {
		var block = blockMap[blockId];
		if(block != null) {
			for(index in block.fields) {
				var fieldId = block.fields[index];
				var field = fieldMap[fieldId];
				if(field != null) {
					delete contextVar[field.mapping.key];
				}
			}
		}
	};

	function prevBlock(callback, errorCallback) {
		//TODO reset form?
		if(actualBlockId) {
			delete blockCompiledMap[actualBlockId];
			revertBlockVars(actualBlockId);
		}
		getPrevBlock();
		var actions = {};
		if(!moveToBlock) {
			callback(actions);
			return;
		}
		if(prevBlockId != null) {
			actions[prevBlockId] = "HIDE";
		}
		actions[actualBlockId] = "SHOW";
		callback(actions);
	};
	this.prevBlock = prevBlock;

	function nextBlock(callback, errorCallback) {
		if(actualBlockId) {
			setBlockVars(actualBlockId);
			if(isBlockCompleted(actualBlockId)) {
				blockCompiledMap[actualBlockId] = true;
			} else {
				delete blockCompiledMap[actualBlockId];
				revertBlockVars(actualBlockId);
				errorCallback(JSON.stringify(uncompletedFieldMap));
			}
		}
		getNextBlock();
		var actions = {};
		if(!moveToBlock) {
			callback(actions);
			return;
		}
		if(prevBlockId != null) {
			actions[prevBlockId] = "HIDE";
		}
		fillBlock();
		actions[actualBlockId] = "SHOW";
		callback(actions);
	};
	this.nextBlock = nextBlock;

	function fillBlock() {
		var block = blockMap[actualBlockId];
		if(block != null) {
			for(index in block.fields) {
				var fieldId = block.fields[index];
				var field = fieldMap[fieldId];
				if(field != null) {
					if(field.mapping.binding == "IN" || field.mapping.binding == "INOUT") {
						var value = contextVar[field.mapping.key];
						var element = this.getSimpaticoFieldElement(field.id);
						if(element != null) {
							setElementValue(element, value);
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
			if(block.completed) {
				var completedCondition = evalContextVar(block.completed);
				if(!completedCondition) {
					result = false;
					uncompletedFieldMap[blockId] = block.completed;
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
	
}