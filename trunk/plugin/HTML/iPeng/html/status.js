var url = 'status.html';

var scrollHeight = 320;
var _progressBarWidth = 156;
var _volumeBarWidth = 262;

var overlaysON = false;
var coverON = true;
var storeOverlays = false;
var OVstack = 0;
var OVMaxstack = 3;

var maxPlLoop = 20;
var infoFulltags = 'tags:uBJKlaedsRxNpg';
var infoFewtags = 'tags:uBJKleasxgp';


var Playlist = {
	firstitem : -1,
	lastitem : -2,
	playing : -1,
	storescroll : false,
	scrolling : false,
	snaptime : 0,
	snaptarget : null,
	snapup : true,
	rows : null,
	table : null,
	win : null,
	
	init : function() {
	 	with (this) {
			table = $('playlisttableNow');
			win = $('playlistNow');
			rows = table.rows;
			firstitem = -1;
			lastitem = -2;
			playing = -1;
		}
	},
	
	resetScroll : function() { this.scrolling = false },
	
	blockScroll : function() {
		if (this.scrolling) return;
		this.scrolling = true;
		window.setTimeout(Playlist.resetScroll, 1000);
	},
	
	setSnap : function() { this.snaptime = new Date().getTime(); },
	
	testSnap : function(enf) {
		with (this) {
//alert("st:" + snaptime + " enf:" + enf + " starget:" + snaptarget + " up:" + snapup);
			if (!snaptime && !enf) return;
			if (snaptime && (new Date().getTime() - snaptime < 20000)) return;
			snaptime = 0;
			if (!snaptarget) return;
			snaptarget.scrollIntoView(snapup);
			window.scrollTo(2, 1);
			if (snapup) 
				win.scrollTop -= 76;
			else
				win.scrollTop += 76;
			snaptime = 0;
		}
	},
	
	setSnaptarget : function (target, flag) {
		this.snaptarget = target;
		this.snapup = flag;
	},
	
	update : function(ufirst, ulast) {
		var ufirst = ufirst;
		var ulast = ulast;
		
	 	if (!this.table)
	 		this.init();
//alert("ud " + this.table + ".fi." + this.firstitem + ".li." + this.lastitem + ".plf." + Player.status.pl_first + ".pll." + Player.status.pl_last + ".r." + this.rows + ".uf." + ufirst + ".ul." + ulast);
		with (Player.status) {
			if (pl_first < 0 || pl_last < 0 || pl_last < pl_first) {
				while (this.table.rows.length) {
					this.table.removeChild(this.table.rows[0]);
				}
				this.init();
				return;
			}
			ufirst = max(ufirst, pl_first);
			ulast = min(ulast, pl_last);
		}
		with (this) {
			var i;
			var scrollitem = ufirst;
			var scrolltop = true;
			if (ulast == firstitem - 1)
				scrollitem = ulast;
			else if (ufirst == lastitem + 1)
				scrolltop = false;

			if (ulast < firstitem - 1 || ufirst > lastitem + 1)
				for (i = firstitem; i <= lastitem; i++)
					table.removeChild(rows[0]);

			if (ufirst < firstitem)
				for (i = min(ulast, firstitem - 1); i >= ufirst; i--)
					addRow(i);
			else if (firstitem < Player.status.pl_first && firstitem > 0)
				for (i = firstitem; i < Player.status.pl_first; i++)
					table.removeChild(rows[0]);

			if (lastitem > 0)
				for (i = max(firstitem, ufirst); i <= min(ulast, lastitem); i++)
					updateRow(i - max(firstitem, Player.status.pl_first));

			var newfirst = min(max(firstitem, Player.status.pl_first), ufirst);
				
			for (i = max(lastitem + 1, ufirst); i <= ulast; i++)
				addRow(i);
			
			if (Player.status.pl_last > firstitem - 1) {
				var endl = Player.status.pl_last - newfirst;
				for (i = Player.status.pl_last + 1; i <= lastitem; i++)
					table.removeChild(rows[endl]);
			}
				
			firstitem = newfirst;
			lastitem = max(min(lastitem, Player.status.pl_last), ulast);
			if (scrolling) 
				if (scrolltop)
					win.scrollTop = (scrollitem - firstitem) * 38;
				else
					win.scrollTop += 38;
			updateIndex();
		}
	},
	
	updateIndex : function() {
	 	with (this) {
//alert("idx:" + Player.status.index + " pl:" + playing + " fi:" + firstitem); 
			if (Player.status.index == playing) return;
			var therow;
			var tmp;
			if (playing != -1) {
				therow = rows[playing - firstitem];
				Element.extend(therow);
				var cname = ((playing) % 2) ? 'odd' : 'even';
				therow.className = cname;
				therow.down('td', 0).className = cname;
				therow.down('td', 1).setStyle({ borderLeft : '1px solid #333333' }).className = cname;
				tmp = therow.down('td', 2);
				tmp.className = cname;
				tmp.down('img').src = webroot + "html/images/x_grey.png";
				therow.down('td', 3).setStyle({ borderLeft : '1px solid #333333' }).className = cname;
				storescroll = false;
			}
			if (Player.status.index < firstitem || Player.status.index > lastitem) {
				playing = -1;
				storescroll = Player.status.index < firstitem;
				return;
			}
			playing = Player.status.index;
			therow = rows[playing - firstitem];
			Element.extend(therow);
			therow.className = 'selectedRow';
			therow.down('td', 0).className = 'selectedRow';
			therow.down('td', 1).setStyle({ borderLeft : 'none' }).className = 'selectedRow';
			tmp = therow.down('td', 2);
			tmp.className = 'selectedRow';
			tmp.down('img').src = webroot + "html/images/x_blue_none.png";
			therow.down('td', 3).setStyle({ borderLeft : 'none' }).className = 'selectedRow';
			
			tmp = therow.viewportOffset().top;
			if (tmp < 120) { //44
				setSnaptarget(therow, true);
				testSnap(true);
			} else if (tmp > 240) {  //310
				setSnaptarget(therow, storescroll);
				testSnap(true);
			} setSnaptarget(therow, true);
		}
	},
	
	truncTitle : function(tl) { return (tl.length > 40) ? tl.substring(0,38) + '...' : tl; },
	
	updateRow: function(idx) {
	 	with (this) {
		 	if (idx < 0 || idx > (lastitem - firstitem) || rows == null ||
			 	idx > Player.status.pl_last - Player.status.pl_first) return;
		 	var newrow = rows[idx];
		 	var srcrow = Player.status.alltracks[idx];
		 	newrow.setAttribute('item', Player.status.pl_first + idx);
		 	newrow.down('td', 0).update(Player.status.pl_first + idx + 1);
			var stitle = truncTitle(srcrow.title);
		 	newrow.down('td', 1).update(stitle).setAttribute('title', "Play: " + stitle);
		 	newrow.down('td', 2).setAttribute('title', "Delete: " + stitle);
		 	newrow.down('td', 3).update(timeStr(srcrow.duration));
		}
	},
	
	addRow : function(inum) {
		with (Player.status) {
			if (inum < pl_first || inum > pl_last || 
				//inum < this.firstitem || inum > this.lastitem ||
				!alltracks[inum - pl_first]) return; }
		var srcrow = Player.status.alltracks[inum - Player.status.pl_first];	
		var newrow = document.createElement("tr");
		var classname = (inum % 2) ? 'odd' : 'even';
		
		newrow.className = classname;
		newrow.style.height = 38;
		newrow.setAttribute('item', inum);
		var linediv = document.createElement("div");
		var img;
		
		if (inum) {
			linediv.className = 'xchgdiv';
			linediv.onclick = function(evt) { Playlist.evtXchg(findAttribute(evt.target, 'item')); };
			img = document.createElement("img");
			img.setStyle({ width : '320', height : '1' });
			img.src = webroot + 'html/images/between_line.png';
			linediv.appendChild(img);
			img = document.createElement("img");
			img.className = 'xchgimg';
			img.src = webroot + 'html/images/between2.png';
			linediv.appendChild(img);
			linediv.title = 'Swap tracks';
		}
		newrow.appendChild(linediv);
		
		var td = document.createElement("td");
		td.className = classname;
		td.setStyle({ width : '30', paddingLeft : '4' }).update(inum + 1);
		newrow.appendChild(td);
		
		var stitle = this.truncTitle(srcrow.title);
		td = document.createElement("td");
		td.className = classname;
		td.setStyle({ borderLeft : '1px solid #333333', padding : '0 4 0 4' }).update(stitle);
		td.onclick = function(evt) { Player.controls.evtIndex(findAttribute(evt.target, 'item')); };
		td.title = 'Play: ' + stitle;
		newrow.appendChild(td);

		td = document.createElement("td");
		td.className = classname;
		td.setStyle({ padding : '4 8 4 4' });
		img = document.createElement("img");
		img.className = 'delimg';
		img.src = webroot + 'html/images/x_grey.png';
		img.onclick = function(evt) { Playlist.evtDelete(findAttribute(evt.target, 'item')); };
		img.title = 'Delete: ' + stitle;
		td.appendChild(img);
		newrow.appendChild(td);
		
		td = document.createElement("td");
		td.className = classname;
		td.setStyle({ borderLeft : '1px solid #333333', paddingRight : '2', width: '40', textAlign : 'right' });
		td.update(timeStr(srcrow.duration));
		newrow.appendChild(td);
		
		if (inum < this.firstitem) {
			this.table.insertBefore(newrow, this.rows[0]);
			this.rows = this.table.rows;
		} else
			this.table.appendChild(newrow);
	},
	
	evtDelete : function(inum) {
		var inum = parseInt(inum);
		if (inum < 0 || inum > Player.status.tracks) return;
		Player.addInhibit(true);
		var sArray = [ 'playlist', 'delete', inum ];
		callJSONRPC(sArray, function (r2) {
		 	with (Player.status) {
			 	alltracks.splice(inum - pl_first, 1);
			 	pl_last--;
			 	tracks--;
			 	if (index > inum) index--;
			 	for (var i = inum - pl_first; i <= pl_last - pl_first; i++) {
			 		alltracks[i]["playlist index"]--; }
			 	Playlist.update(inum, min(pl_last, Playlist.lastitem));
			 	Playlist.updateIndex();
			}
			Playlist.cleanupChange(inum, true);
		}, function (r2) { Player.resetInhibit(); });
	},

	evtXchg : function(inum) {
		var inum = parseInt(inum);
		if (inum < 1 || inum > Player.status.tracks) return;
		Player.addInhibit(false);
		var sArray = [ 'playlist', 'move', inum, inum - 1 ];
		callJSONRPC(sArray, function (r2) {
		 	with (Player.status) {
		 		oldrow = alltracks[inum];
		 		newrow = alltracks[inum - 1];
				oldrow["playlist index"]--;
				newrow["playlist index"]++;
		 		alltracks[inum - 1] = oldrow;
		 		alltracks[inum] = newrow;
				Playlist.updateRow(inum - Playlist.firstitem);
				Playlist.updateRow(inum - Playlist.firstitem - 1);
				if (inum == index) {
					index--;
					inum--;
					Playlist.updateIndex();
				} else if (inum == index + 1) {
					index++;
					Playlist.updateIndex();
				}
			 	Playlist.cleanupChange(inum, false);
		 	}
		}, function (r2) { Player.resetInhibit(false); });		
	},
	
	cleanupChange : function(inum, refresh) {
		var sArray = [ 'status', '-', 1, infoFewtags ];
		callJSONRPC(sArray, function (r2) {
			Player.status.timestamp = r2.result.playlist_timestamp;
			Player.resetInhibit(); 
			if (inum == Player.status.index)
				Player.updateIndex(inum, Player.status.tracks, r2.result.playlist_loop[0], true)
			else if (refresh)
				Player.updateIndex(Player.status.index, player.status.tracks, null, true);
		}, function (r2) { Player.resetInhibit(); });
	},
	
	evtWheel : function(evt) {
		this.setSnap();
		if (this.scrolling) return;
		if ((evt.wheelDelta < 0) && ((this.win.scrollHeight - this.win.scrollTop - scrollHeight) < 80)) {
			this.blockScroll();
			Player.populatePL (true, this.lastitem + 1);
		} else if ((evt.wheelDelta > 0) && (this.win.scrollTop < 80)) {
			this.blockScroll();
			Player.populatePL (true, this.firstitem - 1);
		}
	}
};

