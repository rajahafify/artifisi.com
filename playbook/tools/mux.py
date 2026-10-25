"""Cut the recorded webm to the shot log and lay each voice line at its shot's start.
Usage: python3 mux.py REC_DIR VO_DIR OUT.mp4 LINES"""
import json, glob, subprocess, sys
rec, vo, out, n = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
log = json.load(open(rec + '/log.json')); vid = glob.glob(rec + '/*.webm')[0]
t0 = log[0]; ins = ['-ss', str(t0), '-t', str(log[-1] - t0), '-i', vid]; fl = []
for i in range(n):
    ins += ['-i', f'{vo}/l{i+1:02d}.mp3']
    ms = int((log[i] - t0) * 1000) + 150
    fl.append(f'[{i+1}:a]adelay={ms}|{ms}[a{i}]')
fl.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad[a]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '0:v', '-map', '[a]', '-shortest',
    '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
