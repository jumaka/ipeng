PlaybackControl = function() {
	this.currentTrack = -1;
	this.url = null;
	this.firsttrack = -1;
	this.lasttrack = -1;
	this.pbctrl = $('playbackctrl');
	this.depressed = null;
console.log("pcconstruct");
}

PlaybackControl.prototype.init = function() {
console.log("pcinit");
	if (!PlaybackControl.prototype.instance) {
		PlaybackControl.prototype.instance = new PlaybackControl();
		PlaybackControl.prototype.instance.doInit(true);
	} else
		PlaybackControl.prototype.instance.doInit(false);
}
	
PlaybackControl.prototype.doInit = function(isnew) {
	if (isnew) {
		var pdiv = new Element('div', { 'class' : 'pcdiv' });
		var line = new Element('div', { 'class' : 'pcdiv', id : 'pcqtframe' });
		var QTobj = new Element ('object',
					{ classid : 'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
					  codebase : 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0',
					  id : 'pcqt',
					  width : '320', height : '45',
	//				  autoplay : 'true',
					  postdomevents : 'true',
					  src : '/music/' + Player.status.track.id + '/download.mp3',
					  scale : 'tofit' });
		var file = new Element('embed', {
					src : '/music/' + Player.status.track.id + '/download.mp3',
					id: 'pcmovie',
					width : '320', height : '45',
					postdomevents : 'true',
	//				autoplay : 'true',
					bgcolor : "black",
					pluginspage : "http://www.apple.com/quicktime/download/"
					});
		QTobj.appendChild(file);
		line.appendChild(QTobj);
		pdiv.appendChild(line);
		this.pbctrl.appendChild(pdiv);
		
		this.currentTrack = Player.status.index;
		
		QTobj.addEventListener('qt_ended', this, false);
		
		$('NPwrapperBody').addEventListener('webkitTransitionEnd', this, false);
		$('NPwrapperBody').addEventListener('transitionend', this, false);
	}
	
	if (Player.status.pl_first > -1) {
		var irow = 0;
		if (this.firsttrack > -1 && this.firsttrack != Player.status.pl_first) {
			for (var i = this.firsttrack; i <= this.lasttrack; i++) {
				line = $('pc' + i);
				if (line) this.pbctrl.removeChild(line);
			}
			this.lasttrack = -1;
		}
		for (var i = Player.status.pl_first; i <= Player.status.pl_last; i++) {
			var row = Player.status.alltracks[i];
			irow++;
			var rclass = (i % 2) ? " pcodd" : " pceven";
			if (irow > this.lasttrack) {
				line = new Element('div' , { 'class' : 'pcline', id : 'pc' + i, item : i, itemid : row.id });
				pdiv = new Element('div', { 'class' : 'pcnum' + rclass}).update(i + 1);
	
				line.addEventListener('touchstart', this, false);
				line.addEventListener('touchmove', this, false);
				line.addEventListener('touchend', this, false);
				line.appendChild(pdiv);
				line.addEventListener('click', this, false);
				pdiv = new Element('div', { 'class' : 'pctext' + rclass}).update(row.title);
				line.appendChild(pdiv);
				pdiv = new Element('div', { 'class' : 'pctime' + rclass}).update(timeStr(row.duration));
				line.appendChild(pdiv);
				$('playbackctrl').appendChild(line);
				this.lasttrack++;
			} else {
				line = $('pc' + i);
				if (line && (line.getAttribute('itemid') != row.id)) {
					line.setAttribute('itemid', row.id);
					line.down('div', 2).update(row.title);
					line.down('div', 3).update(timeStr(row.duration));
				}
			}
			if (this.lasttrack > Player.status.pl_last)
				for (var i = this.lasttrack + 1; i <= Player.status.pl_last; i++) {
					line = $('pc' + i);
					if (line) this.pbctrl.removeChild(line);
			}
			this.firstitem = Player.status.pl_first;
			this.lastitem = Player.status.pl_first;
		}
	}	
}

PlaybackControl.prototype.handleEvent = function(event) {
// console.log('event:' + event.type);
	switch (event.type) {
		case 'touchstart' :
			var el = $('pc' + parseInt(findAttribute(event.target, 'item')));
			Element.extend(el);
			this.depressed = el;
			el.addClassName('pcdepressed');
			break;
		case 'touchmove' :
		case 'touchend' :
			if (this.depressed) {
				this.depressed.removeClassName('pcdepressed');
				this.depressed = null;
			}
//				event.stopPropagation();
			break;

		case 'click' :
			var temp = findAttribute(event.target, "item");
			if (temp) {
				this.currentTrack = temp;
				this.playTrack(temp);
			}
			break;

		case 'qt_ended' :
console.log('qtEnded:' + Player.status.repeat);
			if (this.currentTrack > -1) {
				if (Player.status.repeat != 1)
					this.currentTrack++;
				if (this.currentTrack > Player.status.pl_last) {
					this.currentTrack = Player.status.pl_first;
					if (!Player.status.repeat)
						return;
				}
				window.setTimeout(this.playDelayed, 500);
			}
			break;

		case 'webkitTransitionEnd' :
		case 'transitionend' :
console.log("inTrandEnd");
console.log("TransEnd:" + $('NPwrapperBody').style.webkitTransform);
			if ($('NPwrapperBody').style.webkitTransform == 'translateX(0px)')
				$('pcqtframe').show();
			else
				$('pcqtframe').hide();
			break;
	}
}

PlaybackControl.prototype.playDelayed = function () {
//	PlaybackControl.prototype.instance.playTrack(PlaybackControl.prototype.instance.currentTrack);
		var newEvt = document.createEvent('MouseEvents');
		newEvt.initMouseEvent('click', true, true, window, 1, 
				0, 0, 0, 0, 
				false, false, false, false, 0, null);
		$('pc' + PlaybackControl.prototype.instance.currentTrack).dispatchEvent(newEvt);
}

PlaybackControl.prototype.playTrack = function (num) {
	var row = Player.status.alltracks[num];
	var QT = $('pcqt');
	var movie = $('pcmovie');
	if (row) {
console.log('/music/' + row.id + '/download.mp3' + "..title:" + row.title);
		QT.SetURL('/music/' + row.id + '/download.mp3');
		movie.SetURL('/music/' + row.id + '/download.mp3');
		movie.Play();
//		document.pcqt.SetMovieName(row.title);
//		this.url = '/music/' + row.id + '/download.mp3'
//		window.setTimeout(this.play, 300);
	}
}

PlaybackControl.prototype.play = function() {
	var QT = $('pcqt');
console.log("play:" + PlaybackControl.prototype.instance.url);
	QT.SetURL(PlaybackControl.prototype.instance.url);
	QT.Play();
}

PlaybackControl.prototype.instance = null;


PlaybackControl.prototype.init();
