
var Player = {
	status :  {
		buttons : false,
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
	browser: false,
	volumeCtrl : null,
	progressCtrl : null,
	
	emptyTrack : {
		artwork_url : webroot + 'html/images/empty.png',
		artist : " ",
		title : "playlist empty",
		album : " "
	},
	
	evalUpdate : function(result) {
//$H(result).each(function(pair) { alert("key: " + pair.key + " value: " + pair.value); });
//		if (!ScrollController.inited) ScrollController.init();
		with (this.status) {
			if (!result.playlist_tracks) this.updateBlank();
			if (result.duration !== undefined && (result.duration != duration)) this.updateDuration(result.duration);
			if (result.time !== undefined && (result.time != time)) this.updateTime(result.time);
			if (result.mode !== undefined && (result.mode != mode)) this.updateMode(result.mode);
			if (result.power !== undefined && (result.power != power)) this.updatePower(result.power);
			if (result.player_name !== undefined && (result.player_name != player_name))
				this.updatePlayerName(result.player_name);
			if (result["mixer volume"] !== undefined && (result["mixer volume"] != volume)) this.updateVolume(result["mixer volume"]);
			if (result.playlist_cur_index !== undefined && (result.playlist_cur_index != index)) 
				this.updateIndex(result.playlist_cur_index, result.playlist_tracks, result.playlist_loop[0]);
			if (result.playlist_timestamp !== undefined && (result.playlist_timestamp > timestamp)) 
				this.updatePlaylist(result.playlist_tracks, result.playlist_timestamp);
			if (result.playlist_loop[0].title != track.title)
				this.updateInfo(result.playlist_loop[0]);
			if (!buttons) {
				if (result["playlist repeat"] !== undefined && (result["playlist repeat"] != repeat))
					this.updateRepeatShuffle(result["playlist repeat"], "repeat");
				if (result["playlist shuffle"] !== undefined && (result["playlist shuffle"] != shuffle))
					this.updateRepeatShuffle(result["playlist shuffle"], "shuffle");
			}
			if (result.will_sleep_in || sleep) this.updateSleep(result.will_sleep_in);
			this.updateAlarm();
			Plugins.checkTimestamp();
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
	
	updatePlayerName : function (newname) {
		this.status.player_name = newname;
		$('playerName').update(newname);
	},
	
	switchPlayer : function (newplayer) {
//alert(newplayer);
		if (newplayer == playerid) return;
		player = escape(newplayer);
		Player.status.player = newplayer;
		playerid = newplayer;
		Player.triggerUpdate(true);
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
			});
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
			});
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
		}, function (r2) { Playlist.resetScroll() }, playerid, true);
	},
	
	updateRepeatShuffle : function(val2, cmd, custom) {
		var val;
		if (custom) {
			val = val2;
			var temp = $(cmd + 'control_custom');
			if (val.icon.indexOf('btn_thumbs_up') != -1) val.icon = "html/images/thumbs_up.png";
			else if (val.icon.indexOf('btn_thumbs_down') != -1) val.icon = "html/images/thumbs_down.png";
			else if (val.icon.indexOf('rew') != -1) val.icon = "html/images/rewd.png";
			else if (val.icon.indexOf('fwd') != -1) val.icon = "html/images/ffwd.png";
			else if (val.icon.indexOf('love') != -1) val.icon = "html/images/love_s.png";
			else if (val.icon.indexOf('_ban') != -1) val.icon = "html/images/ban_s.png";
			temp.style.backgroundImage = 'url(' + webroot + val.icon + ')';
			temp.title = val.tooltip;
			Element.hide(cmd + 'control_content');
			temp.show();
		} else {
			var temp = $(cmd + 'control_content');
			val = parseInt(val2);
			Element.hide(cmd + 'control_custom');
			temp.style.backgroundPosition = "left " + val * 21;
			temp.title = srstrings[cmd][val];
			temp.show();
		}
		this.status[cmd] = val;
/*		for (var i = 0; i < 3; i++)
			if (i == val)
				Element.show(cmd + 'control_' + i);
			else
				Element.hide(cmd + 'control_' + i);*/
	},
	
	updateInfo : function(loop) {
		function innerInfo (tr) {
			with (Player.status) {
				track = tr;
				refreshElement('songtitle', track.title);
				refreshElement('album', track.album || " ");
				refreshElement('artist', track.artist || remotestreaming);
				if (track.coverart)
					$('coverartpath').src = '/music/' + track.id + '/cover_320x320_f.jpg';
				else if (track.artwork_track_id)
					$('coverartpath').src = '/music/' + track.artwork_track_id + '/cover_320x320_f.jpg';
				else if (track.artwork_url)
					$('coverartpath').src = track.artwork_url;
				else if (track.remote)
					$('coverartpath').src = webroot + 'html/images/radio256.png';
				else
					$('coverartpath').src = webroot + 'html/images/cover.png';
				if (track.buttons) {
					if (track.buttons.shuffle) Player.updateRepeatShuffle(track.buttons.shuffle, 'shuffle', true);
					if (track.buttons.repeat) Player.updateRepeatShuffle(track.buttons.repeat, 'repeat', true);
					buttons = true;
				} else if (buttons) {
					Player.updateRepeatShuffle(shuffle, 'shuffle');
					Player.updateRepeatShuffle(repeat, 'repeat');
					buttons = false;
				} else buttons = false;
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
		Plugins.enforceRedraw();
		Plugins.refresh();
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
		if (this.volumeCtrl)
			this.volumeCtrl.setVolume(vol);
/*		var intPos = parseInt((vol * _volumeBarWidth) / 100);
		
		$("volumeBar").style.width = intPos;
		$("volumeButton").style.left = intPos;*/
	},
	
	updateDuration : function(dur) {
		with (this.status) {
			duration = parseInt(dur);
			refreshElement('duration', timeStr(duration));
			if (duration)
				progStep = 100 / duration;
//				progStep = _progressBarWidth / duration;
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
			if (Player.progressCtrl)
				Player.progressCtrl.setVolume(time * progStep, false, true);
//			$("progressBar").style.width = parseInt(time * progStep);
//			$("progressButton").style.left = parseInt(time * progStep + 29);
		}
	},
	
	triggerUpdate : function(enforce) {
		if (enforce) {
			Player.status.timestamp = 0;
			Plugins.timestamp = 0;
		}
		var sArray = [ 'status', '-', 1, infoFewtags ];
		Player.controls.doExec(sArray);
		Player.regularTimeout();
		Playlist.testSnap(false);
//		Player.progressTimer();
	},
	
	init : function() {
		this.volumeCtrl = new VolumeBarCtrl($('volumeButton'), $('volumeBar'), $('textOSD'),
											this.status.volume, this.controls.volume); 
		this.progressCtrl = new VolumeBarCtrl($('progressButton'), $('progressBar'), $('textOSD'),
											this.status.time, this.controls.timeRel, 
											_progressBarWidth, _progressBarOffset, 
											this.controls.formatTimePercent); 
	},
	
	controls : {
		doExec : function(sArray) {
			callJSONRPC(sArray, function (r2) {
				Player.evalUpdate(r2.result);
			});
		},
		
		doTrigger : function(sArray) {
			callJSONRPC(sArray, function (r2) {
				Player.triggerUpdate();
			});
		},

		volume : function(vol, inhibit) {
			var vol = parseInt(vol);
			var sArray = [ 'mixer', 'volume', vol ];
			callJSONRPC(sArray, function (r2) {
				if (!inhibit)
					Player.updateVolume(vol);
			});
		},
		
		time : function(nt) {
			var sArray = [ 'time', nt];
			Player.controls.doTrigger(sArray);
		},
		
		timeRel : function(nt, inhibit) {
			if (!inhibit)
				Player.controls.time(parseInt(nt / Player.status.progStep));
		},
		
		formatTimePercent : function(pct) {
			return timeStr(parseInt(pct / Player.status.progStep));
		},
		
		evtPlay : function(evt) {
			var sArray = [ 'play' ];
			Player.controls.doTrigger(sArray);
//			callJSONRPC(sArray, function (r2) {
//				Player.updateMode("play");				
//			});			
		},
		
		evtPause : function(evt) {
			var sArray = [ 'pause', 1 ];
			callJSONRPC(sArray, function (r2) {
				Player.updateMode("pause");
			});			
		},

		evtPrev : function(evt) {
/*			var sArray;
			if (Player.status.time < prev_threshold) {
				var sArray = [ 'playlist', 'index', '-1' ];
				Player.controls.doTrigger(sArray);
			} else Player.controls.time(0);*/
			var sArray = [ 'button', 'jump_rew' ];
			Player.controls.doTrigger(sArray);			
		},

		evtNext : function(evt) {
//			var sArray = [ 'playlist', 'index', '+1' ];
			var sArray = [ 'button', 'jump_fwd' ];
			Player.controls.doTrigger(sArray);
		},
				
		evtIndex : function(idx) {
			var sArray = [ 'playlist', 'index', idx ];
			Player.controls.doTrigger(sArray);
		},
				
		evtRepeatShuffle : function(val, cmd) {
			if (val == "custom")
				Player.controls.doTrigger(Player.status[cmd].command);
			else {
				var tmp = Player.status[cmd];
				if (cmd == "shuffle") {
					tmp = (tmp + 1) % 3;
					Player.controls.doTrigger([ 'playlist', cmd, tmp ]);
				} else {
					tmp = (tmp + 2) % 3;
					callJSONRPC([ 'playlist', cmd, tmp ], function (r2) {
						Player.updateRepeatShuffle(tmp, cmd);
					});
				}
			}
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
					});
				}
			}
		}
	}
};


