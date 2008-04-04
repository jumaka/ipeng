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

package Plugins::iPeng::EnabledCommands;

use strict;
use base qw(Plugins::iPeng::BaseSettings);

use File::Basename;
use File::Next;

use Slim::Utils::Log;
use Slim::Utils::Prefs;
use Slim::Utils::Misc;

my $prefs = preferences('plugin.ipeng');
my $log   = logger('plugin.ipeng');

my $plugin; # reference to main plugin

sub new {
	my $class = shift;
	$plugin   = shift;

	$class->SUPER::new($plugin);
}

sub name {
	return 'PLUGIN_IPENG_SETTINGS_ENABLEDCOMMANDS';
}

sub page {
	return 'plugins/iPeng/settings/enabledcommands.html';
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
		for my $subSectionKey (keys %$sections) {
			my $commands = $sections->{$subSectionKey}->{'command'};
			for my $commandKey (keys %$commands) {
				my %webmenu = ();
				$webmenu{'id'} = $commandKey;
				if(exists $commands->{$commandKey}->{'name'}) {
					$webmenu{'name'} = $commands->{$commandKey}->{'name'};
				}else {
					$webmenu{'name'} = $commandKey;
				}
				$webmenu{'id'} = $sectionKey."_".$subSectionKey."_".$webmenu{'id'};
				$webmenu{'name'} = $sectionKey."/".$subSectionKey."/".$webmenu{'name'};
				my $enabled = $prefs->get('command_'.escape($webmenu{'id'}).'_enabled');
				if(!defined($enabled) || $enabled) {
					$webmenu{'enabled'} = 1;
				}else {
					$webmenu{'enabled'} = 0;
				}
				push @commandsResult,\%webmenu;
			}
		}
	}
	@commandsResult = sort { $a->{'name'} cmp $b->{'name'} } @commandsResult;
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
		        	        if($paramRef->{$commandid}) {
		        	                $prefs->set($commandid.'_enabled',1);
		        	        }else {
		        	                $prefs->set($commandid.'_enabled',0);
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
