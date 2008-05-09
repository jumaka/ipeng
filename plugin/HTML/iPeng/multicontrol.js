
mplayer_control = function (id, name, power, isplayer, canpoweroff, sn) {
	this.name = name;
	this.id = id;
	this.isplayer = isplayer;
	this.canpoweroff = canpoweroff;
	this.master = 0;
	this.volume = 00;
	this.mode = null;
	this.power = power;
	this.sn = sn;
	this.sync = 0;
	this.repeat = null;
	this.displaystate = 0;	// full display;
	this.synced_to = null;
	
	this.container = null;
	this.e_name = null;
	this.e_volume = null;
	
	this.draw();
}

mplayer_control.prototype.draw = function () {
	this.frame = new Element ('div', { 'class' : 'm_frame' });
	this.frame.setAttribute('master', this.id);
	this.container = new Element ('div', { 'class' : 'multicontainer'});
	this.container.setAttribute('player', this.id);
	
	var temp = new Element ('div', { 'class' : 'm_topwrap' });
	this.e_name = new Element ('span', { 'class' : 'm_playertext',
			onclick : 'Player.switchPlayer(findAttribute(this, "player"));'
			}).update(this.name);
	if (this.id == playerid)
		this.e_name.addClassName('m_white');
	temp.appendChild(this.e_name);
	this.topbuttons = new Element ('span', { 'class' : 'm_topbuttons' });
	temp.appendChild(this.topbuttons);
	this.container.appendChild(temp);
		
	this.e_volume = new Element ('div', { 'class' : 'm_volumeControl', onclick : 'Mplayer(this).evtVolume(event);'});
	this.e_novolume = new Element ('span', 
		{ 'class' : 'm_text topbartextNow m_topbartextBright',
		  style : 'display: ' + ((this.isplayer) ? 'none;' : 'block;') }
		).update('[% "IPENG_NO_VOLUME_CTRL" | string %]');
	this.e_volume.appendChild(this.e_novolume);
	this.e_volume_bar = new Element('div',
		{ style : 'display: ' + ((this.isplayer) ? 'block;' : 'none;') });
	this.e_volume_bar.appendChild(new Element('img', { 
		src : webroot + 'html/images/VolumeBlueCap.png',
		style : 'position: absolute; left: 4; top: 5' }));
	this.e_volume_bar.appendChild(new Element('img', { 
		src : webroot + 'html/images/VolumeWhiteMusicFill.png',
		style : 'position: absolute; left: 9; top: 5; width: 262; height: 9;' }));
	this.e_volume_bar.appendChild(new Element('img', { 
		src : webroot + 'html/images/VolumeWhiteMusicCap.png',
		style : 'position: absolute; left: 271; top: 5' }));
	this.e_volumeBar = new Element('img', { 
		src : webroot + 'html/images/VolumeBlueFill.png',
		style : 'position: absolute; left: 9; top: 5; width: 1; height: 9;' });
	this.e_volume_bar.appendChild(this.e_volumeBar);
	this.e_volumeButton = new Element('img', { 
		src : webroot + 'html/images/MusicVolumeKnob.png',
		style : 'position: absolute; left: 0; top: 0' });
	this.e_volume_bar.appendChild(this.e_volumeButton);
	this.e_volume.appendChild(this.e_volume_bar);	
	this.container.appendChild(this.e_volume);

	this.e_text = new Element ('div', { 'class' : 'm_text topbartextNow' });
	this.track = new Element ('span', { 'class' : 'm_separator' });
	this.title = new Element ('span', { 'class' : 'm_topbartextBright m_separator' });
	this.artist = new Element ('span', { 'class' : 'm_separator' });
	this.album = new Element ('span', { 'class' : 'm_topbartextBright m_separator' });
	this.e_text.appendChild(this.track);
	this.e_text.appendChild(this.title);
	this.e_text.appendChild(this.artist);
	this.e_text.appendChild(this.album);
	this.container.appendChild(this.e_text);
	
	this.e_ctrls = new Element ('table', { width : '312', cellspacing : '0', cellpadding : '0' });
	var tr = new Element ('tr');
	this.e_ctrls.appendChild(tr);
	this.td_power = new Element ('td', { align : 'left', width : '40' });
	tr.appendChild(this.td_power);
	this.e_power_on = new Element('div', { onclick : 'Mplayer(this).evtPower(0)',
		'class' : 'm_NPSprites',
		style : 'display: ' + ((this.power && this.canpoweroff) ? 'block;' : 'none;') +
				'background-position: left 150; width: 40; height: 30; overflow: hidden; float: left;',
		title : '[% "ON" | string %]' });
	this.e_power_off = new Element('div', { onclick : 'Mplayer(this).evtPower(1)',
		'class' : 'm_NPSprites',
		style : 'display: ' + ((this.power || !this.canpoweroff) ? 'none;' : 'block;') + 
				'background-position: left 180; width: 40; height: 30; overflow: hidden;',
		title : '[% "OFF" | string %]' });
	this.td_power.appendChild (this.e_power_on);
	this.td_power.appendChild (this.e_power_off);
	temp = new Element ('td', { align : 'center' });
	tr.appendChild(temp);
	this.e_prev = new Element('div', { onclick : 'Mplayer(this).evtPrev()',
		'class' : 'm_NPSprites',
		style : 'background-position: left 120; width: 31; height: 23; overflow: hidden;',
		title : '[% "PREVIOUS" | string %]' });
	temp.appendChild (this.e_prev);
	temp = new Element ('td', { align : 'left', width : '40' });
	tr.appendChild(temp);
	this.e_play = new Element('div', { onclick : 'Mplayer(this).evtPause()',
		'class' : 'm_NPSprites',
		style : 'background-position: left 30; width: 30; height: 27; overflow: hidden;',
		title : '[% "PAUSE" | string %]' });
	this.e_pause = new Element('div', { onclick : 'Mplayer(this).evtPlay()',
		'class' : 'm_NPSprites',
		style : 'display: none; background-position: left 60; width: 30; height: 27; overflow: hidden;',
		title : '[% "PLAY" | string %]' });
	temp.appendChild (this.e_pause);
	temp.appendChild (this.e_play);
	temp = new Element ('td', { align : 'center' });
	tr.appendChild(temp);
	this.e_next = new Element('div', { onclick : 'Mplayer(this).evtNext()',
		'class' : 'm_NPSprites',
		style : 'background-position: left 90; width: 31; height: 23; overflow: hidden;',
		title : '[% "NEXT" | string %]' });
	temp.appendChild (this.e_next);
	this.td_sync = new Element ('td', { align : 'right', style : 'width: 40;' });
	tr.appendChild(this.td_sync);
	this.e_sync_do = new Element('img', {  onclick : 'Mplayer(this).startSync()',
		src : webroot + 'html/images/sync.png',
		style : 'display: block; float: right;' });
	this.e_sync = this.e_sync_do;
	this.td_sync.appendChild (this.e_sync_do);
	this.e_sync_active = new Element('img', { src : webroot + 'html/images/sync_active.png',
		style : 'display: none; float: right;' });
	this.td_sync.appendChild (this.e_sync_active);
	this.e_unsync = new Element('img', { onclick : 'Mplayer(this).unSync()',
		src : webroot + 'html/images/unsync2.png',
		style : 'display: none; float: right;' });
	this.topbuttons.appendChild (this.e_unsync);
	this.e_sn = new Element('img', { onclick : 'Mplayer(this).disconnectSN()',
		src : webroot + 'html/images/NetOn.png',
		style : 'display: none; float: right;' });
	this.topbuttons.appendChild (this.e_sn);
	this.container.appendChild(this.e_ctrls);
	
	this.frame.appendChild(this.container);
	$('multicontrol').appendChild(this.frame);

	this.updateOther();
}
mplayer_control.prototype.all = [];