function findAttribute(el, attr) {
 	var el = el;
	Element.extend(el);
	while (el)
		if (el.hasAttribute(attr)) return el.getAttribute(attr);
		else el = el.up();
}

function timeStr(seconds) {
	if (!seconds) return "--:--";
	var s = parseInt(seconds % 60);
	if (s < 10) { s = "0" + s; }
	var h = "";
	if (seconds >= 3600) {
		h = parseInt(seconds / 3600) + ":";
		if ((seconds % 3600) < 600)
			h = h + "0";
	}
	return h + parseInt(seconds / 60) + ":" + s;
}


function toggleOverlays() {
	var theDivs = [ 'iNowWrapperBottom', 'iNowWrapperTop' ];
	if (overlaysON) {
		overlaysON = false;
		hideElements(theDivs);
	} else {
		overlaysON = true;
		showElements(theDivs);
	}
}

function ScrollField(scElem, swid, ison, act) {
	this.element = scElem;
	this.width = swid;
	this.ON = ison;
	this.timer = null;
	this.action = act;
}

ScrollField.prototype.initScroll = function() {
	var theone = this;
 	doScroll();
	this.timer = setInterval(doScroll, 0);

	function doScroll() {
		 	if (theone.width > 64) {
				theone.width = theone.width - 64;
			} else {
				clearInterval(theone.timer);
				theone.width = 0;
				if (theone.ON)
					if (theone.action)
						theone.action();
			}
			if (theone.ON) {
				theone.element.style.left = -theone.width;
			} else {
				theone.element.style.left = theone.width - 320;
			}
			if (!theone.width)
			 	delete theone;
	}
}

