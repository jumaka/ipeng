#    Copyright (C) 2008 Erland Isaksson (erland_i@hotmail.com)
#    
#    This library is free software; you can redistribute it and/or
#    modify it under the terms of the GNU Lesser General Public
#    License as published by the Free Software Foundation; either
#    version 2.1 of the License, or (at your option) any later version.
#    
#    This library is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
#    Lesser General Public License for more details.
#    
#    You should have received a copy of the GNU Lesser General Public
#    License along with this library; if not, write to the Free Software
#    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


package Plugins::iPeng::Plugin;

use strict;

use base qw(Slim::Plugin::Base);

use Slim::Utils::Prefs;
use Slim::Buttons::Home;
use Slim::Utils::Misc;
use Slim::Utils::Strings qw(string);
use File::Spec::Functions qw(:ALL);
use File::Slurp;
use Scalar::Util qw(blessed);
use Plugins::iPeng::Settings;
use Plugins::iPeng::EnabledCommands;
use XML::Simple;
use Data::Dumper;

our $PLUGINVERSION =  undef;

my $prefs = preferences('plugin.ipeng');
my $serverPrefs = preferences('server');
my $log = Slim::Utils::Log->addLogCategory({
	'category'     => 'plugin.ipeng',
	'defaultLevel' => 'WARN',
	'description'  => 'PLUGIN_IPENG',
});

my $driver;

my %sections = ();

my $lastUpdate = undef;

=head1 NAME
Plugins::iPeng::Plugin

=head1 SYNOPSIS

=head1 DESCRIPTION
Implements the interface which make it possible for other plugins to register 
commands which should be shown in the iPeng skin in various places. The external
interface consist of the following methods for registering commands:
- addSubSection
- addCommand
- deleteCommand

=head1 METHODS

=cut

=head2 addSubSection( $section, $subsection, $data)

Register information on sub section level, this should be used for
plugins which like to register commands on a new sub section.

$section : The unique name of the section, please note that this needs to be one of the supported values
$subsection : The unique name of the sub section
$data : A hash which contains the sub section nattributes, see the subsection element in the DTD for more information

=cut

sub addSubSection {
	my $section = shift;
	my $subsection = shift;
	my $data = shift;

	if(!defined($section)) {
		$log->warn("section not specified");
		return;
	}
	if(!defined($subsection)) {
		$log->warn("subsection not specified");
		return;
	}
	if(!defined($data)) {
		$log->warn("data not specified");
		return;
	}

	my %emptysection = ();
	my $sectioncontext = \%emptysection;
	if(exists $sections{$section}) {
		$sectioncontext = $sections{$section};
	}else {
		$sections{$section} = $sectioncontext;
	}

	my %emptysubsection = ();
	my $subsectioncontext = \%emptysubsection;
	if(exists $sections{$section}->{$subsection}) {
		$subsectioncontext = $sections{$section}->{$subsection};
	}else {
		$sections{$section}->{$subsection} = $subsectioncontext;
	}
	
	foreach my $key (keys %$data) {
		if($key ne 'command') {
			$subsectioncontext->{$key} = $data->{$key};
			$lastUpdate =  Time::HiRes::time() if(!defined($lastUpdate) || $lastUpdate <  Time::HiRes::time());
		}
	}
}

=head2 addCommand( $section, $subsection, $command, $data)

Register a new command for a specific section and sub section. 
If called with an existing command it will overwrite any previously registered values 

$section : The unique name of the section, please note that this needs to be one of the supported values
$subsection : The unique name of the sub section
$command : The unique name of the command
$data : A hash which contains the command attributes, see the command element in the DTD for more information

=cut

sub addCommand {
	my $section = shift;
	my $subsection = shift;
	my $command = shift;
	my $data = shift;

	if(!defined($section)) {
		$log->warn("section not specified");
		return;
	}
	if(!defined($subsection)) {
		$log->warn("subsection not specified");
		return;
	}
	if(!defined($command)) {
		$log->warn("command not specified");
		return;
	}

	my %emptysection = ();
	my $sectioncontext = \%emptysection;
	if(exists $sections{$section}) {
		$sectioncontext = $sections{$section};
	}else {
		$sections{$section} = $sectioncontext;
	}
	
	my %emptysubsection = ();
	my $subsectioncontext = \%emptysubsection;
	if(exists $sections{$section}->{$subsection}) {
		$subsectioncontext = $sections{$section}->{$subsection};
	}else {
		$sections{$section}->{$subsection} = $subsectioncontext;
	}

	if(defined($command) && defined($data)) {
		$log->debug("Adding command: $command ".Dumper($data));
		$subsectioncontext->{'command'}->{$command} = $data;
		$lastUpdate =  Time::HiRes::time() if(!defined($lastUpdate) || $lastUpdate <  Time::HiRes::time());
	}elsif(defined($command)) {
		$log->debug("Deleting command: $command ");
		delete $subsectioncontext->{'command'}->{$command} if exists $subsectioncontext->{'command'};
		$lastUpdate =  Time::HiRes::time() if(!defined($lastUpdate) || $lastUpdate <  Time::HiRes::time());
	}
}

