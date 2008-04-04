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


var Player = {
	status :  {
		power : null,
		mode : null,
		current_title : null,
		title : null,
		track : null,
		index : -1,
		time : 0,
		progStep : 0,
		duration : 0,
		volume : 0,
		timestamp : null,
		player : null,
		player_name : null,
		elapsed : null,
		shuffle : 0,
		repeat : 0,
		remote : null,
		sleep : false,
		alarm : null,
		tracks : 0,
		inhibit : 0,
		inhibit_tracks : 0,
		alltracks : null,
		pl_first : -1,
		pl_last : -1,
		trackStat : {
			on : null,
			value : -1
			}
	},
	regTimeout : null,
	specialTimeout : null,
	prgTimer : null,
	
	emptyTrack : {
		artwork_url : webroot + 'html/images/empty.png',
		artist : " ",
		title : "playlist empty",
		album : " "
	},
	
	evalUpdate : function(result) {
//$H(result).each(function(pair) { alert("key: " + pair.key + " value: " + pair.value); });
		with (this.status) {
			if (!result.playlist_tracks) this.updateBlank();
			if (result.duration !== undefined && (result.duration != duration)) this.updateDuration(result.duration);
			if (result.time !== undefined && (result.time != time)) this.updateTime(result.time);
			if (result.mode !== undefined && (result.mode != mode)) this.updateMode(result.mode);
			if (result.power !== undefined && (result.power != power)) this.updatePower(result.power);
			if (result["playlist repeat"] !== undefined && (result["playlist repeat"] != repeat))
				this.updateRepeatShuffle(result["playlist repeat"], "repeat");
			if (result["playlist shuffle"] !== undefined && (result["playlist shuffle"] != shuffle))
				this.updateRepeatShuffle(result["playlist shuffle"], "shuffle");
			if (result["mixer volume"] !== undefined && (result["mixer volume"] != volume)) this.updateVolume(result["mixer volume"]);
			if (result.playlist_cur_index !== undefined && (result.playlist_cur_index != index)) 
				this.updateIndex(result.playlist_cur_index, result.playlist_tracks, result.playlist_loop[0]);
			if (result.playlist_timestamp !== undefined && (result.playlist_timestamp > timestamp)) 
				this.updatePlaylist(result.playlist_tracks, result.playlist_timestamp);
			if (result.playlist_loop[0].title != track.title)
				this.updateInfo(result.playlist_loop[0]);
			if (result.will_sleep_in || sleep) this.updateSleep(result.will_sleep_in);
			this.updateAlarm();
		}
	},
	
	resetInhibit : function(uncon) { if (uncon) this.status.inhibit = 0; else this.status.inhibit--; },
	
	checkInhibit : function() { return (this.status.inhibit && this.status.inhibit_tracks == this.status.tracks); },
	
	addInhibit : function(isdel) {
		with (this.status) {
			if (!inhibit) inhibit_tracks = tracks;
			inhibit++;
			if (isdel) inhibit_tracks--;
		}
	},
	
	regularTimeout : function() {
		if (this.regTimeout)
			window.clearTimeout(this.regTimeout);
		this.regTimeout = window.setTimeout(Player.triggerUpdate, 15000);
	},
	
	trackendTimeout : function(sec) {
		if (this.specialTimeout)
			window.clearTimeout(this.specialTimeout);
		this.specialTimeout = window.setTimeout(Player.triggerUpdate, sec * 1000);
	},
	
	progressTimer : function() {
		if (this.prgTimer)
			window.clearInterval(this.prgTimer);
		this.prgTimer = window.setInterval(Player.updateProgress, 1000);
	},
	
	stopProgressTimer : function() {
		if (this.prgTimer) {
			window.clearInterval(this.prgTimer);
			this.prgTimer = null;
		}
	},
	
	updateBlank : function() {
		 with (this) {
		  	status.pl_first = -1;
		  	status.pl_last = -1;
		  	status.tracks = 0;
		  	status.alltracks = null;
			updateInfo(emptyTrack);
			updateDuration(0);
			updateTime(0);
			Playlist.update();
		}
	},
	
	updatePlaylist : function(numtracks, newtime) {
		with (this.status) {
			var numtracks = (numtracks !== undefined) ? numtracks : tracks;
			if (!this.checkInhibit()) {		// not exact but should work in 99% of cases
				tracks = numtracks;
				this.resetInhibit(true);
				this.populatePL();
			}
		}
	},
	
	updateSleep : function(slp) {
		if (this.status.sleep && !slp) {
			this.status.sleep = false;
			Element.hide('statustimer');
		} else if (!this.status.sleep && slp) {
			this.status.sleep = true;
			Element.show('statustimer');
		}
	},

	updateAlarm : function() {
		var sArray = [ 'alarms', '0', '8', 'filter:enabled' ];
		callJSONRPC(sArray, function (r2) {
				if (r2.result.count > 0)
					Element.show('statusalarm');
				else
					Element.hide('statusalarm');
			}, function (r2) {});
	},

	updateTrackStat : function() {
	 	if (this.status.track.remote && this.status.trackStat.on) {
	 		this.status.trackStat.on = false;
	 		this.status.trackStat.value = -1;
			$('iNowWrapperTop').style.height = '48';
		} else if (!this.status.track.remote) {
			var sArray = [ 'trackstat', 'getrating', this.status.track.id ];
			callJSONRPC(sArray, function (r2) {
	 			Player.doRefreshTS (r2.result.rating);
			}, function (r2) {});
		}
	},

	doRefreshTS : function(refnum) {
		if (!this.status.trackStat.on) {
			this.status.trackStat.on = true;
			$('iNowWrapperTop').style.height = '88';
		}
		this.status.trackStat.value = refnum;
		if ($('trackstat_star1'))
			for (var num = 1; num < 6; num++) {
				if (refnum >= num)
					$('trackstat_star' + num).src = webroot + 'html/images/fullstar.png';
				else
					$('trackstat_star' + num).src = webroot + 'html/images/nostar.png';
			}
	},

	populatePL : function(add, idx) {
		var pstart;
		var pnum;
		var add = (add) ? add : false;
		with (this.status) {
			var idx = (idx) ? idx : index;
			if (!alltracks || (pl_first - idx) >= maxPlLoop || (idx - pl_last) >= maxPlLoop)
				add = false;
			if (add) {
				if (idx  < pl_first) {
					pstart = max(pl_first - maxPlLoop, 0);
					pnum = pl_first - pstart;
				} else {
					pstart = pl_last + 1;
					pnum = maxPlLoop;
				}
			} else {
				if (idx > tracks - maxPlLoop)
					pstart = max (0, tracks - maxPlLoop);
				else
					pstart = "-";
				pnum = maxPlLoop;
			}
		}
		sArray = [ 'status', pstart, pnum, infoFulltags ];
		callJSONRPC(sArray, function (r2) {
			if (r2.result.playlist_loop !== undefined) {
				var firstnew = r2.result.playlist_loop.first()["playlist index"];
				var lastnew = r2.result.playlist_loop.last()["playlist index"];
				with (Player.status) {
					if (add) {
						if (lastnew < pl_first)
							alltracks = r2.result.playlist_loop.concat(alltracks);
						else if (firstnew > pl_last)
							alltracks = alltracks.concat(r2.result.playlist_loop);
						else alltracks = r2.result.playlist_loop;
					} else alltracks = r2.result.playlist_loop;
					pl_first = alltracks.first()["playlist index"];
					pl_last = alltracks.last()["playlist index"];
					tracks = pl_last - pl_first + 1;
					Player.updateIndex(r2.result.playlist_cur_index, r2.result.playlist_tracks);
					timestamp = r2.result.playlist_timestamp;
				}
				Player.updateInfo();
				Playlist.update(firstnew, lastnew);
			}
			Playlist.resetScroll();
		}, function (r2) { Playlist.resetScroll() });
	},
	
	updateRepeatShuffle : function(val, cmd) {
		var val = parseInt(val);
		this.status[cmd] = val;
		for (var i = 0; i < 3; i++)
			if (i == val)
				Element.show(cmd + 'control_' + i);
			else
				Element.hide(cmd + 'control_' + i);
	},
	
	updateInfo : function(loop) {
		function innerInfo (tr) {
			with (Player.status) {
				track = tr;
				refreshElement('songtitle', track.title);
				refreshElement('album', track.album || " ");
				refreshElement('artist', track.artist || remotestreaming);
				if (track.artwork_track_id)
					$('coverartpath').src = '/music/' + track.artwork_track_id + '/cover.jpg';
				else if (track.artwork_url)
					$('coverartpath').src = track.artwork_url;
				else if (track.remote)
					$('coverartpath').src = webroot + 'html/images/radio256.png';
				else
					$('coverartpath').src = webroot + 'html/images/cover.png';
			}
		};
		with (this.status) {
			if (loop) innerInfo(loop);
			else if (index >= pl_first && index <= pl_last)
				innerInfo(alltracks[index - pl_first]);
			if (index < pl_first || index > pl_last) 
				Player.populatePL(true);
			else if (index < Playlist.firstitem)
				Playlist.update(pl_first, min(Playlist.firstitem - 1, pl_last));
			else if (index > Playlist.lastitem)
				Playlist.update(max(Playlist.lastitem + 1, pl_first), pl_last);
		}
		Playlist.updateIndex();
		if ($('trackstat_star1'))
			Player.updateTrackStat();
	},
	
	updateIndex : function(idx, all, loop, enforce) {
		with (this.status) {
			if ((all && all != tracks) || enforce) {
				tracks = parseInt(all);
				refreshElement('songcount', all);
			}
			if (idx != index || enforce) {
				index = parseInt(idx);
				refreshElement('thissongnum', index + 1);
				this.updateInfo(loop);
				Plugins.refresh();
			}
		}
	},
	
	updatePower : function(pwr) {
		this.status.power = parseInt(pwr);
		if (this.status.power) {
			Element.hide('powerControlOff');
			Element.show('powerControlOn');
		} else {
			Element.hide('powerControlOn');
			Element.show('powerControlOff');
		}
	},
	
	updateVolume : function(vol) {
		var vol = (vol < 0) ? -vol : vol;
		if (this.status.volume == vol) return;
		this.status.volume = parseInt(vol);
		var intPos = parseInt((vol * _volumeBarWidth) / 100);
		
		$("volumeBar").style.width = intPos;
		$("volumeButton").style.left = intPos;
	},
	
	updateDuration : function(dur) {
		with (this.status) {
			duration = parseInt(dur);
			refreshElement('duration', timeStr(duration));
			if (duration)
				progStep = _progressBarWidth / duration;
			else progStep = 0;
			Player.updateProgress(0);
			if (mode == "play")
				Player.trackendTimeout(duration - time + 1);
		}
	},
	
	updateMode : function (md) {
		with (this.status) {
			mode = md;
			if (md == "play") {
				this.trackendTimeout(duration - time + 1);
				this.progressTimer();
				Element.hide('playercontrol_play');
				Element.show('playercontrol_active_play');
			} else {
				this.stopProgressTimer();
				Element.hide('playercontrol_active_play');
				Element.show('playercontrol_play');
			}
		}
	},
	
	updateTime : function(tim) {
		this.status.time = parseInt(tim);
		this.updateProgress(0);
	},
	
	updateProgress : function (add) {
		var add = (add != null) ? add : 1;
		with (Player.status) {
			if (add && mode =="play")
				time += add;
			refreshElement('elapsed', timeStr(time));
			$("progressBar").style.width = parseInt(time * progStep);
			$("progressButton").style.left = parseInt(time * progStep + 34);
		}
	},
	
	triggerUpdate : function() {
		var sArray = [ 'status', '-', 1, infoFewtags ];
		Player.controls.doExec(sArray);
		Player.regularTimeout();
		Playlist.testSnap(false);
//		Player.progressTimer();
	},
	
	controls : {
		doExec : function(sArray) {
			callJSONRPC(sArray, function (r2) {
				Player.evalUpdate(r2.result);
			}, function (r2) {});
		},
		
		doTrigger : function(sArray) {
			callJSONRPC(sArray, function (r2) {
				Player.triggerUpdate();
			}, function (r2) {});
		},

		volume : function(vol) {
			var sArray = [ 'mixer', 'volume', vol ];
			callJSONRPC(sArray, function (r2) {
				Player.updateVolume(vol);
			}, function (r2) {});
		},
		
		evtVolume : function(evt) {
			var level = parseInt((evt.clientX - 29) * 100 / _volumeBarWidth);
			if (level < 0) level = 0;
			if (level > 100) level = 100;
			Player.controls.volume(level);
		},
		
		time : function(nt) {
			var sArray = [ 'time', nt];
			Player.controls.doTrigger(sArray);
		},
		
		evtTime : function(evt) {
			var level = parseInt((evt.clientX - 82) * Player.status.duration / _progressBarWidth);
			if (level < 0) level = 0;
			level = min(level, Player.status.duration);
			Player.controls.time(level);
		},
		
		evtPlay : function(evt) {
			var sArray = [ 'play' ];
			callJSONRPC(sArray, function (r2) {
				Player.updateMode("play");
			}, function (r2) {});			
		},
		
		evtPause : function(evt) {
			var sArray = [ 'pause', 1 ];
			callJSONRPC(sArray, function (r2) {
				Player.updateMode("pause");
			}, function (r2) {});			
		},

		evtPrev : function(evt) {
			var sArray;
			if (Player.status.time < 10) {
				var sArray = [ 'playlist', 'index', '-1' ];
				Player.controls.doTrigger(sArray);
			} else Player.controls.time(0);
		},

		evtNext : function(evt) {
			var sArray = [ 'playlist', 'index', '+1' ];
			Player.controls.doTrigger(sArray);
		},
				
		evtIndex : function(idx) {
			var sArray = [ 'playlist', 'index', idx ];
			Player.controls.doTrigger(sArray);
		},
				
		evtRepeatShuffle : function(val, cmd) {
			var sArray = [ 'playlist', cmd, val ];
			if (cmd == "shuffle")
				Player.controls.doTrigger(sArray);
			else		
				callJSONRPC(sArray, function (r2) {
					Player.updateRepeatShuffle(val, cmd);
				}, function (r2) {});			
		},
				
		evtPower : function(num) {
			var sArray = [ 'power', num ];
			Player.controls.doTrigger(sArray);
		},

		evtTrackStat : function(num) {
			with (Player.status) {
				if (trackStat.value == -1)
					Player.updateTrackStat();
				else {
					if ((num == 1) && (trackStat.value == 1))
			 			num = 0;
					var sArray2 = [ 'trackstat', 'setrating', track.id, num ];
					callJSONRPC(sArray2, function (r2) { 
						Player.doRefreshTS(r2.result.rating);
					}, function (r2) {});
				}
			}
		}
	}
};

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

