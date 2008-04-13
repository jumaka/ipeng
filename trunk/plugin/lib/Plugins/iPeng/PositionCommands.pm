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

package Plugins::iPeng::PositionCommands;

use strict;
use base qw(Plugins::iPeng::BaseSettings);

use File::Basename;
use File::Next;

use Slim::Utils::Log;
use Slim::Utils::Prefs;
use Slim::Utils::Misc;
use Slim::Utils::Strings;

my $prefs = preferences('plugin.ipeng');
my $log   = logger('plugin.ipeng');

my $plugin; # reference to main plugin

sub new {
	my $class = shift;
	$plugin   = shift;

	$class->SUPER::new($plugin);
}

sub name {
	return 'PLUGIN_IPENG_SETTINGS_POSITIONCOMMANDS';
}

sub page {
	return 'plugins/iPeng/settings/positioncommands.html';
}

sub currentPage {
	return name();
}

sub pages {
	my %page = (
		'name' => name(),
		'page' => page(),
	);
	my @pages = (\%page);
	return \@pages;
}

sub initCommands {
	my $configuration = shift;

	my @commandsResult = ();
	for my $sectionKey (keys %$configuration) {
		my $sections = $configuration->{$sectionKey};
		if($sectionKey ne 'toolbar') {
			for my $subSectionKey (keys %$sections) {
				my %webmenu = ();
				$webmenu{'id'} = $subSectionKey;
				if(exists $sections->{$subSectionKey}->{'name'}) {
					$webmenu{'name'} = $sections->{$subSectionKey}->{'name'};
				}else {
					$webmenu{'name'} = $subSectionKey;
				}
				if(exists $sections->{$subSectionKey}->{'namestring'}) {
					$webmenu{'name'} = Slim::Utils::Strings::getString($sections->{$subSectionKey}->{'namestring'});
				}
				$webmenu{'id'} = $sectionKey."_".$webmenu{'id'};
				$webmenu{'group'} = $sectionKey;
				$webmenu{'subsection'} = 1;
				$webmenu{'position'} = $prefs->get('subsection_'.escape($webmenu{'id'}).'_position');
				if(!defined($webmenu{'position'}) && exists $sections->{$subSectionKey}->{'position'}) {
					$webmenu{'position'} = $sections->{$subSectionKey}->{'position'};
				}
				if(exists $sections->{$subSectionKey}->{'description'}) {
					$webmenu{'description'} = $sections->{$subSectionKey}->{'description'};
				}
				push @commandsResult,\%webmenu;
			}
		}
	}

	for my $sectionKey (keys %$configuration) {
		my $sections = $configuration->{$sectionKey};
		for my $subSectionKey (keys %$sections) {
			my $commands = $sections->{$subSectionKey}->{'command'};
			for my $commandKey (keys %$commands) {
				my $enabled = $prefs->get('command_'.escape($sectionKey."_".$subSectionKey."_".$commandKey).'_enabled');
				if(defined($enabled) && $enabled) {
					$enabled = 1;
				}elsif((!exists $commands->{$commandKey}->{'defaultenabled'} || $commands->{$commandKey}->{'defaultenabled'}) && !defined($enabled)) {
					$enabled = 1;
				} else {
					$enabled = 0;
				}
				if($enabled) {
					my %webmenu = ();
					$webmenu{'id'} = $commandKey;
					if(exists $commands->{$commandKey}->{'name'}) {
						$webmenu{'name'} = $commands->{$commandKey}->{'name'};
					}else {
						$webmenu{'name'} = $commandKey;
					}
					if(exists $commands->{$commandKey}->{'namestring'}) {
						$webmenu{'name'} = Slim::Utils::Strings::getString($commands->{$commandKey}->{'namestring'});
					}
					$webmenu{'id'} = $sectionKey."_".$subSectionKey."_".$webmenu{'id'};
					if(exists $sections->{$subSectionKey}->{'namestring'}) {
						$webmenu{'group'} = $sectionKey."/".Slim::Utils::Strings::getString($sections->{$subSectionKey}->{'namestring'});
					}elsif(exists $sections->{$subSectionKey}->{'name'}) {
						$webmenu{'group'} = $sectionKey."/".$sections->{$subSectionKey}->{'name'};
					}else {
						$webmenu{'group'} = $sectionKey."/".$subSectionKey;
					}
					$webmenu{'position'} = $prefs->get('command_'.escape($webmenu{'id'}).'_position');
					if(!defined($webmenu{'position'}) && exists $commands->{$commandKey}->{'position'}) {
						$webmenu{'position'} = $commands->{$commandKey}->{'position'};
					}
					if(exists $commands->{$commandKey}->{'description'}) {
						$webmenu{'description'} = $commands->{$commandKey}->{'description'};
					}
					push @commandsResult,\%webmenu;
				}
			}
		}
	}
	@commandsResult = sort { 
		if(exists $a->{'subsection'} && !exists $b->{'subsection'}) {
			return 1;
		}elsif(!exists $a->{'subsection'} && exists $b->{'subsection'}) {
			return -1;
		}else {
			return $a->{'id'} cmp $b->{'id'};
		}
	} @commandsResult;
	return @commandsResult;
}