=head2 deleteCommand( $section, $subsection, $command)

Removes a command previously registered for a specific section and sub section. 

$section : The unique name of the section, please note that this needs to be one of the supported values
$subsection : The unique name of the sub section
$command : The unique name of the command

=cut

sub deleteCommand {
	my $section = shift;
	my $subsection = shift;
	my $command = shift;

	if(!defined($section)) {
		$log->warn("section not specified");
		return undef;
	}
	if(!defined($subsection)) {
		$log->warn("subsection not specified");
		return undef;
	}
	if(!defined($command)) {
		$log->warn("command not specified");
		return undef;
	}

	if(exists $sections{$section}) {
		if(exists $sections{$section}->{$subsection}) {
			my $context = $sections{$section}->{$subsection};
			if(exists $context->{'command'} && exists $context->{'command'}->{$command}) {
				$log->debug("Deleting command: $command");
				delete $context->{'command'}->{$command};
				$lastUpdate = Time::HiRes::time() if(!defined($lastUpdate) || $lastUpdate < Time::HiRes::time());
			}else {
				$log->warn("Command $command does not exist");
			}
		}
	}	
}

sub initPlugin {
	my $class = shift;
	$class->SUPER::initPlugin(@_);
	$PLUGINVERSION = Slim::Utils::PluginManager->dataForPlugin($class)->{'version'};
	Plugins::iPeng::Settings->new();
	Plugins::iPeng::EnabledCommands->new();
	checkDefaults();

	# Read the configuration files, just to show any errors directly at plugin startup
	my %fileItems = ();
	_readConfigurationFromFiles(\%fileItems);
	#foreach my $item (keys %fileItems) {
	#	my $sections = $fileItems{$item}->{'section'};
	#	foreach my $section (keys %$sections) {
	#		my $commands = $sections->{$section}->{'command'};
	#		foreach my $command (keys %$commands) {
	#			#addCommandLink($section,$command,$commands->{$command});
	#		}
	#	}
	#}
}

sub _copySubSection {
	my $subsection = shift;

	my %result = ();
	foreach my $subsectionAttr (keys %$subsection) {
		if($subsectionAttr eq 'command') {
			my $commands = $subsection->{$subsectionAttr};
			my %resultCommands = ();
			foreach my $commandKey (keys %$commands) {
				$resultCommands{$commandKey} = $commands->{$commandKey};
			}
			$result{'command'} = \%resultCommands;
		}else {
			$result{$subsectionAttr} = $subsection->{$subsectionAttr};
		}
	}
	return \%result;
}
sub _copySubSections {
	my $subsections = shift;

	my %result = ();
	foreach my $subsectionKey (keys %$subsections) {
		my $subsection = $subsections->{$subsectionKey};
		$result{$subsectionKey} = _copySubSection($subsection);
	}
	return \%result;
}

sub _readConfigurationForSection {
	my $section = shift;

	my $pluginContext = $sections{$section};
	my %context = ();

	# Read configuration provided by plugins
	my $context = _copySubSections($pluginContext);
	my %fileItems = ();
	
	# Read configuration from ipeng.xml files
	_readConfigurationFromFiles(\%fileItems);
	foreach my $file (keys %fileItems) {
		if(defined($fileItems{$file}->{'section'}->{$section}) && defined($fileItems{$file}->{'section'}->{$section}->{'subsection'})) {
			my $fileContext = $fileItems{$file}->{'section'}->{$section}->{'subsection'};
			foreach my $key (keys %$fileContext) {
				if(!defined($context->{$key})) {
					$context->{$key} = _copySubSection($fileContext->{$key});
				}else {
					my $commands = $context->{$key}->{'command'};
					my $fileCommands = $fileContext->{$key}->{'command'};
					foreach my $id (keys %$fileCommands) {
						$commands->{$id} = $fileCommands->{$id};
					}
				}
			}
		}
	}
	return $context;
}

sub readConfiguration {
	my %fileItems = ();
	
	# Read configuration from ipeng.xml files
	_readConfigurationFromFiles(\%fileItems);

	my %context;

	# Read configuration provided by plugins
	foreach my $key (keys %sections) {
		my $subsections = $sections{$key};
		$context{$key} = _copySubSections($subsections);
	}

	foreach my $file (keys %fileItems) {
		my $fileSection = $fileItems{$file}->{'section'};
		foreach my $sect (keys %$fileSection) {
			my $section = _readConfigurationForSection($sect);
			$context{$sect}=$section;
		}
	}
	return \%context;
}

