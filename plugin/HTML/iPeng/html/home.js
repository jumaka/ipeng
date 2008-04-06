var url = 'status.html';

var bottombarTop = 369;
var topbarHeight = -4; // should be 44, consider this to be a bug in MS, but MS expands every div to at least 100% height...

// Alarm

var Pi = 3.14159265;

function Clock(theday, thetime, dowrite) {
	this.day = theday || 0;
	this.time = thetime || 0;
	var dowrite = (dowrite === undefined) ? true : dowrite;
	this.id = 'clock' + theday;
	if (dowrite) document.write('<canvas id = \'' + this.id + '\' width = \'76\' height = \'77\' time = \'' + this.time + '\'></canvas>');
	this.element = $(this.id);
//	this.alldays.push(this);
	this.alldays[theday] = this;
}
Clock.prototype.alldays = [];
Clock.prototype.dayImg = new Image ();
Clock.prototype.nightImg = new Image ();

Clock.prototype.draw = function() {
	var canvas = this.element;
	var thehour = this.time / 3600;
	var theminute = parseInt((this.time % 3600) / 60);
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		var daytime = (thehour > 6 && thehour < 18) ? true : false;

		if (daytime) {
			ctx.drawImage(this.dayImg, 0, 0);
			ctx.fillStyle = "#000000";
		} else {
			ctx.drawImage(this.nightImg, 0, 0);
			ctx.fillStyle = "#ffffff";
		}
		ctx.strokeStyle = "#888888";
		ctx.save();
		ctx.translate(38, 39);
		ctx.rotate(thehour * Pi / 6);
		ctx.beginPath();
		ctx.arc(0, 0, 3, 0, Pi);
		ctx.lineTo(0, -20);
		ctx.stroke();
		ctx.fill();
		ctx.restore();
		ctx.save();
		ctx.translate(38, 39);
		ctx.rotate(theminute * Pi / 30);
		ctx.beginPath();
		ctx.arc(0, 0, 3, 0, Pi);
		ctx.lineTo(0, -30);
		ctx.stroke();
		ctx.fill();
		if (daytime) {
			ctx.strokeStyle = "#c8c8c8";
			ctx.beginPath();
			ctx.arc(0, 0, 38, 0, 2 * Pi);
			ctx.stroke();
		}
		ctx.restore();
	}
}

Clock.prototype.updateClock = function (newtime) {
	this.time = newtime;
	this.element.setAttribute('time', newtime);
	this.draw();
}

Clock.prototype.getTimeStr = function () {
	var target = new String();
	target = parseInt(this.time / 3600) + ":";
	if (this.time < 36000) target = "0" + target;
	var temp = parseInt(this.time % 3600);
	if (temp < 600) target = target + "0";
	target = target + parseInt(temp / 60);
	return target;
}

Clock.prototype.drawall = function() {
	for (var i = 0; i < 8; i++)
		new Clock(i, 0, false);
 	var imagePL = 2;
 	function olCheck() {
		imagePL--;
		if (!imagePL) {
			if (this.tClock.alldays) {
				this.tClock.alldays.each(function (key) {
					key.draw();	
				});
			}
		}
	}
	
	this.dayImg.onload = olCheck;
	this.dayImg.tClock = this;
	this.nightImg.onload = olCheck;
	this.nightImg.tClock = this;
	this.dayImg.src = webroot + 'html/images/clockday.png';
	this.nightImg.src = webroot + 'html/images/clocknight.png';
}

Clock.prototype.getClock = function(Nr) {
 	return this.alldays[Nr];
/* 	var theclock = null;
	if (this.alldays)
		this.alldays.each(function (key) {
		 	if (key.day == Nr) {
		 	 	theclock = key;
				throw $break;
			}
		});
	return theclock;*/
}

function Alarms() {
	this.all = null;
}

Alarms.prototype.get = function(Nr) {
 	var thealarm = null;
	if (this.all)
		this.all.each(function (key) {
		 	if (key.dow == Nr) {
		 	 	thealarm = key;
				throw $break;
			}
		});
	return thealarm;
}