function toggleCover() {
	if (coverON) {
	 	coverON = false;
	 	OVstack = -1;
		$("playlistNow").style.display = "block";
		if (overlaysON) {
			toggleOverlays();
			storeOverlays = true;
		} else {
			storeOverlays = false;
		}
	} else {
		coverON = true;
		OVstack = 0;
	}
	
	var SF = new ScrollField($("coverart"), 320, coverON, function () {	if (storeOverlays) toggleOverlays(); });
	SF.initScroll();
}

function PluginCmd(tpe, id, url, params, cli) {
	this.type = tpe;
	this.id = id;
	this.params = params;
	if (cli) {
		this.cli = url;
		this.path = null;
	} else {
		this.cli = null;
		var temp = url.indexOf("?");
		this.path = (temp > -1) ? url.substr(0, temp) : url;
		this.paramStub = (temp > -1) ? url.substr(temp + 1) : "";
	}
}

PluginCmd.prototype.paramString = function() {
	var cli = (this.cli != null);

	var params = null;
	if (cli)
		params = new Array(this.cli);
	else
		params = this.paramStub;

	function addKeyValue(key, value) {
//alert(cli + " p: " + params + " k: " + key + " v: " + value);
		if (cli)
			params.push(key + (value) ? ':' + value : '');
		else
			params += "&" + key + ((value) ? "=" + value : '');
	};

	$H(this.params).each(function(pair) {
		switch (pair.key) {
			case "id":
			case "title":
			case "album_id":
			case "album":
			case "artist_id":
			case "artist":
			case "genre":
			case "genre_id":
				if (Player.status.track[pair.key])
					addKeyValue (pair.value, Player.status.track[pair.key]);
			break;
			case "index":
				if (Player.status.track["playlist index"])
					addKeyValue (pair.value, Player.status.track["playlist index"]);
			break;
			case "playlist_name":
			case "playlist_id":
				if (Player.status[pair.key])
					addKeyValue (pair.value, Player.status[pair.key]);
			break;
			case "player":
				addKeyValue (pair.value, player);
			break;
			default:
				addKeyValue (pair.value);
			break;
		}
	});
	return params;
};