var ScrollController = {
	posX : 0,
	posY : 0,
	startX : 0,
	startY : 0,
	dx : 0,
	dy : 0,
	page : null,
	hasmoved : false,
	target : null,
	Tstarted : false,
	direction : 0,		//null, 1: x, 2: y
	
	
	interactionStart : function(evt) {
console.log("start " + evt.touches[0].screenX + ".id:" + evt.touches[0].identifier);
//var op = this.page;
		if (this.Tstarted) return;
//console.log("start proc");
		this.Tstarted = true;
		this.page = ScrollPage.prototype.find(findAttribute(evt.touches[0].target, "scrollPage"));
//console.log("oldpage:" + ((op) ? op.stackpos : "null") + " .new:" + ((this.page) ? this.page.stackpos : "null"));
		this.startX = evt.touches[0].screenX;
		this.startY = evt.touches[0].screenY;
		this.posX = this.startX;
		this.posY = this.startY;
		this.dx = 0;
		this.dy = 0;
		this.direction = null;
		this.target = evt.touches[0].target;
		this.hasmoved = false;
		this.idStart = evt.touches[0].identifier;
//		this.duplicateEvent(evt, 0, 0);
		evt.preventDefault();
	},
	
	interactionMove : function(evt) {
		if ((this.posX == evt.touches[0].screenX) && (this.posY == evt.touches[0].screenY))
			return;
		this.dx = evt.touches[0].screenX - this.posX;
		this.dy = evt.touches[0].screenY - this.posY;
		this.posX = evt.touches[0].screenX;
		this.posY = evt.touches[0].screenY;
		this.hasmoved = true;
		if (!this.direction)
			if (abs(this.posX - this.startX) > abs(this.posY - this.startY)) {
				if (abs(this.posX - this.startX) > 0)
					this.direction = 1;
			} else {
				if (abs(this.posY - this.startY) > 0)
					this.direction = 2;
			}
		if (this.direction == 1)
			this.moveX(evt);
		else if (this.direction == 2)
			this.moveY(evt);
//		evt.preventDefault();
	},
	
	interactionEnd : function(evt) {
//console.log("end " + evt.changedTouches.item(0).screenX);
		if (!this.Tstarted) return;
		this.Tstarted = false;
		if (this.direction == 1)
			this.finishX(evt);
		else if (this.direction == 2)
			this.finishY(evt);
		else this.finishClick(evt);
//		this.duplicateEvent(evt, 0, 0);
		evt.preventDefault();
	},
	
	transitionDone : function(evt) {
		if (this.direction == 1)
			ScrollPage.prototype.fixDots();
	},
	
	moveX : function(evt) {
//console.log("moveX" + (this.posX - this.startX) + ".pg:" + this.page);
		if (this.page)
			this.page.scrollTo(this.posX - this.startX);
//		evt.stopPropagation();
		var diff = evt.touches[0].screenY - this.startY;
		this.posY = this.startY;
		this.duplicateEvent(evt, 0, diff);
	},
	
	moveY : function(evt) {
		if (this.page)
			this.page.vScroll(this.posY - this.startY, true);
		var diff = evt.touches[0].screenX - this.startX;
		this.posX = this.startX;
//		this.duplicateEvent(evt, diff, 0);
		evt.preventDefault();
	},
	
	finishX : function(evt) {
		if (evt.changedTouches.item(0))
			if (this.posX != evt.changedTouches[0].screenX) {
				this.dx = evt.changedTouches[0].screenX - this.posX;
				this.posX = evt.changedTouches[0].posX;
				if (this.page)
					this.page.scrollTo(this.posX - this.startX);
			}
		if (!this.page) return;
		if ((this.posX - this.startX) > 130 || this.dx > 10) {
			if (this.page.array[this.page.stackpos + 1])
				this.page.scrollTo(320);
			else
				this.page.scrollTo(0);
		} else if ((this.startX - this.posX) > 130 || this.dx < -10) {
			if (this.page.stackpos)
				this.page.scrollTo(-320);
			else
				this.page.scrollTo(0);
		} else
			this.page.scrollTo(0);
	},
	
	finishY : function(evt) {
		if (evt.changedTouches.item(0))
			if (this.posY != evt.changedTouches[0].screenY) {
				this.dy = evt.changedTouches[0].screenY - this.posY;
				this.posY = evt.changedTouches[0].posY;
				if (this.page)
					this.page.scrollTo(this.posY - this.startY);
			}
		if (!this.page) return;
		if (abs(this.dy) > 5)
			this.page.vScroll(this.posY - this.startY + this.dy * abs(this.dy));//scrollFactor);
		else
			this.page.vScroll(this.posY - this.startY);
	},
	
	finishClick : function(evt) {
		var newEvt = document.createEvent('MouseEvents');
		newEvt.initMouseEvent('click', true, true, window, 1, 
				this.posX, this.posY, this.posX, this.posY, 
				false, false, false, false, 0, null);
		this.target.dispatchEvent(newEvt);
	},
	
	init : function() {
		this.addBox($('coverart'), 1, 0, null);
		this.addBox($('playlistNow'), 0, 320, null, $('playlisttableNow'));
		this.addBox($('extWrapper'), 2, -320, null, $('extension'));
	},
	
	addBox : function(element, stack, pos, act, pEl) {
		new ScrollPage(element, stack, pos, act, pEl);
		element.addEventListener('touchstart', this, false);
		element.addEventListener('touchmove', this, false);
		element.addEventListener('touchend', this, false);
		element.addEventListener('webkitTransitionEnd', this, false);
	},
	
	addMBody : function() {
		this.addBox($('NPwrapperBody'), 3, -320, null, $('NPmainbody'));
	},
	
	duplicateEvent : function(evt, xd, yd) {
		var nT = (evt.touches.item(0)) ? 
					document.createTouchList(document.createTouch(evt.view, evt.touches[0].target,
											 evt.touches[0].identifier, evt.touches[0].pageX - xd,
											 evt.touches[0].pageY - yd, evt.touches[0].screenX - xd,
											 evt.touches[0].screenY - yd)) 
					: new TouchList;
		var tT = (evt.targetTouches.item(0)) ? 
					document.createTouchList(document.createTouch(evt.view, evt.targetTouches[0].target,
											 evt.targetTouches[0].identifier, evt.targetTouches[0].pageX - xd,
											 evt.targetTouches[0].pageY - yd, evt.targetTouches[0].screenX - xd,
											 evt.targetTouches[0].screenY - yd)) 
					: new TouchList;
		var cT = (evt.changedTouches.item(0)) ?
					document.createTouchList(document.createTouch(evt.view, evt.changedTouches[0].target,
											 evt.changedTouches[0].identifier, evt.changedTouches[0].pageX - xd,
											 evt.changedTouches[0].pageY - yd, evt.changedTouches[0].screenX - xd,
											 evt.changedTouches[0].screenY - yd))
					: new TouchList;
		evt.preventDefault();
//		evt.stopPropagation();
		var newEvt = document.createEvent('TouchEvent');
		newEvt.initTouchEvent(evt.type, evt.bubbles, evt.cancelable, evt.view, evt.detail, 
								evt.screenX, evt.screenY, evt.clientX, evt.clientY, evt.crtlKey, evt.altKey, 
								evt.shiftKey, evt.metaKey, nT, tT, cT, 
								evt.scale, evt.rotation);
		if (evt.touches.item(0))
			evt.touches[0].target.dispatchEvent(newEvt);
		else if (evt.target)
			evt.target.dispatchEvent(newEvt);
		else if (evt.changedTouches.item(0))
			evt.changedTouches[0].target.dispatchEvent(newEvt);
//console.log ("dispatch " + newEvt.type + "." + newEvt.touches);
	},
	
handleEvent : function (event) {
  // dispatch the event to the right method based on the type
		switch (event.type) {
			case 'touchstart' :
				this.interactionStart(event);
				break;
			case 'touchmove' :
				this.interactionMove(event);
				break;
			case 'touchend' :
				this.interactionEnd(event);
				break;
			case 'webkitTransitionEnd' :
				this.transitionDone(event);
				break;
		}
	},

};

