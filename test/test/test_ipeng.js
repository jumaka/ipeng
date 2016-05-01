/*
 * Test the iPeng UI using casperjs
 *
 */

var x = require('casper').selectXPath;
var d = require('utils').dump;
var fs = require('fs');

casper.options.viewportSize = {width: 1024, height: 768};

String.prototype.tidy = function()
{
		   return this.replace(/\s+/g, ' ').replace(/(^\s+)|(^\s+$)/g, '');
}
/* this function created because normalize-space does not seem to deal
 * with newlines and cruft in the text */

findElementVisibleWithText = function(t, tag, txt)
{
	var ret = -1, cnt = 1;
	var st, n;
	var elems = t.getElementsInfo(tag);
	for (cnt = 0; cnt <elems.length; cnt ++) {
		n = elems[cnt];
		if(n.visible)
		{
		   st =	n.text.tidy();
		   if(st == txt)
		   {
			ret = cnt + 1;
			break;
		   }
		}
	}
        return ret;
}
assertElementVisibleWithText = function(tst, t, tag, txt)
{
	tst.assert(findElementVisibleWithText(t, tag, txt) > -1,
		"Element " + tag + " found with text " + txt);
}

getVisibleText = function(t)
{
	var ret = '';
	var h = t.getElementsInfo(x('//*[self::div or self::li]'));
	for (var i = 0; i < h.length; i ++)
	{
		if((h[i].visible)&&(h[i].text.tidy() != ''))
		{
			ret += h[i].text.tidy() + '\n';
		}
	}
	return ret;
}

assertTextMatchesFile = function(tst, t, fn)
{
	var expect, fe, fa;
	var actual = getVisibleText(t);
	fs.write(fn + '.actual', actual, 'w');
	expect = fs.read(fn + '.expect');
	tst.assert(expect == actual, "Visible Text for " + fn + " matches");
}
casper.test.begin("Testing iPeng", 22, function(test) {

   casper.start('http://localhost:9000/ipeng', function() {
   });
   casper.then(function() {
       test.assertUrlMatch(/^http:\/\/localhost:9000\/ipeng\/\#_main$/);
   });
   casper.then(function() {
       test.assertTitle('Home');
   });
   casper.wait(1000);
   casper.then(function() {
       assertTextMatchesFile(test, casper, 'Home');
   });
   casper.then(function() {
       this.capture("home.png");
       this.wait(1000);
       var me = '//a';
       var mt = "Browse Library";
       var bl = findElementVisibleWithText(this, x(me), mt);
       assertElementVisibleWithText(test, this, x(me), mt);
       this.click(x('(' + me + ')[' + bl + ']'));
   });
   casper.then(function() {
       test.assertUrlMatch(/^http:\/\/localhost:9000\/ipeng\/\#_Database$/);
   });
   casper.then(function() {
       test.assertTitle('Home');
   });
   casper.wait(1000);
   casper.then(function() {
       assertTextMatchesFile(test, casper, 'BrowseLibrary');
   });
   casper.then(function() {
       this.capture("browselibrary.png");
       var me = '//a';
       var mt = "Albums";
       var bl = findElementVisibleWithText(this, x(me), mt);
       assertElementVisibleWithText(test, this, x(me), mt);
       this.click(x('(' + me + ')[' + bl + ']'));
   });
   casper.wait(1000);
   casper.then(function() {
       test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_BY_ALBUM&mode=albums\/\?&player=/);
   });
   casper.then(function() {
       test.assertTitle('Albums');
   });
   casper.wait(1000);
   casper.then(function() {
       assertTextMatchesFile(test, casper, 'Albums');
   });
   casper.then(function() {
       this.capture("albums.png");
   });
   casper.waitForSelector(".blueLeft.iButton",
       function success() {
           test.assertExists(".blueLeft.iButton");
           this.click(".blueLeft.iButton");
       },
       function fail() {
           test.assertExists(".blueLeft.iButton");
   });
   casper.then(function() {
       this.wait(1000);
       var me = '//a';
       var mt = "Browse Library";
       var bl = findElementVisibleWithText(this, x(me), mt);
       assertElementVisibleWithText(test, this, x(me), mt);
       this.click(x('(' + me + ')[' + bl + ']'));
   });
   casper.then(function() {
       this.wait(1000);
       var me = '//a';
       var mt = "Artist";
       var bl = findElementVisibleWithText(this, x(me), mt);
       assertElementVisibleWithText(test, this, x(me), mt);
       this.click(x('(' + me + ')[' + bl + ']'));
   });
   casper.then(function() {
       test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_BY_ARTIST&mode=artists\/\?&player=/);
   });
   casper.then(function() {
       test.assertTitle('Artists');
   });
   casper.wait(1000);
   casper.then(function() {
       assertTextMatchesFile(test, casper, 'Artists');
   });
   casper.then(function() {
       this.capture("artists.png");
   });
	 casper.waitForSelector(".blueLeft.iButton",
       function success() {
           test.assertExists(".blueLeft.iButton");
           this.click(".blueLeft.iButton");
       },
       function fail() {
           test.assertExists(".blueLeft.iButton");
   });
   casper.then(function() {
       this.wait(1000);
       var me = '//a';
       var mt = "Radio";
       var bl = findElementVisibleWithText(this, x(me), mt);
       assertElementVisibleWithText(test, this, x(me), mt);
       this.click(x('(' + me + ')[' + bl + ']'));
   });
	 casper.then(function() {
       test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/home.html\?player=.*#_Radio/);
   });
   casper.then(function() {
       test.assertTitle('Home');
   });
   casper.wait(1000);
   casper.then(function() {
       assertTextMatchesFile(test, casper, 'Radio');
   });
   casper.then(function() {
       this.capture("radio.png");
   });

   casper.run(function() {test.done();});
});
