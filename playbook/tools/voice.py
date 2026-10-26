"""Record the voice-over and measure it.

Usage: python voice.py <vo dir> [--force]

Reads script.txt, one "l01|text" line per shot. Writes l01.mp3 and friends, then dur.json,
which is what tells the rest of the pipeline how long each shot has to be.

The script has to spell every figure out. The voice reads digits as digits.

edge-tts pads every line with about a second of silence at the end. Left in, that padding
is dead air in the finished video and it quietly pushes the runtime past the target, so each
line is trimmed as it is written and dur.json holds the length of what is actually spoken.
"""
import json, os, shutil, subprocess, sys

VOICE = os.environ.get('TTS_VOICE', 'en-SG-LunaNeural')
RATE = os.environ.get('TTS_RATE', '-3%')

# Drop the silence that runs on after the last spoken word. The trailing padding of
# edge-tts is close to a second, which is more than the gap between two shots.
TRIM = 'silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-45dB'


def read_script(vo):
    lines = []
    with open(os.path.join(vo, 'script.txt'), encoding='utf-8') as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            lid, _, text = raw.partition('|')
            if not text:
                raise SystemExit('script line has no text: ' + raw)
            lines.append((lid.strip(), text.strip()))
    return lines


def synth(text, mp3):
    """Speak one line and write it to mp3, with the trailing silence cut off."""
    tts = subprocess.Popen(
        [sys.executable, '-m', 'edge_tts', '--voice', VOICE, '--rate=' + RATE,
         '--text', text, '--write-media', '-'],
        stdout=subprocess.PIPE)
    ff = subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', 'pipe:0',
         '-af', TRIM, '-q:a', '2', mp3],
        stdin=tts.stdout)
    tts.stdout.close()
    if tts.wait() != 0 or ff.returncode != 0:
        raise SystemExit('could not record: ' + text[:40])


def main(vo, force):
    lines = read_script(vo)
    ffprobe = shutil.which('ffprobe')
    ffmpeg = shutil.which('ffmpeg')
    if not ffprobe or not ffmpeg:
        raise SystemExit('ffmpeg and ffprobe have to be on PATH. Install ffmpeg and retry.')
    durations = []
    for lid, text in lines:
        mp3 = os.path.join(vo, lid + '.mp3')
        if force or not os.path.exists(mp3):
            synth(text, mp3)
        out = subprocess.run([ffprobe, '-v', 'error', '-show_entries', 'format=duration',
                              '-of', 'csv=p=0', mp3], capture_output=True, text=True, check=True)
        durations.append(round(float(out.stdout.strip()), 3))

    with open(os.path.join(vo, 'dur.json'), 'w', encoding='utf-8') as f:
        json.dump(durations, f, indent=1)

    for (lid, _), d in zip(lines, durations):
        print('%s  %.2fs' % (lid, d))
    print('speech %.2fs' % sum(durations))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--force']
    if len(args) < 1:
        print(__doc__)
        sys.exit(1)
    main(args[0], '--force' in sys.argv[1:])