function VolumeBarCtrl(knob, left, text, vol, callback, width, offset, formatCB) {
	this.knob = knob;
	this.left = left;
	this.text = text;
	this.width = (width) ? width : _volumeBarWidth;
	this.offset = (offset) ? offset : _volumeBarOffset;
	this.volume = vol;
	this.callback = callback;
	this.cbtid = null;
	this.inchg = false;
	this.formatCB = (formatCB) ? formatCB : null;
	this.knob.addEventListener('touchstart', this, false);
	this.knob.addEventListener('touchmove', this, false);
	this.knob.addEventListener('touchend', this, false);
}

VolumeBarCtrl.prototype.handleEvent = function (event) {
	switch (event.type) {
		case 'touchstart' :
			this.inchg = true;
			if (this.formatCB)
				this.text.update(this.formatCB(this.volume));
			else this.text.update(this.volume);
			this.text.show();
			break;
		case 'touchmove' :
			var level = (event.touches[0].clientX - this.offset) * 100 / this.width;
			if (level < 0) level = 0;
			if (level > 100) level = 100;
//console.log("bm:" + event.clientX + ".lvl:" + level);
			this.setVolume(level, true);
			break;
		case 'touchend' :
			this.text.update("");
			this.text.hide();
			this.inchg = false;
			if (this.callback) this.callback(this.volume);
			break;
	}
	event.stopPropagation();
	event.preventDefault();
}

