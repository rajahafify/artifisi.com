"""Record the voice-over, measure it, and time every word.

Usage: python voice.py <vo dir> [--force]

Reads script.txt, one "l01|text" line per shot. Writes l01.mp3 and friends, then dur.json,
which is what tells the rest of the pipeline how long each shot has to be, and words.json,
which is what lets a label arrive at the moment the voice says the number it names.

The script has to spell every figure out. The voice reads digits as digits.

Two trims happen, and both of them change the length of the line.

The first is the pause between sentences. edge-tts pads every sentence with about nine
tenths of a second of silence, which is a hole and not a breath: left in, the voice reads
as though it is being chased. Every pause longer than BREATH is cut back to BREATH, from
the front, so the end of the pause is what survives. A line that keeps its holes runs a
second and a half longer than the same line read at the pace anybody would read it.

The second is the air after the last word, which edge-tts pads with about a second. It is
dead air in the finished video and it quietly pushes the runtime past the target.

Both trims move the words, so the word offsets are remapped afterwards. The offsets
edge-tts reports are true of the audio it sent, and the offsets written to words.json have
to be true of the file on disk, which is the one the film plays.
"""
import asyncio, json, os, re, shutil, subprocess, sys, tempfile

VOICE = os.environ.get('TTS_VOICE', 'en-SG-LunaNeural')
RATE = os.environ.get('TTS_RATE', '-3%')

# The pause a narrator takes between sentences. Anything longer is padding.
BREATH = 0.32
# The air left after the last word, so the cut does not clip a final consonant.
TAIL = 0.2


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


def speak(text):
    """Speak one line. Returns the audio and the words, with a start and an end each.

    The words are measured against the audio that comes back, in seconds.
    """
    import edge_tts
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, boundary='WordBoundary')
    audio = bytearray()
    words = []

    async def run():
        async for chunk in comm.stream():
            if chunk['type'] == 'audio':
                audio.extend(chunk['data'])
            elif chunk['type'] == 'WordBoundary':
                words.append((chunk['text'],
                              chunk['offset'] / 1e7,
                              (chunk['offset'] + chunk['duration']) / 1e7))

    asyncio.run(run())
    return bytes(audio), words


def norm(s):
    """Reduce a word to the letters that carry its sound, so a cue can find it."""
    return re.sub(r"[^a-z0-9']+", "", s.lower())


def segments(words):
    """The pieces of audio the trimmed line is made of.

    A gap between two words is a pause. When the gap is longer than BREATH the pause is
    cut in two: the first BREATH of it survives, the rest is dropped, and the line picks
    up again at the next word. The gap is never left whole, because a hole nine tenths
    of a second wide is not a pause, it is a hole.
    """
    segs = []
    start = 0.0
    for i in range(len(words) - 1):
        if words[i + 1][1] - words[i][2] > BREATH:
            segs.append((start, words[i][2] + BREATH))
            start = words[i + 1][1]
    segs.append((start, words[-1][2] + TAIL))
    return segs


def remap(words, segs):
    """Put the word offsets on the timeline of the trimmed file.

    The trimmed file is the segments laid end to end, so a word moves by however much
    was cut before it.
    """
    starts = []
    at = 0.0
    for a, b in segs:
        starts.append(at)
        at += b - a
    out = []
    for w, s, e in words:
        k = 0
        while k < len(segs) - 1 and s >= segs[k][1]:
            k += 1
        shift = starts[k] - segs[k][0]
        out.append((w, s + shift, e + shift))
    return out


def sentences(text, words):
    """Lay the sentences of a line over the words that cover them.

    The words come back in order, so each sentence takes the words that match it and the
    sentence runs from the start of its first word to the end of its last one.
    """
    out = []
    at = 0
    for part in re.split(r'(?<=[.!?])\s+', text.strip()):
        first = last = None
        for token in re.findall(r"[A-Za-z0-9']+", part):
            want = norm(token)
            j = at
            while j < len(words) and norm(words[j][0]) != want:
                j += 1
            if j >= len(words):
                break
            at = j + 1
            if first is None:
                first = words[j][1]
            last = words[j][2]
        if first is None:
            continue
        out.append([part, round(first, 3), round(last, 3)])
    return out


def record(text, mp3):
    """Speak a line, cut it to the pace a reader would use, and time the words."""
    audio, spoken = speak(text)
    if not spoken:
        raise SystemExit('the voice returned no words: ' + text[:40])
    segs = segments(spoken)

    parts = []
    for i, (a, b) in enumerate(segs):
        parts.append('[0:a]atrim=start=%.3f:end=%.3f,asetpts=PTS-STARTPTS[s%d]' % (a, b, i))
    chain = ''.join('[s%d]' % i for i in range(len(parts)))
    filt = ';'.join(parts) + ';' + chain + 'concat=n=%d:v=0:a=1[out]' % len(parts)

    fd, raw = tempfile.mkstemp(suffix='.mp3')
    os.close(fd)
    try:
        with open(raw, 'wb') as f:
            f.write(audio)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw,
                        '-filter_complex', filt, '-map', '[out]',
                        '-q:a', '2', mp3], check=True)
    finally:
        os.remove(raw)
    return remap(spoken, segs)


def main(vo, force):
    lines = read_script(vo)
    ffprobe = shutil.which('ffprobe')
    ffmpeg = shutil.which('ffmpeg')
    if not ffprobe or not ffmpeg:
        raise SystemExit('ffmpeg and ffprobe have to be on PATH. Install ffmpeg and retry.')

    words_file = os.path.join(vo, 'words.json')
    timed = {}
    if os.path.exists(words_file):
        try:
            with open(words_file, encoding='utf-8') as f:
                timed = json.load(f).get('lines', {})
        except (ValueError, OSError):
            timed = {}

    durations = []
    for lid, text in lines:
        mp3 = os.path.join(vo, lid + '.mp3')
        if force or not os.path.exists(mp3) or lid not in timed:
            spoken = record(text, mp3)
            timed[lid] = {
                'words': [[w, round(s, 3), round(e, 3)] for w, s, e in spoken],
                'sentences': sentences(text, spoken),
            }
        out = subprocess.run([ffprobe, '-v', 'error', '-show_entries', 'format=duration',
                              '-of', 'csv=p=0', mp3], capture_output=True, text=True, check=True)
        durations.append(round(float(out.stdout.strip()), 3))

    with open(os.path.join(vo, 'dur.json'), 'w', encoding='utf-8') as f:
        json.dump(durations, f, indent=1)
    with open(words_file, 'w', encoding='utf-8') as f:
        json.dump({'voice': VOICE, 'rate': RATE, 'lines': timed}, f, indent=1)

    for (lid, _), d in zip(lines, durations):
        n = len(timed.get(lid, {}).get('words', []))
        print('%s  %.2fs  %d words' % (lid, d, n))
    print('speech %.2fs' % sum(durations))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--force']
    if len(args) < 1:
        print(__doc__)
        sys.exit(1)
    main(args[0], '--force' in sys.argv[1:])
