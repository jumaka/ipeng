var url = 'status.html';

var scrollHeight = 320;
var _progressBarWidth = 156;
var _volumeBarWidth = 262;
var _progressBarOffset = 82;
var _volumeBarOffset = 29;

var overlaysON = false;
var coverON = true;
var storeOverlays = false;
var OVstack = 0;
var OVMaxstack = 3;

var maxPlLoop = 20;
var infoFulltags = 'tags:uBjJKlaedsRxNpg';
var infoFewtags = 'tags:uBJjKleasxgp';
var prev_threshold = 10;
var xchgdiv = 'xchgdiv';
var _rowHeight = 38;

var scrollFactor = 1.5;

var Playlist = {
	firstitem : -1,
	lastitem : -2,
	playing : -1,
	storescroll : false,
	scrolling : false,
	snaptime : 0,
	snaptarget : -1,
	snapup : true,
	snapinhibid : false,
	rows : null,
	table : null,
	win : null,
	page : null,
	numrows : 0,
	
	init : function() {
	 	with (this) {
			table = $('playlisttableNow');
			win = $('playlistNow');
			rows = table.rows;
			numrows = table.rows.length;
			firstitem = -1;
			lastitem = -2;
			playing = -1;
			snapinhibit = false;
			page = ScrollPage.prototype.find(0);
			DnD.init();
		}
	},
	
	preventSnap : function () {
		this.snapinhibit = true;
	},
	
	allowSnap : function () {
		this.snapinhibit = false;
	},
	
	resetScroll : function() { this.scrolling = false },
	
	blockScroll : function() {
		if (this.scrolling) return;
		this.scrolling = true;
		window.setTimeout(Playlist.resetScroll, 1000);
	},
	
	scrollPos : function(row) {
		if (!this.page) return 0;
		return row * _rowHeight + this.page.posY;
	},
	
	testViewport : function() {
		with (this) {
			if (page)
				if (-page.posY > rows.length * _rowHeight - 320) {
					page.vScrollTo(-rows.length * _rowHeight + 320);
				}
		}
	},
	
	setSnap : function() { this.snaptime = new Date().getTime(); },
	
	testSnap : function(enf) {
		with (this) {
//console.log("snaptarget:" + snaptime + " enf:" + enf + " starget:" + snaptarget + " up:" + snapup + ".time:" + (new Date().getTime()));
			testViewport();
			if ((!snaptime && !enf) || snapinhibit) return;
			if (snaptime && (new Date().getTime() - snaptime < 20000)) return;
			snaptime = 0;
			if (snaptarget == -1) return;
			
			var temp = (((snapup) ? 2 : 5) - snaptarget) * _rowHeight;
			temp = min(-firstitem * _rowHeight, temp);
			temp = max(320 - ((1 + lastitem) * _rowHeight), temp);
			if (!page) return 0;
			page.vScrollTo(temp);
//console.log("st done:" + temp + ".sH:" + table.scrollHeight);			
		}
	},
	
	setSnaptarget : function (target, flag) {
		this.snaptarget = target;
		this.snapup = flag;
	},
	
	update : function(ufirst, ulast) {
		var ufirst = ufirst;
		var ulast = ulast;
		var i;
		
	 	if (!this.table)
	 		this.init();
/*console.log(".fi." + this.firstitem + ".li." + this.lastitem + ".plf." + Player.status.pl_first + ".pll." + Player.status.pl_last + ".uf." + ufirst + ".ul." + ulast + ".rl:" + this.table.rows.length + '.pt:' + Player.status.tracks);*/
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
			while (this.table.rows.length > tracks)
				this.table.removeChild(this.table.rows[this.table.rows.length - 1]);
			this.testViewport();
			while (this.table.rows.length < tracks)
				this.addEmptyRow();
			this.numrows = this.table.rows.length;
		}
		with (this) {
			for (i = ufirst; i <= ulast; i++)
				updateRow(i);
			
			firstitem = min(max(firstitem, Player.status.pl_first), ufirst);
			lastitem = max(min(lastitem, Player.status.pl_last), ulast);
			updateIndex();
		}
	},
	
	updateIndex : function() {
	 	with (this) {
//console.log("idx:" + Player.status.index + " pl:" + playing + " fi:" + firstitem); 
			if (Player.status.index == playing) return;
			var therow;
			var tmp;
			if (playing != -1 && playing < rows.length) {
				therow = rows[playing];
				Element.extend(therow);
				var cname = ((playing) % 2) ? 'odd' : 'even';
				therow.className = cname;
//				therow.down('td', 0).className = cname;
				therow.down('td', 1).setStyle({ borderLeft : '1px solid #333333' });//.className = cname;
				tmp = therow.down('td', 2);
//				tmp.className = cname;
				tmp.down('img').src = webroot + "html/images/x_grey.png";
				therow.down('td', 3).setStyle({ borderLeft : '1px solid #333333' });//.className = cname;
				storescroll = false;
			}
			if (Player.status.index < firstitem || Player.status.index > lastitem) {
				playing = -1;
				storescroll = Player.status.index < firstitem;
				return;
			}
			playing = Player.status.index;
			if (playing >= rows.length) return;
			therow = rows[playing];
			Element.extend(therow);
			therow.className = 'selectedRow';
//			therow.down('td', 0).className = 'selectedRow';
			therow.down('td', 1).setStyle({ borderLeft : 'none' });//.className = 'selectedRow';
			tmp = therow.down('td', 2);
//			tmp.className = 'selectedRow';
			tmp.down('img').src = webroot + "html/images/x_blue_none.png";
			therow.down('td', 3).setStyle({ borderLeft : 'none' });//.className = 'selectedRow';
			
			tmp = scrollPos(playing);
			if (tmp < 57) { //44 120
				setSnaptarget(playing, true);
				testSnap(true);
			} else if (tmp > 240) {  //310
				setSnaptarget(playing, storescroll);
				testSnap(true);
			} setSnaptarget(playing, true);
//console.log("ScrollPos:" + tmp + "sts:" + storescroll);
		}
	},
	
	truncTitle : function(tl) { return (tl.length > 40) ? tl.substring(0,38) + '...' : tl; },
	
	updateRow: function(idx, udIndex) {
	 	with (this) {
		 	if (idx < 0 || idx > (numrows - 1) || rows == null ||
			 	idx > Player.status.pl_last) return;
		 	var newrow = rows[idx];
		 	var srcrow = Player.status.alltracks[idx - Player.status.pl_first];
//		 	newrow.setAttribute('item', idx);
//		 	newrow.down('td', 0).update(idx + 1);
			var stitle = truncTitle(srcrow.title);
			if (udIndex) {
			 	newrow.className = (idx % 2) ? 'odd' : 'even';
				newrow.style.webkitTransitionDuration = "0s";
				newrow.style.webkitTransform = 'translateY(0px)';
			 	newrow.setAttribute('item', idx);
			 	newrow.down('td', 0).update(idx + 1);
			 } else {
				newrow.down('td', 1).update(stitle).setAttribute('title', "Play: " + stitle);
				newrow.down('td', 2).setAttribute('title', "Delete: " + stitle);
				newrow.down('td', 3).update(timeStr(srcrow.duration));
			 }
//console.log("uR:" + idx + ".nR:" + numrows + "sTitle" + stitle + ".nR:" + newrow + ".tC:" + newrow.down('td', 1).textContent);
		}
	},
	
	addEmptyRow : function() {
		var newrow = document.createElement("tr");
		var inum = this.rows.length;
//console.log("emptyRow:" + inum);
		var classname = (inum % 2) ? 'odd' : 'even';
		newrow.className = classname;
		newrow.style.height = _rowHeight;
		newrow.setStyle({ borderBottom : '1px solid #333333' });
		newrow.setAttribute('item', inum);
		newrow.addEventListener('touchstart', this, false);
		newrow.addEventListener('touchmove', this, false);
		newrow.addEventListener('touchend', this, false);

		var td = document.createElement("td");
//		td.className = classname;
		td.setStyle({ width : '30', paddingLeft : '4' }).update(inum + 1);
		newrow.appendChild(td);
		
		td = document.createElement("td");
//		td.className = classname;
		td.setStyle({ borderLeft : '1px solid #333333', padding : '0 4 0 4' });
		td.onclick = function(evt) { Player.controls.evtIndex(findAttribute(evt.target, 'item')); };
		newrow.appendChild(td);

		td = document.createElement("td");
//		td.className = classname;
//		td.setStyle({ padding : '4 8 4 4' });
		td.setStyle({ padding : '0 4 0 0', margin : '0' });
//		td.setStyle({ paddingRight : '8' });		
		var img = document.createElement("img");
		img.className = 'delimg';
		img.src = webroot + 'html/images/x_grey.png';
//		img.setStyle({ margin : '2 2 2 2' });
		img.onclick = function(evt) { Playlist.evtDelete(findAttribute(evt.target, 'item')); };
		td.appendChild(img);
		newrow.appendChild(td);
		
		td = document.createElement("td");
//		td.className = classname;
		td.setStyle({ borderLeft : '1px solid #333333', paddingRight : '2', width: '40', textAlign : 'right' });
		newrow.appendChild(td);

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
			 	Playlist.table.removeChild(Playlist.rows[inum]);
			 	pl_last--;
			 	tracks--;
			 	Playlist.lastitem--;
			 	if (index > inum) index--;
			 	for (var i = inum - pl_first; i <= pl_last - pl_first; i++) {
			 		alltracks[i]["playlist index"]--;
			 		Playlist.updateRow(i, true);
			 	}
//			 	Playlist.update(inum, min(pl_last, Playlist.lastitem));
			 	Playlist.updateIndex();
			}
			Playlist.cleanupChange(inum, true);
		}, function (r2) { Player.resetInhibit(); });
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
	
	evtScroll : function(newY) {
		Playlist.setSnap();
	},
	
	handleEvent : function (event) {
		switch (event.type) {
			case 'touchstart' :
				this.DnD.item = parseInt(findAttribute(event.target, 'item'));
				this.DnD.element = this.rows[this.DnD.item];
				Element.extend(this.DnD.element);
				this.DnD.TID = window.setTimeout(this.DnD.start, 1500);
				this.DnD.startY = event.touches[0].screenY;
				this.DnD.scroll0 = this.page.posY;
				this.preventSnap();
				this.DnD.element.addClassName('depressed');
console.log("init:" + this.DnD.item);
//				event.stopPropagation();
//				event.preventDefault();
				break;
			case 'touchmove' :
				this.DnD.element.removeClassName('depressed');
				if (this.DnD.TID)
					this.DnD.cancel();
				if (this.DnD.enabled)
					this.DnD.move(event);
				break;
			case 'touchend' :
				this.DnD.element.removeClassName('depressed');
				if (this.DnD.TID)
					this.DnD.cancel();
				if (this.DnD.enabled)
					this.DnD.finish(event);
				this.allowSnap();
				break;
			case 'webkitTransitionEnd':
			case 'transitionend':
				this.DnD.finishTrans();
				break;
		}
//		event.stopPropagation();
//		event.preventDefault();
	},

	DnD : {
		TID : null,
		shadow : null,
		item : -1,
		element : null,
		enabled : false,
		posY : 0,
		startY : 0,
		scroll0 : 0,
		lastPos : 0,
		offset : 0,
		lastSnap : -1,
		snapdir : 0,
		lastevent : null,
		inTransition : false,
		
		init : function() {
			with (this) {
				enabled = false;
				TID = null;
				shadow = $('PLEshadow');
				element = null;
				posY = 0;
				startY = 0;
				scroll0 = 0;
				lastPos = 0;
				snapdir = 0;
				item = -1;
				offset = 0;
				lastSnap = -1;
				lastevent = null;
				inTransition = false;
			}
		},
		
		finish : function(event) {
			window.removeEventListener('touchmove', Playlist, false);
			window.removeEventListener('touchend', Playlist, false);
			this.shadow.hide();
			this.element.removeClassName('elevated');
			
			var target;
			if (this.lastSnap == -1)
				target = this.item;
			else {
				target = this.lastSnap;
				if ((target == this.item - 1) && (this.snapdir == 1))
					target++;
				else if ((target == this.item + 1) && (this.snapdir == 2))
					target--;
			}
console.log ("target:" + target + ".ti:" + this.item + ".sD:" + this.snapdir);
			
//			var target = (this.lastPos - this.offset) / _rowHeight;
			var ti = this.item;
//			if (target < this.item) target++;
//			target = parseInt(target);
			target = max (0, target);
			target = min (Playlist.numrows, target);
//console.log("target:" + target);

			var sArray = [ 'playlist', 'move', this.item, target ];
			var row;
			if (target >= Player.status.pl_first && target <= Player.status.pl_last &&
				ti > Player.status.pl_first && ti <= Player.status.pl_last)
				Player.addInhibit(false);
			else {
				for (var i = min(ti, target); i <= max(ti, target); i++) {
						row = Playlist.rows[i];
						row.style.webkitTransitionDuration = "0";
						row.style.webkitTransform = 'translateY(0px)';
				}
				callJSONRPC(sArray, function (r2) { Player.triggerUpdate(); });
				this.lastSnap = -1;
				return;
			}

			callJSONRPC(sArray, function (r2) {
				with (Player.status) {
//console.log("ti:" + ti + ".target:" + target + ".pf:" + pl_first);
					var row = alltracks[ti];
				 	alltracks.splice(ti - pl_first, 1);
				 	alltracks.splice(target - pl_first, 0, row);
				 	row = Playlist.rows[ti];
				 	if (target >= Playlist.numrows)
				 		Playlist.table.appendChild(row);
				 	else
				 		Playlist.table.insertBefore(row, Playlist.rows[(target > ti) ? target + 1 : target]);
				 	var fi = min(ti, target);
				 	var li = max(ti, target);
				 	for (var i = fi; i <= li; i++) {
				 		alltracks[i - pl_first]["playlist index"] = i;
				 		row = Playlist.rows[i];
/*					 	row.setAttribute('item', i);
					 	row.down('td', 0).update(i + 1);
						row.style.webkitTransitionDuration = "0s";
						row.style.webkitTransform = 'translateY(0px)';*/
						Playlist.updateRow(i, true);
					}
					if (ti == index)
						index = target;
					else if (index > ti && index <= target)
						index--;
					else if (index < ti && index >= target)
						index ++;
						
					Playlist.updateIndex();
					Playlist.cleanupChange(ti, false);
				}
				this.lastSnap = -1;
			}, function (r2) { Player.resetInhibit(false); });		
		},
		
		finishTrans : function() {
			Playlist.page.elPage.removeEventListener('webkitTransitionEnd', Playlist, false);
			Playlist.page.elPage.removeEventListener('transitionend', Playlist, false);
			this.inTransition = false;
			this.move(this.lastevent);
		},
		
		move : function (event) {
			this.lastevent = event;
			if (!this.inTransition) {
				var delta = 0;
				var eY = event.touches[0].screenY;
				if (eY < 45)
					delta = (eY < 25) ? (-2 * _rowHeight) : -_rowHeight;
				else if (eY > 365)
					delta = (eY > 390) ? (2* _rowHeight) : _rowHeight;
				if (delta) {
//console.log("scroll");
					this.inTransition = true;
					Playlist.page.elPage.addEventListener('webkitTransitionEnd', Playlist, false);
					Playlist.page.elPage.addEventListener('transitionend', Playlist, false);
					Playlist.page.vScroll(-delta, false, "0.2s");
					this.element.style.webkitTransitionDuration = "0.2s";
				} else
					this.element.style.webkitTransitionDuration = "0";
					
				this.element.style.webkitTransform = 'translateZ(1px) translateX(-1px) translateY(' + 
														(event.touches[0].screenY - this.startY -
														Playlist.page.posY + this.scroll0 + delta) + 'px)';
	
				var abspos = event.touches[0].screenY - 45 - Playlist.page.posY;
				if (abspos > this.lastPos) {
					var olditem = parseInt((this.lastPos - this.offset) / _rowHeight);
					var newitem = parseInt((abspos - this.offset) / _rowHeight);
					if (newitem >= this.item) newitem++;
					if (olditem >= this.item) olditem++;
					for (var i = olditem; i < newitem; i++) {
						var theitem = Playlist.rows[i];
						if (i != this.item) {
							theitem.style.webkitTransitionDuration = "0.2s";
							this.lastSnap = i;
							this.snapdir = 1;
						}
						if (i < this.item)
							theitem.style.webkitTransform = 'translateY(0px)';
						else if (i > this.item)
							theitem.style.webkitTransform = 'translateY(-' + _rowHeight + 'px)';
					}
				} else {
					var olditem = parseInt((this.lastPos - this.offset) / _rowHeight);
					var newitem = parseInt((abspos - this.offset) / _rowHeight);
					if (abspos < this.offset) newitem--;
					if (newitem >= this.item) newitem++;
					if (olditem >= this.item) olditem++;
					for (var i = olditem; i > newitem; i--) {
						var theitem = Playlist.rows[i];
						if (i != this.item) {
							theitem.style.webkitTransitionDuration = "0.2s";
							this.lastSnap = i;
							this.snapdir = 2;
						}
						if (i < this.item)
							theitem.style.webkitTransform = 'translateY(' + _rowHeight + 'px)';
						else if (i > this.item)
							theitem.style.webkitTransform = 'translateY(0px)';
					}
				}
				this.lastPos = abspos;
			}
			event.stopPropagation();
			event.preventDefault();
//console.log("move:" + event.touches[0].screenY + ".start:" + this.startY + ".s0:" + this.scroll0 + ".pY" + Playlist.page.posY);
		},
		
		start : function() {
			window.addEventListener('touchmove', Playlist, false);
			window.addEventListener('touchend', Playlist, false);
			with (Playlist.DnD) {
//console.log("startDnD:" + enabled + ".dsw:" + shadow + ".deDo:" + element.down('td', 1));
				element.removeClassName('depressed');
				lastSnap = -1;
				snapdir = 0;
				TID = null;
				element.addClassName('PLelevated');
				shadow.show();
//				shadow.style.webkitTransform = 'translateY(' + (item * _rowHeight - 18) + 'px)'; // workaround to fixup initial display
				element.down('td', 1).appendChild(shadow);
				shadow.style.webkitTransform = 'translateY(-18px)';
				element.style.webkitTransitionDuration = "0";
				element.style.webkitTransform = 'translateX(-1px) translateY(-1px)';
				enabled = true;
				lastPos = startY - 45 - scroll0;
				offset = lastPos - item * _rowHeight;
			}
		},
		
		cancel : function () {
			window.clearTimeout(this.TID);
//console.log("cancel");
			this.item = -1;
			this.element = null;
			this.TID = null;
			this.enabled = false;
			Playlist.allowSnap();
		}

	}
	
};