VolumeBarCtrl.prototype.setVolume = function (vol, internal, inhibit) {
	if (this.inchg && !internal) return;
	var intPos = parseInt((vol * this.width) / 100);
	this.volume = vol;
//console.log("vol:" + vol + ".initPos:" + initPos + ".width:" + this.width + ".off:" + this.offset);	
//	this.left.style.width = intPos;
	this.left.style.webkitTransform = "scaleX(" + intPos + ")";
	this.knob.style.webkitTransform = "translateX(" + intPos + "px)";
//	this.knob.style.left = intPos;
	if (this.inchg)
		if (this.formatCB)
			this.text.update(this.formatCB(vol));
		else this.text.update(parseInt(vol));
	if (this.callback && !inhibit)
		StaticTimer.trigger (this.callback, vol, true, 10);
}

var StaticTimer = {
	tid : null,
	callback : null,
	val1 : 0,
	val2 : 0,
	
	trigger : function (cb, v1, v2, to) {
		this.callback = cb;
		this.val1 = v1;
		this.val2 = v1;
		if (!this.tid)
			this.tid = window.setTimeout(StaticTimer.execute, to);
	},
	
	execute : function () {
		StaticTimer.tid = null;
		if (StaticTimer.callback)
			StaticTimer.callback (StaticTimer.val1, StaticTimer.val2);
	}
};