sub handler {
	my ($class, $client, $paramRef) = @_;

	my $configuration = Plugins::iPeng::Plugin::readConfiguration();

	my @commands = initCommands($configuration);
        $paramRef->{'pluginiPengCommands'} = \@commands;

	if ($paramRef->{'saveSettings'}) {
		for my $sectionKey (keys %$configuration) {
			my $sections = $configuration->{$sectionKey};
			for my $subSectionKey (keys %$sections) {
				my $commands = $sections->{$subSectionKey}->{'command'};
				for my $commandKey (keys %$commands) {
					my $commandid = "command_".escape($sectionKey."_".$subSectionKey."_".$commandKey);
					my $enabled = $prefs->get($commandid.'_enabled');
					if(defined($enabled) && $enabled) {
						$enabled = 1;
					}elsif((!exists $commands->{$commandKey}->{'defaultenabled'} || $commands->{$commandKey}->{'defaultenabled'}) && !defined($enabled)) {
						$enabled = 1;
					} else {
						$enabled = 0;
					}
					if($enabled) {
						my $currentPosition = $prefs->get($commandid.'_position');
						if(!defined($currentPosition) && exists $commands->{$commandKey}->{'position'}) {
							$currentPosition = $commands->{$commandKey}->{'position'};
						}elsif(!$currentPosition && !exists $commands->{$commandKey}->{'position'}) {
							$currentPosition = undef;
						}
						if($paramRef->{$commandid.'_position'}) {
							if(($currentPosition && $paramRef->{$commandid.'_position'} ne $currentPosition) || !$currentPosition) {
								$prefs->set($commandid.'_position',$paramRef->{$commandid.'_position'});
								Plugins::iPeng::Plugin::updateLastUpdateTime();
							}
						}elsif(exists $commands->{$commandKey}->{'position'} && $paramRef->{$commandid.'_position'} ne '') {
							$prefs->set($commandid.'_position','0');
							Plugins::iPeng::Plugin::updateLastUpdateTime();
						}else {
							$prefs->remove($commandid.'_position');
							Plugins::iPeng::Plugin::updateLastUpdateTime();
						}
					}
				}
			}
		}
		for my $sectionKey (keys %$configuration) {
			my $sections = $configuration->{$sectionKey};
			if($sectionKey ne 'toolbar') {
				for my $subSectionKey (keys %$sections) {
					my $subsectionid = 'subsection_'.escape($sectionKey."_".$subSectionKey);
					my $currentPosition = $prefs->get($subsectionid.'_position');
					if(!defined($currentPosition) && exists $sections->{$subSectionKey}->{'position'}) {
						$currentPosition = $sections->{$subSectionKey}->{'position'};
					}elsif(!$currentPosition && !exists $sections->{$subSectionKey}->{'position'}) {
						$currentPosition = undef;
					}
					if($paramRef->{$subsectionid.'_position'}) {
						if(($currentPosition && $paramRef->{$subsectionid.'_position'} ne $currentPosition) || !$currentPosition) {
							$prefs->set($subsectionid.'_position',$paramRef->{$subsectionid.'_position'});
							Plugins::iPeng::Plugin::updateLastUpdateTime();
						}
					}elsif(exists $sections->{$subSectionKey}->{'position'} && $paramRef->{$subsectionid.'_position'} ne '') {
						$prefs->set($subsectionid.'_position','0');
						Plugins::iPeng::Plugin::updateLastUpdateTime();
					}else {
						$prefs->remove($subsectionid.'_position');
						Plugins::iPeng::Plugin::updateLastUpdateTime();
					}
				}
			}
		}
		@commands = initCommands($configuration);
	        $paramRef->{'pluginiPengCommands'} = \@commands;
        }

	return $class->SUPER::handler($client, $paramRef);
}


# other people call us externally.
*escape   = \&URI::Escape::uri_escape_utf8;

		
1;