Alarms.prototype.update = function () {
 	var tid = null;
 	var refreshKeys = new Array();
 	var Athis = this;
 	
 	function updatePL() {
		if (allPlaylists.updating) return;
		clearInterval (tid);
		while (refreshKeys.length > 0) {
			var key = refreshKeys.pop();
			Athis.updatePL(key.day, key.id);
		}
		tid = null;
		
		var aPL_list = $('a_playlists');
	 	var tarr = aPL_list.childElements();
	 	tarr.each(function(key) {
			key.remove();	
		});
		for (var i = -1; i > -5; i--)
			setPLElement(SpecialPlaylists[-1 - i], i);
		allPlaylists.array.each(function(key) {
			if (key.id)
				setPLElement (key.name, key.id);
		});

		function setPLElement(text, id) {
			var tEl = document.createElement("li");
			if (text.length > 25) {
				tEl.style.fontSize = "80%";
				if (text.length > 58)
					text = text.substr(0, 56) + "...";
			}
			tEl.style.paddingRight = "35";
			tEl.textContent =  text;
			tEl.setAttribute("onclick", "setASelectedPL(" + id + ")");
			tEl.id = 'pl' + id;
			aPL_list.appendChild(tEl);
		}
	}
 
	var sArray = ['alarms', '0', '8', 'filter:defined'];
	callJSONRPC (sArray, function (r2) {
	 	var a_visible = [];
		if (r2.result.count == 8)
			Element.hide('a_plus');
		else
			Element.show('a_plus');
	 	if (r2.result.count > 0) {
		 	Athis.all = r2.result.alarms_loop;
			r2.result.alarms_loop.each(function(key) {
				var clock = Clock.prototype.getClock(key.dow);
				a_visible.push(key.dow);
				clock.updateClock(key.time);
				Element.showRow('alarm' + key.dow, 'alarmSet');
				$('a_time' + key.dow).textContent = clock.getTimeStr();
				if (key.enabled && key.enabled != "0")
					$('a_onoff' + key.dow).setAttribute('toggled', 'true');
				else
					$('a_onoff' + key.dow).removeAttribute('toggled');
				if (key.playlist_id || key.url)
				 	refreshKeys.push({ id: key.playlist_id, day: key.dow, url: key.url });
				else $('a_playlist' + key.dow).textContent = "";
			});
		}
		if (!tid) tid = setInterval(updatePL, 0);
		for (var i = 0; i < 9; i++)
			if (a_visible.indexOf(i) == -1)
				Element.hideRow('alarm' + i, 'alarmSet');
	}, function (r2) {});
}

Alarms.prototype.addOne = function (id) {
 	var Athis = this;

	var sArray = [ 'alarms', '0', '1', 'dow:' + id, 'filter:all' ];
	callJSONRPC (sArray, function (r2) {
		if (r2.result.count == 1) {
		 	var key = r2.result.alarms_loop[0];
		 	if (Athis.all && Athis.all.length > 0)
				Athis.all.push(key);
			else
				Athis.all = r2.result.alarms_loop;
			var clock = Clock.prototype.getClock(id);
			clock.updateClock(key.time);
			$('a_time' + id).textContent = clock.getTimeStr();
			if (key.enabled && key.enabled != "0")
				$('a_onoff' + id).setAttribute('toggled', 'true');
			else
				$('a_onoff' + id).removeAttribute('toggled');
			Athis.updatePL(id);
			Element.showRow('alarm' + id, 'alarmSet');
			if (Athis.all.length == 8)
				Element.hide('a_plus');
		}
	}, function (r2) {});
}

Alarms.prototype.updateOne = function (id) {
 	key = this.get(id);
	var clock = Clock.prototype.getClock(id);
	clock.updateClock(key.time);
	this.updatePL(id);
	Element.showRow('alarm' + id, 'alarmSet');
	$('a_time' + id).textContent = clock.getTimeStr();
	if (key.enabled && key.enabled != "0")
		$('a_onoff' + id).setAttribute('toggled', 'true');
	else
		$('a_onoff' + id).removeAttribute('toggled');
}

