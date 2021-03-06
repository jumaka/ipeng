// global.js
// these functions should be generic across all pages that use ajax requests
// the url var needs to be initialized in the page specific javascript file
// and this script is called by a PROCESS global.js

// myGlobalHandlers allows for an element (typically a div) called systemWorking to 
// appear whenever an ajax request is in progress. Look at Nokia770/pageheader.html for
// an example
var inhibitSW;

removeSW = function () {
	if ($('systemWorking')) {
		Element.hide('systemWorking');
		Element.hide('SWbg');
	}
};

var myGlobalHandlers = {
	onCreate: function(request){
		if (!inhibitSW) {
			if ($('systemWorking')) {
				// this causes spinner.gif to start at beginning of animation
				if ($('spinner')) {
					$('spinner').src = webroot + "html/images/spinner_big.gif";
				}
				
				$('SWbg').style.top = window.pageYOffset + 140;
				Element.show('SWbg');
				$('systemWorking').style.top = window.pageYOffset + 140;
				Element.show('systemWorking');
			};
		};
		request['timeoutId'] = window.setTimeout (
				function() {
				if (callInProgress(request.transport)) {
					request.transport.abort();
					Ajax.activeRequestCount--;
					if(Ajax.activeRequestCount == 0)
						removeSW();

					if (request.options['onFailure']) {
						request.options['onFailure'](request.transport, request.json);
					}
				}
			}, 60*1000
		);
	},
	onComplete: function() {
		if(Ajax.activeRequestCount == 0)
			removeSW();
		window.clearTimeout(request['timeoutId']);
	},
	onException: function() {
		removeSW();
	},
};
Ajax.Responders.register(myGlobalHandlers);


function callInProgress (xmlhttp) {
	switch (xmlhttp.readyState) {

		case 1: case 2: case 3:
		return true;
		break;
	
	// Case 4 and 0

	default:
		return false;
		break;
	}
}

// getStatusData
// params is a list of args to send to url
// action is the function to be called after the ajaxRequest.txt file is spit back
function getStatusData(params, action) {
	ajaxRequest(url, params, action);
}

function ajaxRequest(thisurl,params, action) {
	var requesttype = 'post';

	if (window.XMLHttpRequest) {
		requesttype = 'get';
	}

	if (!action) {
		action = refreshNothing;
	}

	var myAjax = new Ajax.Request(
	thisurl,
	{
		method: requesttype,
		postBody: params,
		parameters: params,
		onComplete: function(param) {
			inhibitSW = false;
			if (action)
				action(param);
			else
				refreshNothing();
		},
		requestHeaders:['Referer', document.location.href]
	});
}

// request and update with new list html, requires a 'mainbody' div defined in the document
// templates should use the ajaxUpdate param to block headers and footers.
function ajaxUpdate(url, params, action, actionparam) {
	return ajaxUpdateDiv('mainbody', url, params, action, actionparam);
}

function ajaxUpdateDiv(div, url, params, action, actionparam) {
console.log("start ajaxUpdate." + url + "." + params);
	var params = params;
	var phash = '';
	var poshash = params.indexOf("#")
	if (poshash > 0) {
		phash = params.substr(poshash);
		params = params.substr(0, poshash);
	}
	new Ajax.Updater( { success: div }, url, {
		method: 'post',
		postBody: params + '&ajaxUpdate=1&player=' + player,
		evalScripts: true,
		asynchronous: true,
		onComplete: function() {
			inhibitSW = false;
			if (action)
				action(actionparam);
			if (phash)
				document.location=phash;
		}
	} );
}

// Parse the raw data and return the requested hash.
// if data is already parsed, just return unprocessed.
function fillDataHash(theData) {
	var returnData = null;

	if (theData['player_id']) { 
		return theData;
	} else {
		var myData = theData.responseText;
		returnData = parseData(myData);
	}

	return returnData;
}

// doRefresh
// refreshes all elements on the page with ajaxRequest
// refreshAll needs to be defined in the page specific javascript file 
function doRefresh() {
	var args = 'player=' + player + '&ajaxRequest=1';
	getStatusData(args, refreshAll);
}

// clears setInterval() defined by intervalID
function clearIntervalCall() {

	if (intervalID) {
		clearInterval(intervalID);
		intervalID = false;
	}
}

// pass an array of div element ids to be hidden on the page
function hideElements(myAry) {

	for (var i = 0; i < myAry.length; i++) {
		var div = myAry[i];

		if ($(div)) {
		//	document.getElementById(div).style.display = "none";
			$(div).style.display = 'none';
		}
	}
}

// pass an array of div element ids to be shown on the page
function showElements(myAry,style) {
	if (!style) style = 'block';

	for (var i = 0; i < myAry.length; i++) {
		var div = myAry[i];

		if ($(div)) {
			//document.getElementByID(div).style.display = 'block';
			$(div).style.display = style;
		}
	}
}

