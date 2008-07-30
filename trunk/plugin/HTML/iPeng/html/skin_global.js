
function globalOnload() {
//	refreshLibraryInfo();
//	window.onscroll = hideBrowserBar;
	window.scrollBy (0,1);
}

function hideBrowserBar() {
		if (!window.pageYOffset) 
			window.scrollTo (0, 1);
 }
 
function max(a, b) { return (a > b) ? a : b; }

function min(a, b) { return (a < b) ? a : b; }

function abs(a) { return (a < 0) ? -a : a; }

function chooseAlbumOrderBy(value, option, artwork) {
	var oderByUrl;
	if (!artwork && artwork != 0) {
		artwork = 1;
	}
    if (option) {
		orderByUrl = orderByUrl + '&orderBy=' + option;
    }
    setCookie( 'SqueezeCenter-orderBy', option );
    window.location = orderByUrl;
}

function setAlbumOrderBy(value, option) {
    setCookie( 'SqueezeCenter-orderBy', option );
}

function setCookie(name, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + 1000*60*60*24*365);
		var path = (webroot) ? webroot : "//";
		if (path.substr(-1,1) == "/") path=path.substr(0, path.length - 1);
        document.cookie =
                name + "=" + escape(value) +
                ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) 
				+ "; path=" + path;
}

function getCookie(param){
	var c = document.cookie + ";";
	var re = /\s?(.*?)=(.*?);/g;
	var matches;
	while((matches = re.exec(c)) != null){
		var name = matches[1];
		var value = matches[2];
		if (name == param) {
			return unescape(value);
		}
	}
	return '';
}


// enters message sent to OSD div (typically still needs to be made visible with a different function)
function changeOSD(message) {
	if ($('OSD')) {
		$('OSD').innerHTML = message;
	}
}

// send a message and number of milliseconds duration to the OSD div
function showVolumeOSD(message, duration) {
	var msDuration = parseInt(duration, 10);

	if ($('volumeOSD')) {
		$('volumeOSD').innerHTML = '';
		$('volumeOSD').style.display = 'block';
		$('volumeOSD').innerHTML = message;
	}
	var intervalID = setTimeout(hideVolumeOSD, msDuration);
}

function hideVolumeOSD() {
	if ($('volumeOSD')) {
		$('volumeOSD').style.display = 'none';
	}
}

function showAdded() {
	if ($('OSDbg')) {
	 	$('OSDbg').style.top = window.pageYOffset + 140;
		$('OSDbg').style.display = 'block';
	}
	if ($('OSD')) {
	 	$('OSD').style.top = window.pageYOffset + 140;
		$('OSD').style.display = 'block';
	}
	var intervalID = setTimeout("hideAdded()", 2000);
}

function hideAdded() {
	if ($('OSD')) {
		$('OSD').style.display = 'none';
	}
	if ($('OSDbg')) {
		$('OSDbg').style.display = 'none';
	}
}

function resize(src,width) {
	if (!width)
		width = 320;
	if (src.width > width ) {
		src.width = width;
	}
}

function toggleGalleryView(artwork) {
	var thisdoc = document.location;
	if (thisdoc.pathname != '') {
		myString = new String(thisdoc.href);
		if (artwork) {
			setCookie( 'SqueezeCenter-albumView', "1" );
			if (thisdoc.href.indexOf('start') == -1) {
				document.location=thisdoc.href+"&artwork=1";
			} else {
				myString = new String(thisdoc.href);
				var rExp = /\&start=/gi;
				document.location=myString.replace(rExp, "&artwork=1&start=");
			}
		} else {
			setCookie( 'SqueezeCenter-albumView', "" );
			var rExp = /\&artwork=1/gi;
			document.location=myString.replace(rExp, "");
		}
	}
}


