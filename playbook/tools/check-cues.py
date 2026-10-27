"""Check that every cue in the film lands on a word the voice actually says.

Usage: python check-cues.py <vo dir> <shots.json> <scene.js> [--max-seconds 60]

A cue is a phrase the voice says. The page resolves a cue against the voice's own
word timings, and the film puts the thing the cue names at that moment: a card
part appears, a caption changes, a chart draws itself.

A cue that does not resolve is not a warning. A card part that misses never
appears at all, and a caption that misses is dropped from the band. The film
still builds, and the missing part is simply not in it. That is how a film ends
up with a number on the screen that the voice never explains.

So this is a gate and not a report. It fails when a cue misses, when the parts
of a card fall out of the order the voice says them, and when the film runs past
the length the rate card allows.

The page's own rule is copied here, not reinvented: a phrase matches when the
letters that carry sound are the same, run together, in the same order.
"""
import json
import os
import re
import sys

# The page's matcher. Lowercase, and drop everything that is not a letter, a
# digit or an apostrophe, so "RON 95" and "ron95" are the same phrase.
def key(s):
    return re.sub(r"[^a-z0-9']+", "", s.lower())


def find(words, phrase):
    """Find a phrase in the words the voice said. Returns (index, count) or None."""
    want = key(phrase)
    if not want:
        return None
    for i in range(len(words)):
        got = ""
        n = 0
        for j in range(i, len(words)):
            got += key(words[j][0])
            n += 1
            if len(got) >= len(want):
                break
        if got == want:
            return (i, n)
    return None


def read_script(vo):
    lines = []
    with open(os.path.join(vo, 'script.txt'), encoding='utf-8') as f:
        for raw in f:
            raw = raw.strip()
            if raw:
                lid, _, text = raw.partition('|')
                lines.append((lid.strip(), text.strip()))
    return lines


def scene_cues(scene_js, scene_id):
    """The cue phrases one scene names, with the line of code they sit on.

    The scene functions are named after the scenes, so a scene called "path" is
    built by "scenePath". The cues inside one function belong to one voice line.
    """
    if not scene_id:
        return []
    name = 'scene' + scene_id[0].upper() + scene_id[1:]
    src = open(scene_js, encoding='utf-8').read()
    m = re.search(r'\nfunction %s\s*\(' % re.escape(name), src)
    if not m:
        return []
    # The function runs to the next top level function.
    nxt = re.search(r'\nfunction \w+\s*\(', src[m.end():])
    body = src[m.end():m.end() + (nxt.start() if nxt else len(src))]
    out = []
    for line in body.splitlines():
        for hit in re.finditer(r'T\.(?:at|end|seconds)\(\s*"([^"]+)"', line):
            out.append((hit.group(1), line.strip()))
    return out


def main(vo, shots_file, scene_js, max_seconds):
    with open(shots_file, encoding='utf-8') as f:
        shots = json.load(f)
    with open(os.path.join(vo, 'words.json'), encoding='utf-8') as f:
        words = json.load(f)['lines']
    with open(os.path.join(vo, 'dur.json'), encoding='utf-8') as f:
        dur = json.load(f)

    lines = read_script(vo)
    vo_of = {lid: text for lid, text in lines}
    problems = []
    checked = 0

    for shot in shots['shots']:
        lid = shot.get('vo')
        spoken = words.get(lid, {}).get('words', [])
        if not spoken:
            problems.append('%s: no words recorded for %s' % (shot['id'], lid))
            continue
        times = [w[1] for w in spoken]

        # The captions. A caption that misses is dropped from the band.
        last = 0.0
        for cap in shot.get('captions') or []:
            checked += 1
            hit = find(spoken, cap['cue'])
            if hit is None:
                problems.append('%s: caption cue %r does not appear in the voice'
                                % (shot['id'], cap['cue']))
                continue
            at = times[hit[0]]
            if at < last:
                problems.append('%s: caption %r lands before the caption before it '
                                '(%.2fs after %.2fs)' % (shot['id'], cap['cue'], at, last))
            last = max(at, last)

        # The card. The parts arrive in the order the cues are written, so the
        # cues have to be in the order the voice says them. Two parts may share
        # one cue: the page staggers the second a tenth of a second after the
        # first, which is how a claim and its figure land together.
        cues = (shot.get('card') or {}).get('cues') or {}
        last = 0.0
        last_cue = -1.0
        for part, cue in cues.items():
            checked += 1
            hit = find(spoken, cue)
            if hit is None:
                problems.append('%s: card cue %r (%s) does not appear in the voice'
                                % (shot['id'], cue, part))
                continue
            at = times[hit[0]]
            if at < last_cue - 0.01:
                problems.append('%s: card part %s lands before the part before it '
                                '(%.2fs after %.2fs)' % (shot['id'], part, at, last_cue))
            last_cue = at
            last = max(at + 0.1, last)

        # The scene. A scene cue that misses falls back to a fixed fraction, so
        # the chart draws itself at the wrong moment rather than not at all.
        for cue, code in scene_cues(scene_js, shot.get('scene')):
            checked += 1
            if find(spoken, cue) is None:
                problems.append('%s: scene cue %r does not appear in the voice  [%s]'
                                % (shot['id'], cue, code))

    # The length of the finished film.
    gap = shots.get('gap', 0.4)
    end_hold = shots.get('endCard', {}).get('endHold', 1.5)
    total = sum(dur) + gap * (len(shots['shots'])) + end_hold
    print('cues checked : %d' % checked)
    print('speech       : %.2fs' % sum(dur))
    print('film         : %.2fs  (%d lines, gap %.2fs, end hold %.2fs)'
          % (total, len(dur), gap, end_hold))
    if total > max_seconds:
        problems.append('the film runs %.2fs, over the %.2fs the rate card allows'
                        % (total, max_seconds))

    for lid, text in lines:
        print('  %s  %s' % (lid, text))

    if problems:
        print('\nFAILED')
        for p in problems:
            print('  - ' + p)
        sys.exit(1)
    print('\nOK  every cue lands on a word the voice says')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:]]
    max_seconds = 60.0
    if '--max-seconds' in args:
        i = args.index('--max-seconds')
        max_seconds = float(args[i + 1])
        del args[i:i + 2]
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    main(args[0], args[1], args[2], max_seconds)