// empty function that can be called when getStatus is called but no elements need be refreshed
function refreshNothing() {
	return true;
}

// changes the href attribute to 'value' of an anchor id of 'element'
function refreshHref (element, value) {

	if ($(element)) {
		document.getElementById(element).href = value;
	}
}

// changes some part of a query in an href of id 'item', finding based on 'rpl', and replacing with 'data'
function refreshHrefElement (item,data,rpl) {
	
	var myString = new String($(item).innerHTML);
	var rString = rpl + data + "&amp;player";
	var rExp= new RegExp(rpl + ".*?&amp;player","i");

	//safari hack
	if (rExp.exec(myString) == null) rExp= new RegExp(rpl + ".*?&player","i");
	$(item).innerHTML = myString.replace(rExp, rString);
}

// changes the innerHTML to 'value' of an element id of 'element'
// if truncate is given, 'value' is reduced to truncate in length, plus a '...'
function refreshElement(element, value, truncate) {

	if (value.length > truncate) {
		var smaller = value.substring(0,truncate);
		value = smaller+'...';
	}

	if ($(element)) {
		$(element).innerHTML = '';
		$(element).innerHTML = value;
	}
}

// thisData is the responseText from ajaxRequest.txt
// this function parses the response into a hash object used in all update functions
function parseData(thisData) {
	var lines = thisData.split("\n");
	var returnData = new Array();

	for (i=0; i<lines.length; i++) {
		var comment = /^#/;
		var blank = /^\s*$/;
		var preTag = /<\\*pre>/;
		var commentLine = lines[i].match(comment);
		var blankLine = lines[i].match(blank);

		if (!commentLine && !blankLine && preTag) {
			var keyValue = lines[i].split('|');
			var key = keyValue[0];
			var value = keyValue[1];
			returnData[key] = value;
		}
	}

	return returnData;
}

function refreshLibraryInfo() {
}

// METHOD:  truncateAt: truncate specified tableId at specified length
function truncateAt(tableId, lastRow) {
	var tableObj, oTr;
	
	if ( ! $(tableId) ) {
		return null;
	}
	
	tableObj = $(tableId);
	
	if ( ! (oTr = tableObj.rows[lastRow]) ) {
		return null;
	}
	
	if (tableObj.rows.length >= lastRow) {
		var startRow = lastRow;
		for (var r=startRow; r <= tableObj.rows.length; r++ ) {
			tableObj.deleteRow(r);
		}
		return null;
	}
}

// put global.js functions here that you want to be run after the page loads
// requires a window.onLoad function in the js script that calls global.js
// see Nokia770/browse.js for example
function globalOnload() {
//	refreshLibraryInfo();
}

function hideAlbumInfo() {
	new Effect.Fade('albumPopup', { duration:0.4 });
	new Effect.Fade('albumBackground', { duration:0.4 });
	new Effect.Appear('viewSelect', { duration:0.4 });
}

function popUpAlbumInfo(attributes) {
	
	// here we go-- get the album track details via an ajax call
	// pop up a list of the tracks in an inline div, including play/add buttons next to tracks
	// add a close button for the div to hide it
	if ($('albumPopup') && attributes.match('album.id')) {
		new Effect.Appear('albumBackground', { from: 0, to: 0.5, duration: 0.5 });
		
		$('albumPopup').style.border='1px solid white';
		
		new Ajax.Updater( { success: 'trackInfo' }, webroot + 'browsedb.html?ajaxUpdate=1&player=' + player + '&' + attributes, {
			method: 'get',
			asynchronous: true,
			evalScripts: true,
			postBody: attributes + '&ajaxUpdate=1&player=' + player,
			onSuccess: function() {
				new Effect.Appear('albumPopup');
				new Effect.Fade('viewSelect', { duration:0.4 });
			}
		} );
	}
}

function showTree(id, page, attributes) {
	
	// get next level details through an ajax request and expand tree.
	if ($("descendinfo"+id)) {
		Element.hide("descend"+id);
		Element.hide("close"+id);
		Element.show("wait"+id);
		
		var url = page.toLowerCase();
		
		new Ajax.Updater( { success: "item"+id }, webroot + url + '.html', {
			method: 'post',
			asynchronous: true,
			postBody: attributes + '&ajaxUpdate=1&tree=1&player='+player, 
			onFailure: function(t) {
				Element.hide("wait"+id);
				Element.show("descend"+id);
			},
			onComplete: function() {
				new Effect.SlideDown("descendinfo"+id, { duration: 0.4 });
				Element.show("close"+id);
				Element.hide("wait"+id);
			}
		} );
	}
}

// Collapse the next level tree.
function hideTree(id) {
	new Effect.SlideUp("descendinfo"+id, {
		duration: 0.4,
		afterFinish: function() {
			$("item"+id).innerHTML = '';
		}
	});
	
	Element.hide("close"+id);
	Element.show("descend"+id);
}
