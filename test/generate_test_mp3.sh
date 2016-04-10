#!/usr/bin/env bash
#
# Generate a bunch of mp3's as tones using ffmpeg. Note this does not work
# with avconv 
#
# Justin Saunders
#
function generate()
{
	ffmpeg -y -f lavfi -i sine=frequency=$3:duration=1 \
		-id3v2_version 3 -write_id3v1 1 \
		-metadata artist="$4" -metadata album="$5" \
		-metadata genre="$6" -metadata year="200$5" \
		-metadata title="$2" -metadata track=$7 $1-$2.mp3
}
generate 25 A2 110 "Def Tones" 0 "Genre 0" 1
generate 37 A3 220 "Def Tones" 0 "Genre 0" 2
generate 49 A4 440 "Def Tones" 0 "Genre 0" 3
generate 61 A5 880 "Def Tones" 0 "Genre 0" 4
generate 73 A6 1760 "Def Tones" 0 "Genre 0" 5
generate 85 A7 3520 "Def Tones" 0 "Genre 0" 6
generate 12 G♯1-A♭1 51.9131 "Def Tones" 1 "Genre 1" 1
generate 21 F2 87.3071 "Def Tones" 1 "Genre 1" 2
generate 26 A♯2-B♭2 116.541 "Def Tones" 1 "Genre 1" 3
generate 27 B2 123.471 "Def Tones" 1 "Genre 1" 4
generate 29 C♯3-D♭3 138.591 "Def Tones" 1 "Genre 1" 5
generate 52 C5 523.251 "Def Tones" 1 "Genre 1" 6
generate 59 G5 783.991 "Def Tones" 1 "Genre 1" 7
generate 67 D♯6-E♭6 1244.51 "Def Tones" 1 "Genre 1" 8
generate 68 E6 1318.51 "Def Tones" 1 "Genre 1" 9
generate 69 F6 1396.91 "Def Tones" 1 "Genre 1" 10
generate 6 D1 36.7081 "Def Tones" 1 "Genre 1" 11
generate 86 A♯7-B♭7 3729.31 "Def Tones" 1 "Genre 1" 12
generate 88 C8 4186.01 "Def Tones" 1 "Genre 1" 13
generate 18 D2 73.4162 "Def Tones" 2 "Genre 2" 1
generate 2 A♯0-B♭0 29.1352 "Def Tones" 2 "Genre 2" 2
generate 30 D3 146.832 "Def Tones" 2 "Genre 2" 3
generate 36 G♯3-A♭3 207.652 "Def Tones" 2 "Genre 2" 4
generate 38 A♯3-B♭3 233.082 "Def Tones" 2 "Genre 2" 5
generate 39 B3 246.942 "Def Tones" 2 "Genre 2" 6
generate 4 C1 32.7032 "Def Tones" 2 "Genre 2" 7
generate 72 G♯6-A♭6 1661.22 "Def Tones" 2 "Genre 2" 8
generate 78 D7 2349.32 "Def Tones" 2 "Genre 2" 9
generate 79 D♯7-E♭7 2489.02 "Def Tones" 2 "Genre 2" 10
generate 80 E7 2637.02 "Def Tones" 2 "Genre 2" 11
generate 10 F♯1-G♭1 46.2493 "Def Tones" 3 "Genre 3" 1
generate 28 C3 130.813 "Def Tones" 3 "Genre 3" 2
generate 31 D♯3-E♭3 155.563 "Def Tones" 3 "Genre 3" 3
generate 41 C♯4-D♭4 277.183 "Def Tones" 3 "Genre 3" 4
generate 51 B4 493.883 "Def Tones" 3 "Genre 3" 5
generate 54 D5 587.33 "Def Tones" 3 "Genre 3" 6
generate 65 C♯6-D♭6 1108.73 "Def Tones" 3 "Genre 3" 7
generate 75 B6 1975.53 "Def Tones" 3 "Genre 3" 8
generate 76 C7 2093 "Def Tones" 3 "Genre 3" 9
generate 81 F7 2793.83 "Def Tones" 3 "Genre 3" 10
generate 11 G1 48.9994 "Def Tones" 4 "Genre 4" 1
generate 15 B1 61.7354 "Def Tones" 4 "Genre 4" 2
generate 16 C2 65.4064 "Def Tones" 4 "Genre 4" 3
generate 32 E3 164.814 "Def Tones" 4 "Genre 4" 4
generate 33 F3 174.614 "Def Tones" 4 "Genre 4" 5
generate 46 F♯4-G♭4 369.994 "Def Tones" 4 "Genre 4" 6
generate 50 A♯4-B♭4 466.164 "Def Tones" 4 "Genre 4" 7
generate 55 D♯5-E♭5 622.254 "Def Tones" 4 "Genre 4" 8
generate 84 G♯7-A♭7 3322.44 "Def Tones" 4 "Genre 4" 9
generate 8 E1 41.2034 "Def Tones" 4 "Genre 4" 10
generate 13 A1 55 "Def Tones" 5 "Genre 5" 1
generate 14 A♯1-B♭1 58.2705 "Def Tones" 5 "Genre 5" 2
generate 42 D4 293.665 "Def Tones" 5 "Genre 5" 3
generate 47 G4 391.995 "Def Tones" 5 "Genre 5" 4
generate 48 G♯4-A♭4 415.305 "Def Tones" 5 "Genre 5" 5
generate 53 C♯5-D♭5 554.365 "Def Tones" 5 "Genre 5" 6
generate 56 E5 659.255 "Def Tones" 5 "Genre 5" 7
generate 9 F1 43.6535 "Def Tones" 5 "Genre 5" 8
generate 22 F♯2-G♭2 92.4986 "Def Tones" 6 "Genre 6" 1
generate 24 G♯2-A♭2 103.826 "Def Tones" 6 "Genre 6" 2
generate 40 C4 261.626 "Def Tones" 6 "Genre 6" 3
generate 57 F5 698.456 "Def Tones" 6 "Genre 6" 4
generate 64 C6 1046.5 "Def Tones" 6 "Genre 6" 5
generate 66 D6 1174.66 "Def Tones" 6 "Genre 6" 6
generate 74 A♯6-B♭6 1864.66 "Def Tones" 6 "Genre 6" 7
generate 77 C♯7-D♭7 2217.46 "Def Tones" 6 "Genre 6" 8
generate 82 F♯7-G♭7 2959.96 "Def Tones" 6 "Genre 6" 9
generate 83 G7 3135.96 "Def Tones" 6 "Genre 6" 10
generate 17 C♯2-D♭2 69.2957 "Def Tones" 7 "Genre 7" 1
generate 19 D♯2-E♭2 77.7817 "Def Tones" 7 "Genre 7" 2
generate 1 A0 27.5 "Def Tones" 7 "Genre 7" 3
generate 34 F♯3-G♭3 184.997 "Def Tones" 7 "Genre 7" 4
generate 3 B0 30.8677 "Def Tones" 7 "Genre 7" 5
generate 43 D♯4-E♭4 311.127 "Def Tones" 7 "Genre 7" 6
generate 63 B5 987.767 "Def Tones" 7 "Genre 7" 7
generate 87 B7 3951.07 "Def Tones" 7 "Genre 7" 8
generate 35 G3 195.998 "Def Tones" 8 "Genre 8" 1
generate 44 E4 329.628 "Def Tones" 8 "Genre 8" 2
generate 45 F4 349.228 "Def Tones" 8 "Genre 8" 3
generate 5 C♯1-D♭1 34.6478 "Def Tones" 8 "Genre 8" 4
generate 62 A♯5-B♭5 932.328 "Def Tones" 8 "Genre 8" 5
generate 70 F♯6-G♭6 1479.98 "Def Tones" 8 "Genre 8" 6
generate 71 G6 1567.98 "Def Tones" 8 "Genre 8" 7
generate 20 E2 82.4069 "Def Tones" 9 "Genre 9" 1
generate 23 G2 97.9989 "Def Tones" 9 "Genre 9" 2
generate 58 F♯5-G♭5 739.989 "Def Tones" 9 "Genre 9" 3
generate 60 G♯5-A♭5 830.609 "Def Tones" 9 "Genre 9" 4
generate 7 D♯1-E♭1 38.8909 "Def Tones" 9 "Genre 9" 5