function PluginCmd(tpe, id, url, params) {
	this.type = tpe;
	this.id = id;
	this.params = params;
	var temp = url.indexOf("?");
	this.path = (temp > -1) ? url.substr(0, temp) : url;
	this.paramStub = (temp > -1) ? url.substr(temp + 1) : "";
//alert("type: " + this.type + ".id: " + this.id + ".params: " + "." + this.params + ".path: " + this.path + ".paramStub: " + this.paramStub);
}

PluginCmd.prototype.paramString = function() {
	var params = this.paramStub;
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
					params += "&" + pair.value + "=" + Player.status.track[pair.key];
			break;
			case "index":
				if (Player.status.track["playlist index"])
					params += "&" + pair.value + "=" + Player.status.track["playlist index"];
			break;
			case "playlist_name":
			case "playlist_id":
				if (Player.status[pair.key])
					params += "&" + pair.value + "=" + Player.status[pair.key];
			break;
			case "player":
				params += "&" + pair.value + "=" + player;
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
				ajaxRequest(this.path, this.paramStrin(), Player.triggerUpdate);
	}
};

var Plugins = {
	contentCmds : [],
	
	lastCmd : null,
	extID : null,
	
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

	display : function () {
	
		function addnameicon (pidiv, key, subsect) {
			var sect = document.createElement("span");
			var parent = document.createElement("a");
			sect.className = "NowPlayingPlugin NPPSpan";
			parent.style.color = "#f0f0f0";
			parent.className = "tapblock";
			parent.style.maxWidth = "320";
			if (key.name) parent.title = key.name;
			if (key.url) {
				Plugins.addCmd(new PluginCmd(key.type, subsect.id + "." + key.id, key.url, key.parameters));
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
			while (Plugins.extID.firstChild)
				Plugins.extID.removeChild(Plugins.extID.firstChild);
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
	
		}, function (r2) {});
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


