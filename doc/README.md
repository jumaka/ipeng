# iPeng documentation

---

This is a repository of documentation about this plugin.
The plugin is difficult to follow because of the
use of Template and a number of historic branches

## Site map

### The home page

This is the default page for the plugin it as a link address of `home.html#_main`

Home Page | Description | Path
---|---|---
[Library](#Library) | Reached from *Browse Library* link on the home page | `home.html#_Database`
More | Reached from *Browse More* link on the home page | `home.html#_Lists`
Radio | Reached from the *Radio* link on the home page | `home.html#_Radio`
Extras | Reached from *Extras* link on the home page | `home.html#_browseSettings`

### Bottom bar navigation

Navigation | Description | Path
---|---|---
Albums | Browse the library by album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ALBUM&mode=albums`
Artist | Browse the library by artist then album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ARTIST&mode=artists`
Lists |  Browse the play lists | `clixmlbrowser/clicmd=browselibrary+items&linktitle=SAVED_PLAYLISTS&mode=playlists`
Search | ?Search? | `search.html`
Home | Back to the home page | `home.html`

<h3 id="Library">The Library Page</h3>

Library Page | Description | Path
---|---|---
Albums |Browse the library by Albums | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ALBUM&mode=albums`
New Music | List the new music newest to oldest| `/clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_NEW_MUSIC&mode=albums&wantMetadata=1&sort=new`
Years | List all the years for the music in ascending order then by album|`clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_YEAR&mode=years`
Genres | List all of the genres in the library in ascending alphabetical orders then by album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_GENRE&mode=genres`
Artist | List all of the artists in alphabetical order | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ARTIST&mode=artists`
Music Folder |List the folders and files in the music folder heirarchically | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_MUSIC_FOLDER&mode=bmf`

<h3 id="Browser">The Library Browser</h3>

The library browser is a multi-functional list generator that
displays various library contents. It has navigation
assistance including the first letters of library items,
pagination and a display of the current play list.

The list includes icons to allow the addition of items to the
current play list and to add or replace the contents to the now playing
list.

List | Alphabetical/ Numerical Browser | Play list displayed | Add to play list | All Songs | Play Item
---|---|---|---|---|---
Album| Alphabetical | Yes | Yes | No | Album
Artists| Alphabetical | Yes | Yes | No | All Albums
Genres| Alphabetical | Yes | Yes | No | All Albums
Music Folder| Numerical | Yes | Yes | No | All Folders
New Music | Numerical | Yes | Yes | No | Album
Playlists | None |
Years| None | Yes | Yes | No | All Albums

*** TO BE CONTINUED ***