function storeReturnLevel(golevel) {
 	var hreftmp = (golevel) ? golevel : new String (document.location);
	var myString = '';
	var idxTemp = hreftmp.indexOf("hierarchy=");
	var hierarchy = null;
	var level = '0';
	if (idxTemp == -1) {
	 	return;
	}
	hierarchy = hreftmp.slice (idxTemp + 10); // LO("&hierarchy=")
 	idxTemp = hierarchy.indexOf ('&');
 	if (idxTemp > 0)
 		hierarchy = hierarchy.substr(0, idxTemp);
 	hierarchy = escape(hierarchy);
 	
 	idxTemp = hreftmp.indexOf("level=");
 	if (idxTemp != -1) {
		level = hreftmp.slice (idxTemp + 6); // LO ("&level=")
		idxTemp = level.indexOf ('&');
		if (idxTemp > 0)
			level = level.substr(0, idxTemp);
	}
 		
 	idxTemp = hreftmp.indexOf('start=');
	if (idxTemp != -1) {
	 	myString = hreftmp.slice (idxTemp + 6); // LO ("&start=")
	 	idxTemp = myString.indexOf ('&');
	 	if (idxTemp > 0)
	 		myString = myString.substr(0,idxTemp);
	}
	setCookie( 'SqueezeCenter-returnToH' + hierarchy + level, myString );
}

function returnToLevel(hRefParam) {
	var rExp = /\&href=/gi;			// hack to get rid of "href="
 	var param = hRefParam.replace(rExp, "");
 
	var idxTemp = param.indexOf('hierarchy=');
	if (idxTemp == -1) {
	 	document.location = param;
	 	return;		
	}
	var hierarchy = param.slice (idxTemp + 10); //LO ("&h...")
 	idxTemp = hierarchy.indexOf ('&');
 	if (idxTemp > 0)
 		hierarchy = hierarchy.substr(0, idxTemp);
 	hierarchy = escape(hierarchy);

	var level = '0';
 	idxTemp = param.indexOf('level=');
 	if (idxTemp != -1) {
		level = param.slice (idxTemp + 6);
		idxTemp = level.indexOf ('&');
		if (idxTemp > 0)
			level = level.substr(0, idxTemp);
	}
	document.location = param + "&start=" + getCookie( 'SqueezeCenter-returnToH' + hierarchy + level );
}

function storeReturnPage(golevel) {
 	var hreftmp = (golevel) ? golevel : new String (document.location);
	setCookie( 'SqueezeCenter-returnToView', hreftmp );
}

function returnToViewPage() {
console.log("rtVp");
	var myString = new String ( getCookie( 'SqueezeCenter-returnToView' ) );
	if (myString) {
		document.location = myString;
	}
}

function getReturnViewPage() {
	return new String ( getCookie( 'SqueezeCenter-returnToView' ) );
}

function storeReturns(param) {
	storeReturnPage(param);
	storeReturnLevel(param);
}


function togglePower() { callJSONRPC([ 'power' ]); }

function togglePause() { callJSONRPC([ 'pause' ]); }

function scrollToTop() { window.scrollTo(0, 1); }


function callJSONRPC(paramArray, callback, failure, thisplayer, noinhibit) {
 	var thisplayer = (thisplayer == null) ?  playerid : thisplayer;
	var temp = {
	 		"id" : 1,
			"method" : "slim.request",
			"params" : [ thisplayer, paramArray ]};

	if (!noinhibit)
		inhibitSW = true;
	new Ajax.Request ('/jsonrpc.js', {
	 		 method: 'post',
	 		 postBody: Object.toJSON(temp),
	 		 onSuccess: function (transport) {
				var response = transport.responseText.evalJSON(true);
				if (callback) callback (response); },
			 onFailure: function (response) {
			  	if (failure) failure(response); } });
	inhibitSW = false;
}

function addItem(args, goStatus) {
	inhibitSW = true;
 	if (goStatus == null)
		getStatusData(args, showAdded);
	else
		getStatusData(args, goToStatus2);
	inhibitSW = false;
}

function addPlayItem(args) {
	var	param = unescape(args);
	var rExp = /\&\&+/gi;
	param = param.replace(rExp, "&");
 	var paramArray = param.split("&");
	callJSONRPC (paramArray, function (res) { goToStatus(true); });
}