mplayer_control.prototype.updateBasic = function (id, name, power, isplayer, canpoweroff, sn) {
	if (id) this.id = id;
	if (name) {
		this.name = name;
		this.e_name.update(name);
	}
	if (this.id == playerid) {
		if (!this.e_name.hasClassName('m_white'))
			this.e_name.addClassName('m_white');
	} else
		if (this.e_name.hasClassName('m_white'))
			this.e_name.removeClassName('m_white');
			
	this.canpoweroff = canpoweroff;
	this.updatePower(power);

	this.isplayer = isplayer;
	if (isplayer) { this.e_novolume.hide(); this.e_volume_bar.show(); }
	else { this.e_volume_bar.hide(); this.e_novolume.show(); }
	
	this.sn = sn;
	this.updateOther();
}

mplayer_control.prototype.updateOther = function () {
	var a_this = this;
	if (this.sn) {
		this.e_sn.show();
		this.e_ctrls.hide();
		this.e_text.hide();
		this.e_volume.hide();
	} else {
		callJSONRPC([ 'status', '-', 1, 'tags:al' ], function (r2) {
			if (r2.result.sync_master && (r2.result.sync_master != a_this.id)) {
//alert("SM: " + r2.result.sync_master + " id: " + a_this.id);
				a_this.synced_to = r2.result.sync_master;
				a_this.topbuttons.appendChild(a_this.e_power_on);
				a_this.topbuttons.appendChild(a_this.e_power_off);
				a_this.topbuttons.appendChild(a_this.e_unsync);
				a_this.e_unsync.show();
				a_this.e_ctrls.hide();
				a_this.e_text.hide();
				a_this.container.addClassName('m_darksquare');
				a_this.find(r2.result.sync_master).frame.appendChild(a_this.container);
				a_this.frame.hide();
			} else if (a_this.synced_to || a_this.e_sn.visible()) {
//alert("USM: " + r2.result.sync_master + " id: " + a_this.id);
				a_this.synced_to = null;
				a_this.td_power.appendChild(a_this.e_power_on);
				a_this.td_power.appendChild(a_this.e_power_off);
				a_this.e_unsync.hide();
				a_this.e_ctrls.show();
				a_this.e_text.show();
				a_this.e_sn.hide();
				a_this.e_volume.show();
				a_this.container.removeClassName('m_darksquare');
				a_this.frame.appendChild(a_this.container);
				a_this.frame.show();
			} else if (r2.result.sync_master && (r2.result.sync_master == a_this.id)) {
				a_this.synced_to = null;
				a_this.td_sync.appendChild(a_this.e_unsync);
				a_this.e_unsync.show();
				a_this.e_sync.hide();
			}
			else {
				a_this.synced_to = null;
				a_this.e_unsync.hide();
				a_this.e_sync.show();
			}
			
			if (r2.result.mode !== undefined) a_this.updateMode(r2.result.mode);

			var temp = parseInt(r2.result.playlist_cur_index) + 1;
			a_this.track.update(temp + ' / ' + r2.result.playlist_tracks);
			if (r2.result.playlist_loop) {
				if (r2.result.playlist_loop[0].title)
					a_this.title.update(r2.result.playlist_loop[0].title);
				if (r2.result.playlist_loop[0].artist)
					a_this.artist.update(r2.result.playlist_loop[0].artist);
				if (r2.result.playlist_loop[0].album)
					a_this.album.update(r2.result.playlist_loop[0].album);					
			}
			
			a_this.updateVolume((r2.result['mixer volume'] !== undefined) ? parseInt(r2.result['mixer volume']) : a_this.volume);
			
		}, function (r2) {}, this.id);
	}
}

