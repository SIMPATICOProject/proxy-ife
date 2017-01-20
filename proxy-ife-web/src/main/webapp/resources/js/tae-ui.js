$( function() {
	$(document).tooltip();
	
	taeUI.dialog_simplify = $("#dialog-simplify").dialog({
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
				if(taeUI.selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					taeEngine.getDefinitions(taeUI.selectedText, setInnerText, setError, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} if(ui.newPanel["0"].id == "tab-semplificazione") {
				if(taeUI.selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					taeEngine.getExplanations(taeUI.selectedText, setInnerText, setError, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} else if(ui.newPanel["0"].id == "tab-wikipedia") {
				if(taeUI.selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					taeEngine.wikipedia(taeUI.selectedText, setInnerText, setError, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			}
		},
		load:function( event, ui ) { 
  		/* After page load*/  
  	}		
	});
	
	function setInnerText(text, target) {
		document.getElementById(target).innerHTML = '<p>' + text + '</p>';
	}
	
	function setError(text, target) {
		document.getElementById(target).innerHTML = '<p>' + text + '</p>';
	}
	
});

var taeUI = new function() {
	this.selectedText = null;
	
	this.dialog_simplify = null;
	
	this.showDialog = function() {
		$("#tabs").tabs( "option", "active", 0);
		$("#tabs").tabs("option", "disabled", [] );
		this.selectedText = getSelectedText().trim();
		/*var splitArray = selectedText.split(" ");
		if(splitArray.length > 1) {
			$("#tabs").tabs("option", "disabled", [3] );
		}*/
		this.dialog_simplify.dialog("open");
		
	}
	
	function getSelectedText(){
		var text = "";
	  if (window.getSelection()) {
	      text = window.getSelection().toString();
	  } else if (document.selection && document.selection.type != "Control") {
	      text = document.selection.createRange().text;
	  }
	  return text;
	};		
};