Alarms.prototype.updatePL = function(a_id, p_id) {
 	var key = this.get(a_id);
 	var p_id = (p_id) ? p_id : key.playlist_id;
	var ePL = $('a_playlist' + a_id);
	ePL.setAttribute("plid", p_id);
	var temp = allPlaylists.getName(p_id);
	if (temp) {
		if (temp.length > 25)
			temp = temp.substring(0,23) + '...';
		ePL.textContent = temp;
	} else
		ePL.textContent = "";
}

Alarms.prototype.remove = function(alm) {
	this.all = this.all.without(alm);
 	delete alm;
	Element.show('a_plus');
}

myAlarms = new Alarms();

function Playlists() {
	this.array = new Array();
	this.updating = true;
	this.update();
}

function Playlist(name, id, url) {
	this.name = name;
	this.id = id;
	this.url = url;
}

Playlists.prototype.update = function() {
	var tb = this;
 	if (this.array.length) {
	 	delete this.array;
	 	this.updating = true;
 		this.array = new Array();
 	}
 	 	
 	function fillArray(startcnt, r2) {
 		var cnt = 0;
		r2.result.playlists_loop.each(function(key) {
			if (key.id) {
			 	var temp = new Playlist(key.playlist, key.id, key.url);
				tb.array.push(temp);
				
				cnt++;
			}
		});
		
		if ((r2.result.count - startcnt) > cnt) {
			var sArr = [ 'playlists', startcnt + cnt, '100' ];
			callJSONRPC(sArr, function (r1) { fillArray (cnt, r1); }, function (r1) { tb.updating = false; });
		} else
			tb.updating = false;

	}

	var sArray = ['playlists', '0', '100' ];
	callJSONRPC (sArray, function (r2) { fillArray (0, r2); }, function (r1) { tb.updating = false; });
}

Playlists.prototype.getName = function (id) {
	var res = null;
	if (id < 0)
		return SpecialPlaylists[-1 - id];
	this.array.each(function(key) {
		if (key.id == id) {
			res = key.name;
			throw $break;
		}
	});
	return res;
}

allPlaylists = new Playlists();

function setASelectedPL(id) {
 	var name = allPlaylists.getName(id);
	var tarr = $('a_playlists').childElements();
 	tarr.each(function(key) {
 		if (key.id == ("pl" + id))
			key.setAttribute("class", "selectedli");
		else
			key.removeAttribute("class");
	});
	if (a_editHere > -1) 
		myAlarms.updatePL(a_editHere, id);
}

function toggleDay(day) {
 	var value = $('a_onoff' + day).getAttribute('toggled');
	var sArray = ['alarm', 'cmd:update', 'dow:' + day, 'enabled:' + ((value == "true") ? '1' : '0') ];
	callJSONRPC (sArray, function (r2) {
		if (r2.result.count != "1") {
			if (value == "true")
				$('a_onoff' + day).removeAttribute('toggled');
			else
				$('a_onoff' + day).setAttribute('toggled', 'true');
		}
	}, function (r1) {});
}

function updateFade() {
 	var fade;
	var sArray = ['alarms', '0', '1', 'dow:0'];
	callJSONRPC (sArray, function (r2) {
		fade = (r2.result.fade == 1) ? 0 : 1;
		var sArray = ['alarm', 'cmd:update', 'dow:0', 
					   'enabled:' + r2.result.alarms_loop[0].enabled, 
					   'fade:' + fade ];
		callJSONRPC (sArray, function (r2) {
		 	if (fade == 1)
			 	$('a_fade').setAttribute('toggled', 'true');
			else
			 	$('a_fade').removeAttribute('toggled');
		}, function (r1) {});
	}, function (r1) {});
}

a_editHere = -1;
var _volumeBarWidth = 262;
var e_inhibit = false;

function setAVolume(vol) {
	var intPos = parseInt((vol * _volumeBarWidth) / 100);
	$("volumeBar").style.width = intPos;
	$("volumeButton").style.left = intPos;
	$("e_volume").setAttribute('volume', vol); 
}

function evtAVolume(evt) {
	var level = parseInt((evt.clientX - 29) * 100 / _volumeBarWidth);
	if (level < 0) level = 0;
	if (level > 100) level = 100;
	setAVolume(level);
}

