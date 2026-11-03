"""Assemble the shot clips into the finished video.

Usage: python mux.py <out dir> <vo dir> <out.mp4> <shots.json>

The clips are captured a frame at a time, so each one already holds exactly its shot:
the first frame is the first frame of the shot and the last frame is the last frame of
the shot. Nothing is trimmed off the end of anything here, because there is nothing
left on the end to trim. All that is left is to lay the clips end to end and put the
voice under them.

The voice lines are laid at their shot's start, with the gap after each one.
"""
import json, os, subprocess, sys

W, H = 1080, 1920
FPS = 30


def run(cmd):
    subprocess.run(cmd, check=True)


def read_script(vo):
    ids = []
    with open(os.path.join(vo, 'script.txt'), encoding='utf-8') as f:
        for raw in f:
            raw = raw.strip()
            if raw:
                ids.append(raw.split('|', 1)[0].strip())
    return ids


def main(out_dir, vo, mp4, shots_file):
    with open(shots_file, encoding='utf-8') as f:
        shots = json.load(f)
    with open(os.path.join(vo, 'dur.json'), encoding='utf-8') as f:
        dur = json.load(f)
    ids = read_script(vo)

    gap = shots.get('gap', 0.4)
    end_hold = shots.get('endCard', {}).get('endHold', 1.5)
    items = shots['shots'] + [shots['endCard']]

    if len(dur) != len(items):
        raise SystemExit('dur.json has %d lines, the shot list has %d' % (len(dur), len(items)))

    clips = []
    for i, s in enumerate(items):
        clip = os.path.join(out_dir, 'clips', s['id'] + '.mp4')
        if not os.path.exists(clip):
            raise SystemExit('missing clip: ' + clip)
        length = dur[i] + (end_hold if i == len(items) - 1 else gap)
        clips.append({'id': s['id'], 'clip': clip, 'length': length, 'vo': ids[i]})

    total = sum(c['length'] for c in clips)

    # 1. normalise every clip to the frame size and rate the film uses
    tmp = os.path.join(out_dir, 'tmp')
    os.makedirs(tmp, exist_ok=True)
    norm = []
    for i, c in enumerate(clips):
        out = os.path.join(tmp, '%02d.mp4' % i)
        run(['ffmpeg', '-y', '-loglevel', 'error',
             '-i', c['clip'], '-t', '%.3f' % c['length'],
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
             '-pix_fmt', 'yuv420p', '-r', str(FPS), '-s', '%dx%d' % (W, H),
             '-an', out])
        norm.append(out)

    # 2. concatenate in shot order
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w', encoding='utf-8') as f:
        # concat reads each path against the list's own folder, so give it whole paths.
        for p in norm:
            f.write("file '%s'\n" % os.path.abspath(p).replace("'", "'\\''"))
    silent = os.path.join(tmp, 'silent.mp4')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
         '-c', 'copy', silent])

    # 3. lay each voice line at its shot's start
    ins = ['-i', silent]
    for c in clips:
        ins += ['-i', os.path.join(vo, c['vo'] + '.mp3')]
    filt = []
    t = 0.0
    for i, c in enumerate(clips):
        ms = int(round(t * 1000))
        # One delay for all channels. The voice tracks are mono, and adelay takes one
        # delay per channel, so a "ms|ms" filter would be one value too many.
        filt.append('[%d:a]adelay=%d[a%d]' % (i + 1, ms, i))
        t += c['length']
    mix = ''.join('[a%d]' % i for i in range(len(clips)))
    filt.append(mix + 'amix=inputs=%d:normalize=0:duration=longest,apad,atrim=0:%.3f[a]'
                % (len(clips), total))

    run(['ffmpeg', '-y', '-loglevel', 'error'] + ins +
        ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]',
         '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
         '-movflags', '+faststart', mp4])

    print('%s  %.2fs' % (mp4, total))


if __name__ == '__main__':
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
