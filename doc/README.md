# iPeng documentation

---

This is a repository of documentation about this plugin.
The plugin is difficult to follow because of the
use of Template and a number of historic branches

## Site Map

<h3 id="Home">The home page</h3>

This is the default page for the plugin it as a link address of `home.html#_main`

Home Page | Description | Path
---|---|---
[Library](#Library) | Reached from *Browse Library* link on the home page | `home.html#_Database`
[More](#More) | Reached from *Browse More* link on the home page | `home.html#_Lists`
[Radio](#Radio) | Reached from the *Radio* link on the home page | `home.html#_Radio`
[Extras](#Extras) | Reached from *Extras* link on the home page | `home.html#_browseSettings`

### Bottom bar navigation

Navigation | Description | Path
---|---|---
Albums | Browse the library by album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ALBUM&mode=albums`
Artist | Browse the library by artist then album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ARTIST&mode=artists`
Lists |  Browse the play lists | `clixmlbrowser/clicmd=browselibrary+items&linktitle=SAVED_PLAYLISTS&mode=playlists`
[Search](#Search) | Search the library | `search.html`
[Home](#Home) | Back to the home page | `home.html`

The Albums, Artist and Lists icons navigate to the [library browser](#Browser).

<h3 id="Library">The library page</h3>

Library Page | Description | Path
---|---|---
Albums |Browse the library by Albums | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ALBUM&mode=albums`
New Music | List the new music newest to oldest| `/clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_NEW_MUSIC&mode=albums&wantMetadata=1&sort=new`
Years | List all the years for the music in ascending order then by album|`clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_YEAR&mode=years`
Genres | List all of the genres in the library in ascending alphabetical orders then by album | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_GENRE&mode=genres`
Artist | List all of the artists in alphabetical order | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_BY_ARTIST&mode=artists`
Music Folder |List the folders and files in the music folder heirarchically | `clixmlbrowser/clicmd=browselibrary+items&linktitle=BROWSE_MUSIC_FOLDER&mode=bmf`

<h3 id="Browser">The library browser</h3>

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

<h3 id="More">Browse More</h3>

The Browse More page gives access to a number of additional
items.

Navigation | Description | Path
---|---|---
Playlists | Lists Play lists in alphabetical order using the [library browser](#Browser) | `clixmlbrowser/clicmd=browselibrary+items&linktitle=SAVED_PLAYLISTS&mode=playlists`
Random Mix | Allow the selection of random songs, artists, albums and years. Additionally allows for the selection of Genres to play and the number of songs to be displayed in the Now Playing area  | `plugins/RandomPlay/list.html`
Favorites | Allow the selection of things that can be added to favorites. New Favorites, Folders and Imports can be created |  `plugins/Favorites/index.html`
[Search](#Search) | Search the library | `search.html`

<h3 id="Radio">Radio</h3>

Access to groups of Radio stations. Allows searching by url and genres.

Navigation | Description | Path
---|---|---
By Language | A list of Languages can be selected, then types, then genres finally the radio station | `plugins/language/index.html`
Music | A list of music genres, then stations | `plugins/music/index.html`
News | List of news shows and stations | `plugins/news/index.html`
Talk | A list of talk radio genres, then stations and shows | `plugins/talk/index.html`
My Presets | My presets from TuneIn Radio | `plugins/presets/index.html`
By Location | Continent then country, then as per Local Radio | `plugins/world/index.html`
Sports | A list of sports genres, then stations and shows | `plugins/sports/index.html`
Local Radio | A list of stations by region in the country, then by Genre, then by station | `plugins/local/index.html`
Search TuneIn | A search for TuneIn radio stations | `plugins/search/index.html`
Podcasts | A list of types, genres, then podcast | `plugins/podcast/index.html`

<h3 id="Extras">Extras</h3>

Access to advanced features and the setup pages

Navigation | Description | Path
---|---|---
Alarm Clock | Alarm Clock Settings | `#_alarmSet`
Sleep | Set time before the player goes to sleep | `#_sleep`
Re-Scan | Rescan or rebuild the Library | `#_rescanLibrary`
Server Settings | A link to a settings page (very broken) | `settings/server/basic.html`
Player Settings | Set the player up (very broken) | `settings/player/basic.html`

<h3 id="Search">Search</h3>

The search page allows the library to be searched by artist name, album title, song title or playlist name.

The searches are based upon matching words.