function closeAEdit(cancel) {
	var cancel = (cancel) ? cancel : false;
	var id = a_editHere;
	var thealarm = myAlarms.get(id);
	var hideDivs = [ 'a_delete', 'e_time', 'a_arrow', 'a_moreedit' ];
	Element.hideRow('a_editrow' + id, 'alarmSet');
	hideElements(hideDivs);
	var tPL = $('a_playlist' + id);
	tPL.style.top = 55;
	tPL.removeAttribute("href");
	tPL.setAttribute("target", "_none");
	$('a_title' + id).style.top = 12;
	
	if (!cancel) {
	 	var tvol = $("e_volume").getAttribute('volume');
	 	var ttime = $('e_minutes').value * 60 + $('e_hours').value * 3600;
	 	var tid = $('a_playlist' + id).getAttribute("plid");
	 	var turl;
		sArray = [ 'alarm', 'cmd:update', 'dow:' + id, 'volume:' + tvol, 'time:' + ttime ];
		if (tid < 0) {
			turl = SpecialPLURLs[-1 - tid];
		 	sArray.push('url:' + turl);
		} else {
			turl = "";
			sArray.push('playlist_id:' + tid);
		}
		callJSONRPC (sArray, function (r2) {
			if (r2.result.count == 1) {
				thealarm.volume = tvol;
				thealarm.time = ttime;
				thealarm.playlist_id = tid;
				thealarm.url = turl;
			}
			myAlarms.updateOne(id);
		}, function (r1) {
			myAlarms.updateOne(id);
		});
	} else
		myAlarms.updateOne(id);

	Element.show($('a_time' + id));
	a_editHere = -1;
}

function startAEdit(id) {
 	if (e_inhibit) return;
	if (id == a_editHere) return;
	if (a_editHere >= 0) closeAEdit();
	a_editHere = id;
	var thealarm = myAlarms.get(id);
	var thetargetrow = $('alarm' + id);
	var thetargetinfo = $('a_info' + id);
	var thetargetedit = $('a_editrow' + id);
	var showDivs = [ 'a_delete', 'e_time', 'a_arrow', 'a_moreedit' ];
	thetargetrow.appendChild($('a_delete'));
	thetargetinfo.appendChild($('e_time'));
	thetargetinfo.appendChild($('a_arrow'));
	thetargetedit.appendChild($('a_moreedit'));
	var tPL = $('a_playlist' + id)
	tPL.style.top = 58;
	tPL.href = "#playlists";
	tPL.removeAttribute("target");
	setASelectedPL(thealarm.playlist_id);
	$('a_title' + id).style.top = 6;
	setAVolume(thealarm.volume);
	var temp = parseInt(thealarm.time / 3600);
	$('a_h' + temp).selected = true;
	temp = parseInt((thealarm.time % 3600) / 60);
	$('a_m' + temp).selected = true;

	Element.hide($('a_time' + id));
	showElements(showDivs);
	Element.showRow('a_editrow' + id, 'alarmSet');
}

function updateHoursMinutes() {
	if (a_editHere < 0) return;
	var clock = Clock.prototype.getClock(a_editHere);
	time = $('e_hours').value * 3600 + $('e_minutes').value * 60;
	clock.updateClock(time);
}

function deleteAlarm() {
	if (a_editHere < 0) return;
	var id = a_editHere;

	if (confirm("Do you really want to clear the alarm \"" + DayStrings[id] + "\"")) {
		sArray = [ 'alarm', 'cmd:clear', 'dow:' + id ];
		callJSONRPC (sArray, function (r2) {
		 	thealarm = myAlarms.get(id);
		 	closeAEdit(true);
		 	myAlarms.remove(thealarm);
		 	Element.hideRow('alarm' + id, 'alarmSet');
		}, function (r1) {});
	}
}

function cancelAAdd() {
 	Element.hideRow('e_add', 'alarmSet');
	e_inhibit = false;
}

function startAAdd() {
 	if (e_inhibit) return;
	e_inhibit = true;
	if (a_editHere >= 0) closeAEdit();

	var wdsel = $('e_weekdays');
	var tarr = wdsel.childElements();
 	tarr.each(function(key) {
 		if (key.getAttribute("value") == "dummy")
			key.setAttribute("selected", "true");
		else
			wdsel.removeChild(key);
	});
	for (var i = 0; i < 8; i++)
		if (!myAlarms.get(i)) {
			var temp = document.createElement("option");
			temp.textContent = DayStrings[i];
			temp.setAttribute("value", i);
			wdsel.appendChild(temp);
		}
	Element.showRow('e_add', 'alarmSet');
}