mplayer_control.prototype.find = function (id) {
	var found = null;
	this.all.each(function(el) {
			if (el.id == id) found = el;
		});
	return found;
}

mplayer_control.prototype.tid = null;

mplayer_control.prototype.refresh = function () {
	var currentplayers = [];
	mplayer_control.prototype.all.each(function (plr) { 
	currentplayers.push(plr.id); });
	callJSONRPC(['serverstatus', 0, 255 ], function (r2) {
		if (r2.result['player count'])
			r2.result.players_loop.each(function(plr) {
//alert("plr:" + plr.playerid + " : " +  plr.isplayer + ":" + plr.canpoweroff);
				var temp = mplayer_control.prototype.find (plr.playerid);
				if (temp)
					temp.updateBasic (plr.playerid, (plr.name) ? plr.name : null, 
								(plr.power !== undefined) ? plr.power : 1,
								plr.isplayer, plr.canpoweroff, false);
				else
					mplayer_control.prototype.all.push(
						new mplayer_control (plr.playerid, (plr.name) ? plr.name : null,
								(plr.power !== undefined) ? plr.power : 1,
								plr.isplayer, plr.canpoweroff, 
								false));
				currentplayers = currentplayers.without(plr.playerid);
			});
		if (r2.result['sn player count'])
			r2.result.sn_players_loop.each(function(plr) {
				var temp = mplayer_control.prototype.find (plr.playerid);
				if (temp)
					temp.updateBasic (plr.playerid, (plr.name) ? plr.name : null, 
									  false, false, false, true);
				else
					mplayer_control.prototype.all.push(
						new mplayer_control (plr.playerid, (plr.name) ? plr.name : null, 
											 false, false, false, true));
				currentplayers = currentplayers.without(plr.playerid);
			});
		currentplayers.each(function (plr) {
			var temp = mplayer_control.prototype.find (plr);
			mplayer_control.prototype.all = mplayer_control.prototype.all.without(temp);
			temp.container.parentNode.removeChild(temp.container);
			temp.frame.parentNode.removeChild(temp.frame);
		});
	}, function (r2) {}, "");
	
	if (mplayer_control.prototype.tid)
		window.clearTimeout(mplayer_control.prototype.tid);
	mplayer_control.prototype.tid = window.setTimeout(mplayer_control.prototype.refresh, 37000);
}

mplayer_control.prototype.updateVolume = function (vol) {
	var vol = (vol < 0) ? -vol : vol;
	if (vol == this.volume) return;
	this.volume = vol;
	var intPos = parseInt((vol * _volumeBarWidth) / 100);
	this.e_volumeBar.style.width = intPos;
	this.e_volumeButton.style.left = intPos;
}

