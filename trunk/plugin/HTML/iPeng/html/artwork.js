var url = '[% webroot %]browsedb.html';
var parsedData;
var artistHrefTemplate = '[% webroot %]browsedb.html?hierarchy=album,track&amp;contributor.id=ARTIST&amp;level=1&player=[% playerURI %]';
var albumHrefTemplate = '[% webroot %]browsedb.html?hierarchy=album,track&level=1&album.id=ALBUM&player=[% playerURI %]';
var playAlbumTemplate = '[% webroot %]status.html?command=playlist&subcommand=loadtracks&album.id=ALBUM&player=[% playerURI %]';
var addAlbumTemplate = '[% webroot %]playlist.html?command=playlist&subcommand=addtracks&album.id=ALBUM&player=[% playerURI %]';
var blankRequest = 'hierarchy=album,track&level=0&artwork=2&player=00%3A04%3A20%3A05%3A1b%3A82&artwork=1&start=[% start %]&ajaxRequest=1';

var pAT = 'javascript:changeOSD("AlBuM [% "NOW_PLAYING" | string %]"); addItem("command=playlist&subcommand=loadtracks&album.id=ALBUM&player=[% playerURI %]")';
var aAT = 'javascript:changeOSD("[% "ADDING_TO_PLAYLIST" | string %] AlBuM"); addItem("command=playlist&subcommand=addtracks&album.id=ALBUM&player=[% playerURI %]")';

var thisAlbum, thatAlbum, clickedItem;

function addItem(args) {
	url = '[% webroot %]status.html';
        getStatusData(args, showAdded);
	url = '[% webroot %]browsedb.html';
}

// parses the data if it has not been done already
function fillDataHash(theData) {
	var returnData = null;
	if (theData['player_id']) { 
		return theData;
	} else {
		var myData = theData.responseText;
		returnData = parseData(myData);
		return returnData;
	}
}

function emptyFunction() {
	return true;
}

function popUpAlbumInfo(thisOne, albumId) {
	var lookupId;
	if (albumId) {
		lookupId = thisOne;
	} else {
		if (thisOne == 1) {
			clickedItem = thisAlbum;
		} else {
			clickedItem = thatAlbum;
		}
		var albumKey = 'albumid_' + clickedItem;
		lookupId = parsedData[albumKey];
	}
	
	// here we go-- get the album track details via an ajax call
	// pop up a list of the tracks in an inline div, including play/add buttons next to tracks
	// add a close button for the div to hide it
	if ($('albumInfo')) {
		$('trackInfo').innerHTML = '';
		var newArgs = 'artwork=4&hierarchy=album,track&level=1&player=[% playerURI %]&album.id='+parseInt(lookupId);
		getStatusData(newArgs,updateTrackInfo);
		Element.appear('albumInfo', { from: 0, to: 0.5, duration: 0.5 });
	}
}

function popUpAlbumInfoPos(thisOne, cover, albumId, albumPos) {
	Element.setStyle('albumInfo', { top : albumPos+'px' });
	if (cover) 
		Element.setStyle('albumInfo', { backgroundImage: 'url(/music/'+cover+'/cover_400x400_f.jpg)',
										backgroundColor: 'none',
										opacity: 1.0 });

	else 
		Element.setStyle('albumInfo', { backgroundImage: 'none',
										backgroundColor: '#333333',
										opacity: 0.85 });
		popUpAlbumInfo(thisOne, albumId);
}

function updateTrackInfo(theData) {
	var myData = theData.responseText;
    var showDivs = [ 'albumInfo', 'trackInfo', 'closeAlbumInfo' ];
    showDivs.each(function(key) {
		if ($(key)) {
//			Element.setStyle(key, { border: '1px solid black' } );
			Element.show(key);
		}
	});
	if ($('trackInfo')) {
		$('trackInfo').innerHTML = myData;
	}
}

function hideAlbumInfo() {
	if ($('trackInfo')) {
		$('trackInfo').innerHTML = '';
	}
        var hideDivs = [ 'albumInfo', 'trackInfo', 'closeAlbumInfo' ];
        hideDivs.each(function(key) {
                if ($(key)) {
			Element.setStyle(key, { border: '0px'} );
			Element.hide(key);
                }
        });
}

window.onload= function() {
	globalOnload();
}