function doAAdd(dow) {
 	myAlarms.addOne(dow);
	$('e_weekdays').blur();
 	Element.hideRow('e_add', 'alarmSet');
 	e_inhibit = false;
}

Element.hideRow = function(id, div) {
	Element.hide(id);
	var bbar = $('bottombar');
	if (bbar) {
		var newtop = (div) ? (parseInt($(div).scrollHeight) + topbarHeight) : (parseInt(bbar.style.top) -  parseInt($(id).scrollHeight));
		bbar.style.top = (newtop > bottombarTop) ? newtop : bottombarTop;
	}
}

Element.showRow = function(id, div) {
	Element.show(id);
	var bbar = $('bottombar');
	if (bbar) {
	 	var newtop = (div) ? (parseInt($(div).scrollHeight) + topbarHeight) : (parseInt(bbar.style.top) + parseInt($(id).scrollHeight));
		bbar.style.top = (newtop > bottombarTop) ? newtop: bottombarTop;
	}
}


// Sleep

function Sleep() {
	this.timeout = 0;
	this.tid = null;
	this.element = null;
}

sleep = new Sleep();

Sleep.prototype.string = function () {
	var target = new String();
	if (this.timeout > 3600) {
		target = parseInt(this.timeout / 3600) + ":";
		if (this.timeout < 36000) target = "0" + target;
	}
	var temp = this.timeout % 3600;
	if (temp < 600) target = target + "0";
	target = target + parseInt(temp / 60) + ":";
	temp = this.timeout % 60;
	if (temp < 10) target = target + "0";
	target = target + temp;
//console.log("target2: " + target);
	return target;
}

Sleep.prototype.displayStartStop = function (startflag) {
 		if (startflag) {
			Element.show('sleeptime');
			Element.hide('sleepedit');
			Element.show('sleepstop');
			Element.hide('sleepstart');
		} else {
			Element.hide('sleeptime');
			Element.show('sleepedit');
			Element.hide('sleepstop');
			Element.show('sleepstart');
		}
}

Sleep.prototype.init = function() {
console.log("init");
 	var sthis = this;
	var sArray = [ 'sleep', '?' ];
	if (!this.element) this.element = $('sleeptime');
	callJSONRPC (sArray, function (r2) {
	 	var restemp = parseInt(r2.result._sleep);
		if (restemp > 0) {
			sthis.timeout = restemp;
			sthis.displayStartStop (true);
			if (!sthis.tid)
				sthis.tid = setInterval(dodisplayTime, 1000);
		} else {
			sthis.timeout = 0;
			sthis.displayStartStop(false);
		}
	}, function (r1) {});
	
	function dodisplayTime() {
		sleep.displayTime();
	}
}

Sleep.prototype.displayTime = function() {
	if (this.timeout <= 0) {
		clearInterval(this.tid);
		this.timeout = 0;
		this.tid = null;
		sthis.displayStartStop(false);
		return;
	}
	this.timeout--;
	if ((this.timeout % 60) == 0)
		this.init();
	this.element.textContent = this.string();
}

Sleep.prototype.Count = function (startflag) {
 	var sthis = this;
	if (startflag) {
		var mval = $('s_minutes').value;
		if (mval.substr(0, 1) == "0")
			mval = mval.substr(1);
		var temp = parseInt(mval) * 60;
		temp = temp + parseInt($('s_hours').value) * 3600;
		this.timeout = temp;
		if (!temp) return;
	} else
		this.timeout = 0;
	var sArray = [ 'sleep', this.timeout ];
	callJSONRPC (sArray, function (r2) {
	 	sthis.init();
	}, function (r1) {});
}

function localOnload() {
	Clock.prototype.drawall();
 	myAlarms.update();
}

// OnLoad

window.onload = function() {
/*	Clock.prototype.drawall();
 	myAlarms.update();*/
	globalOnload();
}
