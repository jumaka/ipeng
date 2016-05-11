/*
 * Test the iPeng UI using casperjs
 *
 */

var x = require('casper').selectXPath;
var d = require('utils').dump;
var fs = require('fs');

var homePage = 'http://localhost:9000/ipeng';

casper.options.viewportSize = {
    width: 1024,
    height: 768
};

String.prototype.tidy = function() {
        return this.replace(/\s+/g, ' ').replace(/(^\s+)|(^\s+$)/g, '');
    }
    /* this function created because normalize-space does not seem to deal
     * with newlines and cruft in the text */

findElementVisibleWithText = function(t, tag, txt) {
    var ret = -1,
        cnt = 1;
    var st, n;
    var elems = t.getElementsInfo(tag);
    for (cnt = 0; cnt < elems.length; cnt++) {
        n = elems[cnt];
        if (n.visible) {
            st = n.text.tidy();
            if (st == txt) {
                ret = cnt + 1;
                break;
            }
        }
    }
    return ret;
}
assertElementVisibleWithText = function(tst, t, tag, txt) {
    tst.assert(findElementVisibleWithText(t, tag, txt) > -1,
        "Element " + tag + " found with text " + txt);
}

getVisibleText = function(t) {
    var ret = '';
    var h = t.getElementsInfo(x('//*[self::div or self::li]'));
    for (var i = 0; i < h.length; i++) {
        if ((h[i].visible) && (h[i].text.tidy() != '')) {
            ret += h[i].text.tidy() + '\n';
        }
    }
    return ret;
}

assertTextMatchesFile = function(tst, t, fn) {
    var expect, fe, fa;
    var actual = getVisibleText(t);
    fs.write(fn + '.actual', actual, 'w');
    expect = fs.read(fn + '.expect');
    tst.assert(expect == actual, "Visible Text for " + fn + " matches");
}

/*
 * Main test section
 *
 */
casper.test.begin("Testing iPeng", 62, function(test) {

    // Initial home page checks - URL, title, text match, image capture
    casper.start(homePage, function() {});
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
    });

    // Select Browse Library and do the same check, URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
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
    });

    // Select Albums and do the same check, URL, title, text match, image
    casper.then(function() {
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
    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Artists and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Artists";
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

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Genres and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Genres";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_BY_GENRE&mode=genres\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('Genres');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'Genres');
    });
    casper.then(function() {
        this.capture("genres.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Years and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Years";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_BY_YEAR&mode=years\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('Years');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'Years');
    });
    casper.then(function() {
        this.capture("years.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select New Music and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "New Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_NEW_MUSIC&mode=albums&wantMetadata=1&sort=new\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('New Music');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'NewMusic');
    });
    casper.then(function() {
        this.capture("newmusic.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Music Folder and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Music Folder";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=BROWSE_MUSIC_FOLDER&mode=bmf\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('Music Folder');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'MusicFolder');
    });
    casper.then(function() {
        this.capture("musicfolder.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Playlists and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Playlists";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=SAVED_PLAYLISTS&mode=playlists\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('Playlists');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'Playlists');
    });
    casper.then(function() {
        this.capture("playlists.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Navigate back to the Library
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Music";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });

    // Select Search and check: URL, title, text match, image
    casper.then(function() {
        this.wait(1000);
        var me = '//a';
        var mt = "Search";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/iPeng\/clixmlbrowser\/clicmd=browselibrary\+items&linktitle=SEARCH&mode=search\/\?&player=/);
    });
    casper.then(function() {
        test.assertTitle('Search');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'Search');
    });
    casper.then(function() {
        this.capture("search.png");
    });

    // Return to the home page
    casper.waitForSelector(".blueLeft.iButton",
        function success() {
            test.assertExists(".blueLeft.iButton");
            this.click(".blueLeft.iButton");
        },
        function fail() {
            test.assertExists(".blueLeft.iButton");
        });

    // Select Radio and check: URL, title, text match, image
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

    // Select My Apps and check: URL, title, text match, image
    casper.thenOpen(homePage, function() {
        this.wait(1000);
        var me = '//a';
        var mt = "My Apps";
        var bl = findElementVisibleWithText(this, x(me), mt);
        assertElementVisibleWithText(test, this, x(me), mt);
        this.click(x('(' + me + ')[' + bl + ']'));
    });
    casper.then(function() {
        test.assertUrlMatch(/^http:\/\/localhost:9000\/ipeng\/.*#_browseApps$/);
    });
    casper.then(function() {
        test.assertTitle('Home');
    });
    casper.wait(1000);
    casper.then(function() {
        assertTextMatchesFile(test, casper, 'BrowseApps');
    });
    casper.then(function() {
        this.capture("browseapps.png");
    });

    casper.run(function() {
        test.done();
    });
});