sub _readConfigurationFromFiles {
	my $items = shift;
	my @pluginDirs = Slim::Utils::OSDetect::dirsFor('Plugins');
	for my $plugindir (@pluginDirs) {
		$log->debug("Checking for dir: ".catdir($plugindir,"iPeng","Configuration")."\n");
		next unless -d catdir($plugindir,"iPeng","Configuration");
		_readFromDir(catdir($plugindir,"iPeng","Configuration"),$items);
	}
	my $configDir = $prefs->get('config_dir');
	$log->debug("Checking for dir: $configDir\n");
	if($configDir && -d $configDir) {
		_readFromDir($configDir,$items);
	}
}

sub postinitPlugin {
	Slim::Control::Request::addDispatch(['ipeng','commands','_type'], [1, 1, 1, \&jsonHandler]);
	Slim::Control::Request::addDispatch(['ipeng','status'], [1, 1, 0, \&jsonStatusHandler]);
}

sub shutdownPlugin {
	Slim::Control::Request::unsubscribe(\&jsonHandler);
	Slim::Control::Request::unsubscribe(\&jsonStatusHandler);
}


sub checkDefaults {
	my $prefVal = $prefs->get('config_dir');
	if (! defined $prefVal) {
		my $dir=$serverPrefs->get('playlistdir');
		$log->debug("Defaulting config_dir to:$dir\n");
		$prefs->set('config_dir', $dir);
	}
}

sub getCommands {
	my $client = shift;
	my $section = shift;
	my $subsection = shift;
	my $max = shift;

	my $context = _readConfigurationForSection($section);

	# Iterate through all sub sections for the requested section
	foreach my $key (keys %$context) {
		# Insert the 'id' for the sub section
		$context->{$key}->{'id'} = $key;

		# Insert the 'id' for each command in the current sub section
		my $commands = $context->{$key}->{'command'};
		foreach my $command_id (keys %$commands) {
			$commands->{$command_id}->{'id'} = $command_id;
			my $enabled = $prefs->get('command_'.escape($section."_".$key."_".$command_id).'_enabled');
			if(defined($enabled) && !$enabled) {
				delete $commands->{$command_id};
			}elsif(exists $commands->{$command_id}->{'requireplugins'} && !_isPluginsInstalled($client,$commands->{$command_id}->{'requireplugins'})) {
				delete $commands->{$command_id};
			}elsif(exists $commands->{$command_id}->{'defaultenabled'} && !$commands->{$command_id}->{'defaultenabled'} && !defined($enabled)) {
				delete $commands->{$command_id};
			}
		}

		# Sort the commands in the current sub section by 'weight'
		my @commandArray = values %$commands;
		@commandArray = sortByWeight(@commandArray);

		# Replace the 'command' hash with a 'commands_loop' array
		delete $context->{$key}->{'command'};
		if(scalar(@commandArray)>0) {
			if(!defined($subsection) || $key eq '*' || $key eq $subsection) {
				$context->{$key}->{'commands_loop'} = \@commandArray;
				$context->{$key}->{'count'} = scalar(@commandArray);
			}else {
				delete $context->{$key};
			}
		}else {
			delete $context->{$key};
		}
	}

	# Sort the sub sections by 'weight'
	my @menu = values %$context;

	# If subsection is defined, we should only return the matching commands
	if(defined($subsection)) {

		my @subsectionCommands = ();
		my @wildcardCommands = ();
		foreach my $item (@menu) {
			my $commands = $item->{'commands_loop'};
			if($item->{'id'} eq '*') {
				push @wildcardCommands,@$commands;
			}else {
				push @subsectionCommands,@$commands;
			}
		}
		push @subsectionCommands,@wildcardCommands;
		@menu = @subsectionCommands;

	}else {
		@menu = sortByWeight(@menu);
	}

	# If max is defined, we should prefer commands with subsection defined
	if(defined($max)) {
		@menu = splice(@menu,0,$max);
		@menu = sortByWeight(@menu);
	}

	return \@menu;
}
sub jsonHandler {
	$log->debug("Entering jsonHandler\n");
	my $request = shift;
	my $client = $request->client();

	if (!$request->isQuery([['ipeng'],['commands']])) {
		$log->warn("Incorrect command\n");
		$request->setStatusBadDispatch();
		$log->debug("Exiting jsonHandler\n");
		return;
	}
	if(!defined $client) {
		$log->warn("Client required\n");
		$request->setStatusNeedsClient();
		$log->debug("Exiting jsonHandler\n");
		return;
	}
	my $params = $request->getParamsCopy();

	for my $k (keys %$params) {
		$log->debug("Got parameter: $k=".$params->{$k}."\n");
	}

	if(!defined($params->{'_type'})) {
		$log->warn("section not specified");
		$request->setStatusBadParams();
		$log->debug("Exiting jsonHandler\n");
		return;
	}	

	$log->debug("Executing CLI commands command\n");

	my $menuResult = getCommands($client,$params->{'_type'},$params->{'subsection'},$params->{'max'});

	$request->addResult('timestamp',$lastUpdate);
	$request->addResult('count',scalar(@$menuResult));

	my $subsection = $params->{'subsection'};
	# Add the array of sub sections as a subsections_loop
	my $cnt = 0;
	foreach my $item (@$menuResult) {

		if(defined($subsection)) {
			foreach my $key (keys %$item) {
				$request->addResultLoop('commands',$cnt,$key,$item->{$key});
			}
		}else {
			foreach my $key (keys %$item) {
				$request->addResultLoop('subsections',$cnt,$key,$item->{$key});
			}
		}
		$cnt++;
	}

	$request->setStatusDone();
	$log->debug("Exiting jsonHandler\n");
}

