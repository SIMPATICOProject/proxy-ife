var selectedText = null;

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
	var value = source;
	var url = "api/proxy/textenrich?lex=0&text=" + value;
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
	var value = source;
	var url = "api/proxy/textenrich?lex=1&text=" + value;
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
	var url = "api/proxy/wikipedia?content=" + value;
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

function annotate(name)
{
  console.log("Annotate "+name);

  if (annotatedText[name] == undefined) { annotatedText[name] = "Add note"};
    
  jQuery.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']',
    function(baconGoodness)
    {
      console.log(JSON.stringify(baconGoodness));
      
    }
  );

  document.getElementById(name).innerHTML = document.getElementById(name).innerHTML +
  '<span id="annotateGroup'+name+'"><textarea id="annotate" rows="4" cols="50">'+annotatedText[name]+'</textarea><input type="button" value="Send" id="sendAnnotate" onclick="sendAnnotate(\''+name+'\');"></span>';
  document.getElementById("annotateSwitch").value="annotateOff";
}

function citizenpedia(name)
{
  console.log("Citizenpedia "+name);
  window.location.href = 'http://192.168.33.10:9000/questions/create';
}

function sendAnnotate(name)
{
  console.log("Send Annotate "+name);
  annotatedText[name] = document.getElementById("annotate").value;

  document.getElementById("annotateGroup"+name).style.display = "none";

}