PluginCmd.prototype.exec = function (refresh) {
	switch (this.type) {
		case "content":
//alert("p: " + this.path + " pS: " + this.paramString());
			ajaxUpdate(this.path, this.paramString(), (refresh) ? refreshNothing : toggleMainbody);
			Plugins.lastCmd = this;
		break;
		case "command":
		default:
			if (!refresh)
				if (this.cli)
					callJSONRPC(this.paramString());
				else
					ajaxRequest(this.path, this.paramString(), Player.triggerUpdate);
	}
};

var Plugins = {
	contentCmds : [],
	
	lastCmd : null,
	extID : null,
	timestamp : null,
	
	findCmd : function(key) {
		for (var i = 0; i < this.contentCmds.length; i++)
			if (this.contentCmds[i].id == key) return this.contentCmds[i];
		return null;
	},
	
	addCmd : function(cmd) { if (cmd) this.contentCmds[this.contentCmds.length] = cmd; },
	
	refresh : function() {
		if (this.lastCmd)
			this.lastCmd.exec(true);
	},
	
	exec: function(cmd) { var temp = Plugins.findCmd(cmd); if (temp) temp.exec(); },
	
	validateLastCmd : function () {	if (!this.findCmd(this.lastCmd.id)) this.lastCmd = null; },
	
	checkTimestamp : function () {
		callJSONRPC( ['ipeng', 'status' ], function (r2) {
			if (r2.result.timestamp != Plugins.timestamp)
				window.setTimeout(Plugins.display, 100);
		});
	},

	display : function () {
	
		function addnameicon (pidiv, key, subsect) {
			var sect = document.createElement("span");
			var parent = document.createElement("a");
			sect.className = "NowPlayingPlugin NPPSpan";
			parent.style.color = "#f0f0f0";
			parent.className = "tapblock";
			parent.style.maxWidth = "320";
			if (key.name) parent.title = key.name;
			if (key.url || key.cli) {
				Plugins.addCmd(new PluginCmd(key.type, subsect.id + "." + key.id, (key.url) ? key.url : key.cli, key.parameters, !(key.url)));
				if (key.type) {
					parent.href="javascript:void(0);";
					parent.onclick = function () { Plugins.exec(subsect.id + "." + key.id); };
				}
			}
			if ((key.width && key.name) || key.html) {
				if (key.width) sect.width = key.width;
				if (key.height) sect.height = key.height;
			}
			if (key.icon) {
				var piicon = document.createElement("img");
				piicon.className = "pluginContent";
				if (key.height) piicon.height = key.height;
				if (key.width && !key.name && !key.html) piicon.width = key.width;
				
				piicon.src = webroot + key.icon;
				parent.appendChild(piicon);
			}
			if (key.name) {
				var pispan = document.createTextNode(key.name);
				parent.appendChild(pispan);
			}
			if (key.html)
				sect.innerHTML = key.html;
			sect.appendChild(parent);
			pidiv.appendChild(sect);
		};
	
		if (!Plugins.extID) Plugins.extID = $('extension');
//alert(Plugins.extID + ".this:" + this + ".PI:" + Plugins);
		var sArray = [ 'ipeng', 'commands', 'nowplaying' ];
		callJSONRPC(sArray, function (r2) {
			if (r2.result.timestamp == Plugins.timestamp) return;
			while (Plugins.extID.firstChild)
				Plugins.extID.removeChild(Plugins.extID.firstChild);
			Plugins.contentCmds.clear();
			r2.result.subsections_loop.each(function(subsect) {
//	$H(subsect).each(function(pair){ alert(pair.key + ":" + pair.value); });
				var pidiv = document.createElement("div");
				pidiv.className = "NowPlayingPlugin NPPRow";
				if (subsect.icon || subsect.name)
					addnameicon (pidiv, subsect, subsect);
				subsect.commands_loop.each(function(key) {
//	$H(key).each(function(pair){ alert(pair.key + ":" + pair.value); });
					addnameicon (pidiv, key, subsect);
				});
				Plugins.extID.appendChild(pidiv);
			});
			Plugins.timestamp = r2.result.timestamp;	
			Plugins.validateLastCmd ();
		});
	}
}

