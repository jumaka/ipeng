Exec { path => [ "/usr/local/bin/", "/bin/", "/sbin/", "/usr/bin/", "/usr/sbin/" ] }

class build-system {
  exec { "apt-get update -y":
  }

  exec { "apt-get upgrade -y":
    require => Exec["apt-get update -y"],
    returns => [0, 100],
  }

  $pkg = [ "git", "nasm", "libgd-dev", "g++", "unzip", "libflac-dev", "flac", "lame" ]

  package { $pkg:
    ensure => present,
    require => Exec["apt-get upgrade -y"],
  }

  exec { "ttf-eula-accept":
    command => "echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections",
    unless => "debconf-get-selections | grep '^ttf-mscorefonts-installer.*accepted-mscorefonts-eula.*select.*true$'",
  }

  package { "ttf-mscorefonts-installer":
    ensure => present,
    require => [Exec["ttf-eula-accept"], Exec["apt-get upgrade -y"]],
  }
}

class software-cache {
  exec { "mkdir-software":
    command => "mkdir -p /vagrant/software",
    require => Class["build-system"],
    unless => "test -d /vagrant/software",
  }
}

class get-test-software {
  exec { "get-phantom":
    command => "wget -N 'https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2'",
    cwd => "/vagrant/software",
    returns => [0, 4],
    require => Class["build-system"],
    unless => "test -f /vagrant/software/phantomjs-2.1.1-linux-x86_64.tar.bz2",
  }
  exec { "unpack-phantom":
    command => "tar xfj phantomjs-2.1.1-linux-x86_64.tar.bz2  phantomjs-2.1.1-linux-x86_64/bin/phantomjs",
    cwd => "/vagrant/software",
    require => Exec["get-phantom"],
    unless => "test -f /vagrant/software/phantomjs-2.1.1-linux-x86_64/bin/phantomjs",
  }
  exec { "inst-phantom":
    command => "cp -p phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin",
    cwd => "/vagrant/software",
    require => Exec["unpack-phantom"],
    unless => "test -f /usr/local/bin/phantomjs",
  }
  exec { "get-casper":
    command => "git clone https://github.com/n1k0/casperjs.git",
    cwd => "/vagrant/software",
    require => Class["build-system"],
    unless => "test -d /vagrant/software/casperjs",
  }
  exec { "upd-casper":
    command => "git pull",
    cwd => "/vagrant/software/casperjs",
    require => Exec["get-casper"],
  }
  exec { "inst-casper":
    command => "ln -sf /vagrant/software/casperjs/bin/casperjs /usr/local/bin",
    unless => "test -h /usr/local/bin/casperjs",
    require => Exec["upd-casper"],
  }
}

class install-lms {
  exec { "get-lms":
    command => "wget -N 'http://downloads.slimdevices.com/LogitechMediaServer_v7.8.0/logitechmediaserver_7.8.0_all.deb'",
    cwd => "/vagrant/software",
    require => [Class["software-cache"], Class["build-system"]],
    returns => [0, 4],
  }
  exec { "inst-lms":
    command => "dpkg -i logitechmediaserver_7.8.0_all.deb",
    cwd => "/vagrant/software",
    unless => "dpkg -l logitechmediaserver",
    require => Exec["get-lms"],
  }
  exec { "mkd-sq-music":
    command => "mkdir -p /home/sq/music",
    unless => "test -d /home/sq/music",
    require => Exec["inst-lms"],
  }
  exec { "cp-sq-music":
    command => "cp -rp /vagrant/music/* /home/sq/music",
    require => Exec["mkd-sq-music"],
  }
  exec { "mkd-sq-playlists":
    command => "mkdir -p /home/sq/playlists",
    unless => "test -d /home/sq/playlists",
    require => Exec["inst-lms"],
  }
  exec { "set-sq-perms":
    command => "chown -R squeezeboxserver:nogroup /home/sq",
    require => [Exec["cp-sq-music"], Exec["mkd-sq-playlists"]],
  }
  exec { "get-plugin":
    command => "git clone https://github.com/jumaka/ipeng.git",
    cwd => "/home",
    require => Class["build-system"],
    unless => "test -d /home/ipeng",
  }
  exec { "upd-plugin":
    command => "git pull",
    require => Class["build-system"],
    cwd => "/home/ipeng",
  }
  exec { "chown-plugin":
    command => "chown -R squeezeboxserver:nogroup /home/ipeng/plugin",
    require => Exec["upd-plugin"],
  }
  exec { "stop-lms":
    command => "/etc/init.d/logitechmediaserver stop",
    require => [Exec["chown-plugin"], Exec["inst-lms"]],
  }
  exec { "inst-plugin":
    command => "cp -rp /home/ipeng/plugin/* /usr/share/squeezeboxserver/Plugins",
    require => [Exec["chown-plugin"], Exec["stop-lms"]],
  }
  exec { "start-lms":
    command => "/etc/init.d/logitechmediaserver start",
    require => Exec["inst-plugin"],
  }
  exec { "wait-lms":
    command => "sleep 15",
    unless => "test -d /home/setup_log",
    require => Exec["start-lms"],
  }
  exec { "mkd-setup-log":
    command => "mkdir -p /home/setup_log",
    unless => "test -d /home/setup_log",
    require => Exec["wait-lms"],
  }
  exec { "setup-lms":
    command => "casperjs /vagrant/setup_lms.js",
    cwd => "/home/setup_log",
    require => [Exec["mkd-setup-log"],Class["get-test-software"]],
    unless => "egrep /home/sq/music /var/lib/squeezeboxserver/prefs/server.prefs",
  }
}

class install-squeezelite {
  package { [ "libasound2-dev", "libmad0-dev", "libvorbis-dev", "libfaad-dev", "libmpg123-dev" ]:
    ensure => present,
  }
  exec { "get-sl":
    command => "wget -N https://storage.googleapis.com/google-code-archive-source/v2/code.google.com/squeezelite/source-archive.zip",
    cwd => "/vagrant/software",
    unless => "test -f /vagrant/software/source-archive.zip",
  }
  exec { "unpack-sl":
    command => "unzip -o source-archive.zip",
    cwd => "/vagrant/software",
    require => Exec["get-sl"],
    unless => "test -d /vagrant/software/squeezelite",
  }
  exec { "make-sl":
    command => "make",
    cwd => "/vagrant/software/squeezelite",
    require => Exec["unpack-sl"],
    unless => "test -f /vagrant/software/squeezelite/squeezelite",
  }
  exec { "install-sl":
    command => "cp squeezelite /usr/local/bin/squeezelite",
    cwd => "/vagrant/software/squeezelite",
    require => Exec["make-sl"],
    unless => "test -f /usr/local/bin/squeezelite",
  }
  exec { "run-sl":
    command => "squeezelite -o null &",
    require => Exec["install-sl"],
    unless => "pgrep -f squeezelite",
  }
}

include build-system
include software-cache
include get-test-software
include install-lms
include install-squeezelite