sub sortByWeight {
	my @array = @_;

	@array = sort { 
		if(defined($a->{'weight'}) && defined($b->{'weight'})) {
			if($a->{'weight'}!=$b->{'weight'}) {
				return $a->{'weight'} <=> $b->{'weight'};
			}
		}
		if(defined($a->{'weight'}) && !defined($b->{'weight'})) {
			if($a->{'weight'}!=50) {
				return $a->{'weight'} <=> 50;
			}
		}
		if(!defined($a->{'weight'}) && defined($b->{'weight'})) {
			if($b->{'weight'}!=50) {
				return 50 <=> $b->{'weight'};
			}
		}
		return 0; 
	} @array;
	return @array;
}

sub jsonStatusHandler {
	$log->debug("Entering jsonStatusHandler\n");
	my $request = shift;
	my $client = $request->client();

	if (!$request->isQuery([['ipeng'],['status']])) {
		$log->warn("Incorrect command\n");
		$request->setStatusBadDispatch();
		$log->debug("Exiting jsonStatusHandler\n");
		return;
	}
	if(!defined $client) {
		$log->warn("Client required\n");
		$request->setStatusNeedsClient();
		$log->debug("Exiting jsonStatusHandler\n");
		return;
	}

	$request->addResult('timestamp',$lastUpdate);

	$request->setStatusDone();
	$log->debug("Exiting jsonStatusHandler\n");
}

sub updateLastUpdateTime {
	my $time = shift || Time::HiRes::time();
	$lastUpdate = $time if(!defined($lastUpdate) || $lastUpdate < $time);
}

sub _isPluginsInstalled {
        my $client = shift;
        my $pluginList = shift;
        my $enabledPlugin = 1;
        foreach my $plugin (split /,/, $pluginList) {
                if($enabledPlugin) {
                        $enabledPlugin = grep(/$plugin/, Slim::Utils::PluginManager->enabledPlugins($client));
                }
        }
        return $enabledPlugin;
}

sub _readFromDir {
	my $dir = shift;
	my $items = shift;

	$log->debug("Loading configuration from: $dir\n");

	my @dircontents = Slim::Utils::Misc::readDirectory($dir,"ipeng.xml");
	my $extensionRegexp = "\\.ipeng\\.xml\$";

	# Iterate through all files in the specified directory
	for my $item (@dircontents) {
		next unless $item =~ /$extensionRegexp/;
		next if -d catdir($dir, $item);

		my $path = catfile($dir, $item);
		my $timestamp = (stat ($path) )[9];

		# Read the contents of the current file
		my $content = eval { read_file($path) };
		if ( $content ) {
			# Make sure to convert the file data to utf8
			my $encoding = Slim::Utils::Unicode::encodingFromString($content);
			if($encoding ne 'utf8') {
				$content = Slim::Utils::Unicode::latin1toUTF8($content);
				$content = Slim::Utils::Unicode::utf8on($content);
				$log->debug("Loading $item and converting from latin1\n");
			}else {
				$content = Slim::Utils::Unicode::utf8decode($content,'utf8');
				$log->debug("Loading $item without conversion with encoding ".$encoding."\n");
			}
		}

		# Parse the file using XML::Simple
		if ( $content ) {
                	$log->debug("Parsing file: $path\n");
			my $xml = eval { XMLin($content, forcearray => ["command","section","subsection"], keyattr => ["id"]) };
			if ($@) {
				$log->warn("Failed to parse configuration ($item) because:\n$@\n");
			}else {
				$items->{$item} = $xml;
				$lastUpdate = $timestamp if(!defined($lastUpdate) || $lastUpdate < $timestamp);
			}
		}else {
			if ($@) {
				$log->warn("Unable to open file: $path\nBecause of:\n$@\n");
			}else {
				$log->warn("Unable to open file: $path\n");
			}
		}
	}
}

# other people call us externally.
*escape   = \&URI::Escape::uri_escape_utf8;

1;

__END__