mplayer_control.prototype.evtVolume = function (evt) {
	if (!this.isplayer) return;
	var a_this = this;
	var level = parseInt((evt.clientX - 29) * 100 / _volumeBarWidth);
	if (level < 0) level = 0;
	if (level > 100) level = 100;
	callJSONRPC([ 'mixer', 'volume', level ], function (r2) {
		a_this.updateVolume(level);
	}, function (r2) {}, this.id);
}

mplayer_control.prototype.updateMode = function (mode) {
	if (mode == this.mode) return;
	this.mode = mode;
	if (mode == "play") { this.e_pause.hide(); this.e_play.show(); }
	else { this.e_play.hide(); this.e_pause.show(); }
}

mplayer_control.prototype.evtPlay = function () {
	var a_this = this;
	callJSONRPC([ 'play' ], function (r2) { 
							a_this.updateMode("play");
							if (!a_this.power) a_this.updatePower(1);
							}, function (r2) {}, this.id);			
}

mplayer_control.prototype.evtPause = function () {
	var a_this = this;
	callJSONRPC([ 'pause', 1 ], function (r2) { a_this.updateMode("pause"); },
							function (r2) {}, this.id);			
}

mplayer_control.prototype.updatePower = function (power) {
	if (power == this.power) return;
	this.power = power;
	if (power && this.canpoweroff) { this.e_power_off.hide(); this.e_power_on.show(); }
	else if (this.canpoweroff) { this.e_power_on.hide(); this.e_power_off.show(); }
	else { this.e_power_on.hide(); this.e_power_off.hide(); }
}

mplayer_control.prototype.evtPower = function (num) {
	var a_this = this;
	callJSONRPC([ 'power', num ], function (r2) { 
							a_this.updatePower(num);
							a_this.updateOther();
							}, function (r2) {}, this.id);			
}

mplayer_control.prototype.evtPrev = function () {
	var a_this = this;
	callJSONRPC([ 'time', '?' ], function (r2) {
		if (r2.result._time < prev_threshold)
			callJSONRPC([ 'playlist', 'index', '-1' ], function (r2) { 
							a_this.updateOther(); }, function (r2) {}, a_this.id);
		else
			callJSONRPC([ 'time', 0 ], function (r2) {}, function (r2) {}, a_this.id);			
	}, function (r2) {}, this.id);			
}

mplayer_control.prototype.evtNext = function () {
	var a_this = this;
	callJSONRPC([ 'playlist', 'index', '+1' ], function (r2) { 
							a_this.updateOther(); }, function (r2) {}, this.id);			
}

mplayer_control.prototype.disconnectSN = function () {
	var a_this = this;
	callJSONRPC([ 'squeezenetwork', 'disconnect', this.id ], function (r2) { 
							mplayer_control.prototype.refresh(); }, function (r2) {}, '');			
}

mplayer_control.prototype.unSync = function () {
	var a_this = this;
	callJSONRPC([ 'sync', '-' ], function (r2) {
						if (a_this.synced_to)
							a_this.updateOther();
						else
							a_this.refresh();
	}, function (r2) {}, this.id);
}


mplayer_control.prototype.wannaSync = null;

MplayerSync = function(evt) {
	evt.stopPropagation();

	var a_this = mplayer_control.prototype.find(findAttribute(this, "master"));
//alert(a_this.id + " : " + mplayer_control.wannaSync.id);
	a_this.all.each(function(plr) {
		plr.frame.removeEventListener('click', MplayerSync, true);
		plr.frame.removeClassName('m_lightsquare');
		plr.e_sync_active.hide()
		plr.e_sync = plr.e_sync_do;
		if (!plr.synced_to)
			plr.e_sync.show()
	});
	
	if (a_this.id != mplayer_control.wannaSync.id)
		callJSONRPC([ 'sync', mplayer_control.wannaSync.id ], function (r2) {
							a_this.refresh();
		}, function (r2) {}, a_this.id);
	
	mplayer_control.wannaSync = null;
}

mplayer_control.prototype.startSync = function () {
	var a_this = this;
	mplayer_control.wannaSync = this;
	this.all.each(function(plr) {
		plr.frame.addEventListener('click', MplayerSync, true);
		if (plr.id != a_this.id) {
			plr.frame.addClassName('m_lightsquare');
		} else {
			plr.e_sync_do.hide()
			plr.e_sync_active.show()
			plr.e_sync = plr.e_sync_active;
		}
	});
}

Mplayer = function (el) { return mplayer_control.prototype.find(findAttribute(el, "player")); }
Mmaster = function (el) { return mplayer_control.prototype.find(findAttribute(el, "master")); }

var temp = $('multicontrol');
while (temp.firstChild)
	temp.removeChild(temp.firstChild);
	
mplayer_control.prototype.refresh();