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


package HTML::iPeng::iPeng;

use strict;
use base qw(Template::Plugin);

use Plugins::iPeng::Plugin;

sub commands {
	my $self = shift;
	my $section = shift;
	my $subsection = shift;
	my $max = shift;
	
	return Plugins::iPeng::Plugin::getCommands(undef,$section,$subsection,$max);
}

sub additionalLinks {
	my $self = shift;
	my $section = shift;
	my $max = shift;
	
	return Plugins::iPeng::Plugin::getAdditionalLinks($section,$max);
}

1;