function addItemLoad (args, playthis, goStatus) {
	if (!playthis) {
		if (goStatus)
			addPlayItem(args);
		else
			new Ajax.Request ('/jsonrpc.js', { method: 'post', parameters: args});
		return;
	}
	var paramArray = ["playlist", "shuffle", "?"];
	callJSONRPC(paramArray, function (response){
		if (response.result._shuffle) {
			var paramArray = ["playlist", "shuffle", "0"];
			callJSONRPC (paramArray, function (res2) { 
			 	loadNPlay2(args, response.result._shuffle, playthis, goStatus);	});
		} else
				loadNPlay2(args, 0, playthis, goStatus);
	});
}

function loadNPlay2 (args, shuffle, playthis, goStatus) {
 	function resetShuffle(shuffle, goStatus) {
		if (shuffle) {
			var sArray = ["playlist", "shuffle", shuffle];
			callJSONRPC (sArray, function (r2) {goToStatus(goStatus);}, function (r2) {goToStatus(goStatus); });
		} else 
			goToStatus(goStatus);
	}
	var rExp = /\&\&+/gi;
	var ar2 = args.replace(rExp, "&");
 	var param = ar2.split("&");
 	callJSONRPC (param, function (res) {
 	 	if (playthis) {
	 	 	var pArray = ["playlist", "index", playthis];
			callJSONRPC (pArray, function (r2) { resetShuffle(shuffle, goStatus); }, function (r2) { resetShuffle(shuffle, goStatus); });
		} else
			resetShuffle(shuffle, goStatus);
	});
}

function playTrack(trackNr) {
	var sArray = [ 'songinfo', '0', '5', 'track_id:' + trackNr, 'tags:et' ];
	var album = 0;
	var tracknum = 0;

	function atCB(startcnt, r2) {
		var cnt = 0;
		var thetrack = -1;
		r2.result.titles_loop.each(function(key) {
			if (key.id)
				if (key.id == trackNr) {
					thetrack = cnt;
					throw $break;
				} else
					cnt++;
		});
		
		if (thetrack == -1 && (r2.result.count - startcnt) > cnt) {
			var sArr = [ 'titles', startcnt + cnt, '100', 'album_id:' + album, 'sort:tracknum', 'tags:t' ];
			callJSONRPC(sArr, function (r1) { atCB (cnt, r1); });
		} else if (thetrack != -1)
			addItemLoad("playlist&loadtracks&album.id=" + album, thetrack + startcnt, true);
	}

	callJSONRPC(sArray, function (r2) {
		r2.result.songinfo_loop.each(function(key) {
			if (key.album_id) album = key.album_id;
		});
	var sArr = [ 'titles', '0', '100', 'album_id:' + album, 'sort:tracknum', 'tags:t' ];
	callJSONRPC(sArr, function (r1) { atCB(0, r1); }, function (r1) {});
	});
}

function playPlaylist(trackNr, playlistNr) {
	var tracknum = 0;

	function atCB(startcnt, r2) {
		var cnt = 0;
		var thetrack = -1;
		r2.result.playlisttracks_loop.each(function(key) {
			if (key.id)
				if (key.id == trackNr) {
					thetrack = key["playlist index"];
					throw $break;
				} else
					cnt++;
		});
		
		if (thetrack == -1 && (r2.result.count - startcnt) > cnt) {
			var sArr = [ 'playlists', 'tracks', startcnt + cnt, '100', 'playlist_id:' + playlistNr, 'tags:t' ];
			callJSONRPC(sArr, function (r1) { atCB (cnt, r1); });
		} else if (thetrack != -1)
			addItemLoad("playlist&loadtracks&playlist.id=" + playlistNr, thetrack, true);
	}

	var sArr = [ 'playlists', 'tracks', '0', '100', 'playlist_id:' + playlistNr, 'tags:t' ];
	callJSONRPC(sArr, function (r1) { atCB(0, r1); });
}