function findAttribute(el, attr) {
 	var el = el;
	el = Element.extend(el);
	while (el.hasAttribute === undefined) {
		el = Element.extend(el.parentNode);
		if (!el) return null;
	}
//console.log("el: " + el);
	if (el.hasAttribute === undefined) el = el.up();
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

function ScrollPage(scElem, stackpos, ipos, act, pEl, snf) {
	this.element = scElem;
//console.log("initSP: " + stackpos + ".:." + pEl + ".:." + scElem + ".snf:" + snf);
	this.elPage = (pEl) ? pEl : this.element;
	scElem.setAttribute("scrollPage", stackpos);
	this.stackpos = stackpos;
	this.array[stackpos] = this;
	this.pos = ipos;
	this.action = act;
	this.scrollnotify = snf;
	this.posY = 0;
	this.istop = (ipos) ? false : true;
}

ScrollPage.prototype.vScroll = function (ndY, immed, tme) {
	if (this.elPage.scrollHeight <= 320) return;
	if (!immed) {
		this.posY = this.posY + ndY;
		this.posY = max(this.posY, 320 - this.elPage.scrollHeight);
		this.posY = min(this.posY, 0);
//		var tdel = parseInt(Math.sqrt(abs(ndY) / 320) * 5) / 10;
//		this.elPage.webkitTransitionDelay = "-0.2s";
		if (tme)
			this.elPage.style.webkitTransitionDuration = tme;
		else
			this.elPage.style.webkitTransitionDuration = (ndY > 1500) ? "1.5s" : "1.0s";
console.log("ndY:" + ndY + ".tme:" + tme);
		this.elPage.style.webkitTransform = "translateY(" + this.posY + "px)";
		if (this.scrollnotify)
			this.scrollnotify(this.posY);
	} else {
		this.elPage.style.webkitTransitionDuration = "0";
		this.elPage.style.webkitTransform = "translateY(" + (this.posY + ndY) + "px)";		
	}
//console.log("scrollY: " + this.posY + ".dy:" + ndY + ".sH:" + this.elPage.scrollHeight);
}

ScrollPage.prototype.vScrollTo = function (newY, tme) {
	if (this.elPage.scrollHeight <= 320) {
		this.posY = 0;
		this.elPage.style.webkitTransitionDuration = "0";
		this.elPage.style.webkitTransform = "translateY(" + this.posY + "px)";
		return;
	}
	this.posY = newY;
	this.posY = max(this.posY, 320 - this.elPage.scrollHeight);
	this.posY = min(this.posY, 0);
	this.elPage.style.webkitTransitionDuration = (tme) ? tme : "0.5s";
	this.elPage.style.webkitTransform = "translateY(" + this.posY + "px)";
	if (this.scrollnotify)
		this.scrollnotify(this.posY);
}

ScrollPage.prototype.scrollTo = function (newX, inhibit, immed) {
	var ttop = 0;
	var newX = newX;
	if (!inhibit)
		for (var last = 0; last < this.array.length; last++)
			if (this.array[last].istop && (abs(last - this.stackpos) > 1)) {
//console.log("last:" + last + ".sp:" + this.stackpos);
				this.array[last].scrollTo((last > this.stackpos) ? -320 : 320, true);
				this.array[last].element.hide();
			}
	if (this.pos == newX) return;
	if (!this.initial && this.action)
		this.action();
	this.element.show();
	if (immed || (abs (this.pos - newX) < 32))
		this.element.style.webkitTransitionDuration = "0s";
	else
		this.element.style.webkitTransitionDuration = "0.5s";

	this.element.style.webkitTransform = "translateX(" + newX + "px)";
	

//console.log("pos: " + newX + ". sp:" + this.stackpos);
	if (newX == 0) {
		this.istop = true;
		for (var last = 0; last < this.array.length; last++)
			if (this.stackpos != last)
				this.array[last].istop = false;
	}

	if (inhibit) {
		this.pos = newX;
		return;
	}
	var otherone = null;
	var thirdone = null;
	var idec = newX;
	if (!newX) idec = this.pos;
	if (idec > 0) {
		otherone = this.array[this.stackpos + 1];
		if (this.stackpos)
			thirdone = this.array[this.stackpos - 1];
	}
	else if (this.stackpos) {
		otherone = this.array[this.stackpos - 1];
		thirdone = this.array[this.stackpos + 1];
	}
	if (otherone)
		otherone.scrollTo (((idec > 0) ? -320 : 320) + newX, true);
	if (thirdone)
		thirdone.scrollTo ((idec > 0) ? 320 : -320, true, true);
	this.pos = newX;
}

ScrollPage.prototype.fixDot = function (val) {
	if (this.istop || val) {
		Element.show("pdotb" + this.stackpos);
		Element.hide("pdote" + this.stackpos);
	} else {
		Element.show("pdote" + this.stackpos);
		Element.hide("pdotb" + this.stackpos);
	}
}

ScrollPage.prototype.fixDots = function () {
	for (var last = 0; last < ScrollPage.prototype.array.length; last++)
		ScrollPage.prototype.array[last].fixDot();
}

ScrollPage.prototype.find = function (sp) {
	if (sp <= this.array.length)
		return this.array[sp];
	else
		return null;
}

ScrollPage.prototype.doSwipe = function (sp) {
	var temp = ScrollPage.prototype.find(sp);
	if (temp) {
		temp.scrollTo(0);
		window.setTimeout(ScrollPage.prototype.fixDots, 500);
	}
}

ScrollPage.prototype.array = new Array;

function PluginCmd(tpe, id, url, params, cli, rF) {
	this.type = tpe;
	this.id = id;
	this.params = params;
	this.refreshFunction = rF;
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
			params.push(key + ((value) ? ':' + value : ''));
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
			ajaxUpdateDiv('NPmainbody', this.path, this.paramString(), (refresh) ? refreshNothing : toggleMainbody);
			Plugins.lastCmd = this;
		break;
		case "code":
//alert("code: " + refresh + " : " + this.refreshFunction);
			if (!refresh) {
				ajaxUpdateDiv('NPmainbody', this.path, this.paramString(), (refresh) ? refreshNothing : toggleMainbody);
				Plugins.lastCmd = this;
			} else if (this.refreshFunction) eval(this.refreshFunction);
		break;
		case "command":
		default:
//alert("code: " + refresh + " : " + this.refreshFunction);
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
	
	enforceRedraw : function () {
		this.timestamp = 0;
		window.setTimeout(Plugins.display, 100);		
	},

	display : function () {
	
		function addnameicon (pidiv, key, subsect) {
			var sect = document.createElement("span");
			var parent = document.createElement("a");
			sect.className = "NowPlayingPlugin NPPSpan";
			parent.style.color = "#f0f0f0";
			parent.className = "tapblock";
			parent.style.maxWidth = "320px";
			if (key.name) parent.title = key.name;
			if (key.url || key.cli) {
				Plugins.addCmd(new PluginCmd(key.type, subsect.id + "." + key.id, (key.url) ? key.url : key.cli, key.parameters, !(key.url), (key.refreshJS) ? key.refreshJS : null));
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
			if (key.html) {
				sect.innerHTML = key.html;
				inhibitSW = true;
				key.html.evalScripts();
				inhibitSW = false;
			};
			if (parent.firstChild) sect.appendChild(parent);
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
	if (ScrollPage.prototype.array.length < 4) {
		ScrollController.addMBody();
		Element.hide("pdotb3");
		Element.show("pdote3");
	} else ScrollPage.prototype.array[3].vScrollTo(0);
	ScrollPage.prototype.doSwipe(3)
}

fsOvON = false;

function goHome() {
	document.location = webroot + 'home.html?&player=' + player;
}

window.onload= function() {
//console.log("onLoad");
 	window.scrollTo (2,1);
// 	if (navigator.userAgent.include('3.0 Mobile'))
// 		xchgdiv = 'xchgdiv114';
//alert(navigator.userAgent);
 	Player.browser = Prototype.Browser.MobileSafari;
 	Player.init();
	Player.triggerUpdate();
	ScrollController.init();
}


