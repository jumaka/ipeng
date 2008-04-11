
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
				Plugins.checkTimestamp();
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
			});
		},
		
		doTrigger : function(sArray) {
			callJSONRPC(sArray, function (r2) {
				Player.triggerUpdate();
			});
		},

		volume : function(vol) {
			var sArray = [ 'mixer', 'volume', vol ];
			callJSONRPC(sArray, function (r2) {
				Player.updateVolume(vol);
			});
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
			});			
		},
		
		evtPause : function(evt) {
			var sArray = [ 'pause', 1 ];
			callJSONRPC(sArray, function (r2) {
				Player.updateMode("pause");
			});			
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
				});			
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