mbON = false;
function toggleMainbody(nodot) {
 	mbON = !mbON;
 	if (mbON) {
		OVstack = 2;
		if (OVMaxstack < 4)
			OVMaxstack++;
	} else OVstack = 1;
		
	var SF = new ScrollField($("mainbody"), 320, mbON);
	SF.initScroll();
	if (!nodot && OVstack == 2)
		for (var last = 0; last < OVMaxstack; last++)
			if (last == 3) {
				Element.hide("pdote" + last);
				Element.show("pdotb" + last);
			} else {
				Element.hide("pdotb" + last);
				Element.show("pdote" + last);
			}
}

fsOvON = false;
function toggleFSOverlay() {
 	fsOvON = !fsOvON;
 	if (fsOvON) OVstack = 1; else OVstack = 0;
		
	var SF = new ScrollField($("extension"), 320, fsOvON, Plugins.display);
	SF.initScroll();
}


function doSwipe(page) {
	if ((page < 0) || (page >= OVMaxstack)) return;
	if (page == OVstack + 1) return;
	var first; var last;
	if (page > OVstack + 1) {
		first = page;
		last = OVstack + 1;
	} else {
		first = OVstack + 1;
		last = page;
	}
	switch (first) {
		case 3: 
			toggleMainbody(true);
		case 2:
			if (last < 2) toggleFSOverlay();
		case 1: 
			if (last < 1) toggleCover();
	}
	OVstack = page -1;
	for (last = 0; last < OVMaxstack; last++)
		if ((page) == last) {
		 	Element.hide("pdote" + last);
			Element.show("pdotb" + last);
		} else {
		 	Element.hide("pdotb" + last);
			Element.show("pdote" + last);
		}
}

function sense_scroll () {
//alert(window.pageXOffset);
		if (window.pageXOffset == 0)
			doSwipe(OVstack + 2);
		if (window.pageXOffset == 4)
			doSwipe(OVstack);
		window.scrollTo (2, 1);
 }

window.onload= function() {
	Player.triggerUpdate();
 	window.scrollTo (2,1);
	if (Prototype.Browser.MobileSafari)
		window.onscroll = sense_scroll;
}


