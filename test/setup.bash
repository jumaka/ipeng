#!/usr/bin/env bash
getdeb () {
	ver=`echo "$1" | sed 's/\./\\./g'`
	if [ "$2" != "" ]; then
		dir="$2"
	else
		dir=http://downloads.slimdevices.com/LogitechMediaServer_v$ver
	fi
	fil=`wget -O - "$dir" | sed -n "/href=\".*$ver.*\.deb\"/s/.*href=\"\(.*$ver.*\.deb\)\".*/\1/p"`
	if [ "$fil" != "" ]; then
		wget -N "$dir/$fil" 
	fi
}
vers="$1"
if [ "$vers" = "" ]; then
	vers="7.8.0"
fi
# Pull down the dependencies for the logitech media server
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git nasm libgd-dev g++ unzip libflac-dev flac lame
echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
apt-get -y install ttf-mscorefonts-installer
# /vagrant/software is a cache for the software
mkdir -p /vagrant/software
cd /vagrant/software
# Select the version of logitech media server default to 7.8.0 - only got if not
# up to date
getdeb $vers
# Install LMS
dpkg -i logitech*$vers*.deb
# Get phantomjs and casperjs and install /usr/local/bin
cd /vagrant/software
wget -N "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2"
phjs="`tar tfj phantomjs-2.1.1-linux-x86_64.tar.bz2 | grep 'phantomjs$'`"
tar xfj phantomjs-2.1.1-linux-x86_64.tar.bz2 "$phjs"
mv "$phjs" /usr/local/bin
git clone https://github.com/n1k0/casperjs.git
cd casperjs
git pull
ln -sf `pwd`/bin/casperjs /usr/local/bin
# Build some folders to hold music and playlists and copy the starter in
mkdir /home/sq
mkdir /home/sq/music
cp -rp /vagrant/music/* /home/sq/music
mkdir /home/sq/playlists
chown -R squeezeboxserver:nogroup /home/sq/playlists
cd /home
# get the code to be tested
git clone https://github.com/jumaka/ipeng.git
chown -R squeezeboxserver:nogroup ipeng/plugin
/etc/init.d/logitechmediaserver stop
# install the plugin
cp -rp ipeng/plugin/* /usr/share/squeezeboxserver/Plugins
/etc/init.d/logitechmediaserver start
# run the set up of the media server
mkdir -p /vagrant/setup_log
cd /vagrant/setup_log
casperjs ../setup_lms.js

# squeezelite

apt-get -y install libasound2-dev libflac-dev libmad0-dev libvorbis-dev libfaad-dev libmpg123-dev
cd /vagrant/software
wget -N "https://storage.googleapis.com/google-code-archive-source/v2/code.google.com/squeezelite/source-archive.zip"
unzip -o source-archive.zip
cd squeezelite
make
cp squeezelite /usr/local/bin/squeezelite
squeezelite -o null &
exit 0
