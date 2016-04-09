/*
 * Set up the Logitech Media Server 
 */

var casper = require('casper').create();
var x = require('casper').selectXPath;

/*
 * click one of the buttons where the text matches the passed in text
 */

function clickButton(buttonText)
{
	var bs = document.querySelectorAll('button.x-btn-text');
	for (b = 0; b < bs.length; b ++)
	{
		if(bs[b].innerText == buttonText) {
			bs[b].click();
		}
	}
}

/*
 * fill the path field
 */

function setPath(id, txt)
{
	var sp = document.querySelector(id);
	sp.value = txt;
}

/* call start once to set the viewport - seems to be the only way to fix
 * the capture size
 */ 

casper.start('http://localhost:9000/', function() {
    this.viewport(1024, 768);
});

casper.thenOpen('http://localhost:9000/', function() {
    this.capture('initial.png');
});

/* do not log in to mysqueezebox */

casper.then(function() {
	this.echo("Press Skip");
	this.evaluate(clickButton,'Skip');
	this.wait(1000, function()
	{
		this.echo('Waited ...');
		this.capture('localmusicfolder.png');
	});
});

/* Select the local music folder */
casper.then(function() {
	this.evaluate(setPath, '#audiodir', '/home/sq/music');
	this.echo("Press Next");
	this.evaluate(clickButton,'Next');
	this.wait(1000, function()
	{
		this.echo('Waited ...');
		this.capture('playlistfolder.png');
	});
});

/* Select the playlist folder */
casper.then(function() {
	this.evaluate(setPath, '#playlistdir', '/home/sq/playlists');
	this.echo("Press Next");
	this.evaluate(clickButton,'Next');
	this.wait(1000, function()
	{
		this.echo('Waited ...');
		this.capture('welcome.png');
	});
});

/* Select finish */
casper.then(function() {
	this.echo("Press Finish");
	this.evaluate(clickButton,'Finish');
	this.wait(1000, function()
	{
		this.echo('Waited ...');
		this.capture('home.png');
	});
});

casper.run();