function playURL(trackURL) {
	var theurl = unescape(trackURL);
	var folderurl = theurl.substr(0, theurl.lastIndexOf('/') || theurl.lastIndexOf('\\'));
	var sArray = [ 'songinfo', '0', '5', 'url:' + theurl, 'tags:et' ];
	var album = 0;
	var trackid = 0;

	function atCB(startcnt, r2) {
		var cnt = 0;
		var thetrack = -1;
		var hasfolders = false;
		r2.result.folder_loop.each(function(key) {
			if (key.id)
				if (key.id == trackid) {
					thetrack = cnt;
					throw $break;
				} else if (key.type == 'track')
					cnt++;
				else if (key.type == 'folder') {
					hasfolders = true;
					thetrack = 0;
					throw $break;
				}
		});
		
		if (thetrack == -1 && (r2.result.count - startcnt) > cnt) {
			var sArr = [ 'musicfolder', '0', '100', 'url:' + folderurl, 'tags:t' ];
			callJSONRPC(sArr, function (r1) { atCB (cnt, r1); });
		} else if (thetrack != -1)
			if (hasfolders)  // subfolders? -> only play single track!
				addItemLoad("playlist&play&" + theurl, 0, true);
			else
				addItemLoad("playlist&play&" + folderurl, thetrack + startcnt, true);
	}

	callJSONRPC(sArray, function (r2) {
		r2.result.songinfo_loop.each(function(key) {
			if (key.id) 
				trackid = key.id;
		});
	var sArr = [ 'musicfolder', '0', '100', 'url:' + folderurl, 'tags:t' ];
	callJSONRPC(sArr, function (r1) { atCB(0, r1); });
	});
}


function clearCurrentPlaylist() {
	if (confirm("Do You really want to clear the current playlist?")) {
		var sArray = [ 'playlist', 'clear' ];
		callJSONRPC(sArray, function (r2) { hidePlaylistControl(); });
	}
}

function showPlaylistControl() {
	if ($('currentPlaylistControl')) 
		if ($('currentPlaylistControl').style.display == 'none') {
		 	if ($('alphamap')) {
		 		$('alphamap').style.top = parseInt($('alphamap').getStyle('top')) + 48;
		 	}
			Element.show('currentPlaylistControl');
		}
}

function hidePlaylistControl() {
	if ($('currentPlaylistControl'))
		if ($('currentPlaylistControl').style.display != 'none') {
		 	if ($('alphamap')) {
		 		$('alphamap').style.top = parseInt($('alphamap').getStyle('top')) - 48;
		 	}
			Element.hide('currentPlaylistControl');
		}
}

function evaluatePlaylist() {
	var sArray = [ 'playlist', 'tracks', '?' ];
	callJSONRPC(sArray, function (r2) {
	 		if (r2.result._tracks > 0) {
		 		showPlaylistControl();
				var sArr = [ 'playlist', 'name', '?' ];
				callJSONRPC(sArr, function (r3) { 
				 		if ($('curr_playlistname'))
							if (r3.result._name)
								refreshElement('curr_playlistname', r3.result._name, 26);
							else
								refreshElement('curr_playlistname', 'unnamed playlist');
							
					}, function (r3) {});
	 		} else
	 			hidePlaylistControl();
		});
}

function scrollOverlayUp(id1, id2, offset, onflag) {
	var page1 = $(id1);
	var page2 = id2 ? $(id2) : page1;
	var interval = (onflag) ? -104 : 104;
	var starttop = (onflag) ? 416 : 0;
	var endtop = (onflag) ? 0 : 416;
	
	page1.style.top = starttop + offset;
	page2.style.top = starttop + offset;
	if (onflag) {
		Element.show(id1);
		Element.show(id2);
	}
	
	var timer = setInterval (doScroll, 0);

	function doScroll () {
		if (starttop != endtop) {
			starttop += interval;
			page1.style.top = starttop + offset;
			page2.style.top = starttop + offset;
		}
		else {
			clearInterval(timer);
			if (!onflag) {
				Element.hide(id1);
				Element.hide(id2);
			}
		}
	}
}

function expandAlphamap(thediv) {
 	var thediv = (thediv == null) ? 'pagecontainer_vert' : thediv;
	var realheight = $(thediv).scrollHeight;
	if ($('currentPlaylistControl'))
		if ($('currentPlaylistControl').style.display != 'none')
			realheight = realheight - 48;
	var numalpha = parseInt(realheight / 26);
	var alphatab = $('alphatable');
	var maxalpha = alphatab.rows.length;
	for (cnt = 1; cnt < (numalpha - maxalpha); cnt++) {
		nrow = alphatab.insertRow(-1);
		nrow.innerHTML = alphatab.rows[cnt].innerHTML;
	}
	$('alphamap').style.height = realheight;
}

