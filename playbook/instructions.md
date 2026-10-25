# Playbook: report to interactive page + short video

How the KRI State of Households sample was made on 25 Oct 2026, written so another agent can repeat it on a new report. It took about 20 minutes of agent time end to end. Point the other agent at this file as its brief, then add the report you want ("Do this for <report URL>").

Reference build to copy from:
- Page: `rajahafify/artifisi.com`, folder `public/samples/households/` (`index.html` + `scene.js`). The engine came from `tech-sovereignty/scene.js` in the same repo.
- Video: `website/samples/kri-households/kri-households-sample.mp4` in the Claude project files (not in this repo)
- Scripts: `playbook/tools/` in this repo (`screenshots.js`, `record-video.js`, `mux.py`)

## What you get

1. One static web page. Every number sits in plain HTML text (good for search). Behind it, a three.js field of 1,400 small cubes re-forms into a chart for each section as the reader scrolls. Clicking a chart switches its view. On phones each section shows as a text page followed by a full-screen chart page.
2. A vertical 1080x1920 video of 40 to 55 seconds. It's a screen recording of the chart pages with captions and a TTS voice-over, and it ends on a card with the page URL.

## Step 1. Pick the report and pull the numbers (10 min)

- Pick a report published in the last few weeks with an open licence (CC BY is ideal). Check the licence on the report page.
- Fetch the publication page and the PDF. Pull 7 to 10 headline numbers that each make one chart: a single big number, a before/after pair, a share of a whole, a top-4 list, or a count out of a total.
- For each number, write down the exact figure, its year and its page. Never round differently from the report. If the agent only got a number through a summary, flag it to be checked against the PDF.
- Note the lead author's name from the report page, because that's who the outreach goes to.

## Step 2. Build the page (40 min)

1. Copy `public/samples/households/` to `public/samples/<slug>/`.
2. In `index.html`, keep the `<style>` block and replace the sections. Each `<section data-scene="name">` has:
   - kicker, h2 headline (one plain claim), and the numbers as `.stats` or `.bars .row` items
   - a `.views` block: one `<button data-view="N">` per view and one `<p class="cap" data-view="N">` caption each. With one view, leave out the buttons and keep the caption.
   - the last section is `class="notes" data-scene="field"`, the fine print with source, licence, who made it and limits
3. In `scene.js`, replace the `views` object. Each key matches a `data-scene` and holds one view per button. Helpers you can reuse:
   - `columns(items, {max, ghost, label})` for bar charts. Items are `[label, value, colour]`. `ghost` fills each column up to `max` in dim cubes, for "out of 10" or "out of 100%".
   - `ball()` for balls (waffle grids, dot grids), `coin()` for discs (area to scale), and `bar()` for one column. See the `ring` code in the `plate` view for a donut arc.
   - Labels are `{ p: [x, y, z], t: "text\nsecond line", c: "ready|gap|red|muted|ink" }`. Keep shapes within about x -3 to 3 and y -3 to 3.
4. The number in the HTML and the shape in `scene.js` must match. Change both together.
5. Mark it honestly. Put "Unofficial sample, not made by or for <org>" in the top bar and the fine print, add `<meta name="robots" content="noindex">`, and link the original report.
6. Writing rules: no em dashes, none of the AI word list in `docs/writing.html`, short plain sentences.

## Step 3. Check it with screenshots (5 min)

- `npm pack three@0.180.0` and untar it, because the cloud can't reach jsDelivr. The scripts swap the CDN request for the local file.
- `THREE=<path>/package/build node screenshots.js <page folder> <out prefix> desktop`, then again with `phone`. This gives one PNG per section and view. Look at every one for labels that overlap, labels cut off at the edges, and charts that misread.

## Step 4. Voice-over (10 min)

- Write 7 to 9 lines, one per shot. Use plain normal sentences and write numbers as words ("seven thousand and seventeen ringgit"). Don't say "Artifisi", because the voice mispronounces it. End with "Visit our website to learn more."
- Aim for about 110 words, which comes out near 45 seconds.
- Record on fify's PC (DESKTOP-30IVP4M), since the cloud can't reach the TTS service. Run one file per line:
  `edge-tts --voice en-SG-LunaNeural --rate=-3% --text "<line>" --write-media D:\artifisi\video-edit\<slug>-vo\l01.mp3`
- Copy the mp3s back into the cloud, then get each length with `ffprobe`.

## Step 5. Record and cut the video (10 min)

- Edit `SHOTS` in `record-video.js` with one entry per voice line: `[section index, view, 'viz' | 'text']`, plus `[null]` last for the end card. Change the end card text and URL in the script. The script holds each shot for its line's length plus 0.35 s, burns in captions, hides the click hints, and logs when each shot starts.
- Put `script.txt` (lines as `l01|text`) and `dur.json` (line lengths) in the VO folder, then run:
  `THREE=<path> node record-video.js <page folder> <rec dir> <vo dir>`
- Then run `python3 mux.py <rec dir> <vo dir> out.mp4 <number of lines>`. It trims the recording and places each voice line at its shot's start.
- Pull 8 to 10 frames with ffmpeg and check them. Then listen to the whole video once, because nobody had heard the TTS before this step.

## Step 6. Ship and send (10 min)

- Open a PR on `rajahafify/artifisi.com`. Cloudflare Pages posts a preview link on the PR, at `https://<branch>.artifisi-com.pages.dev/samples/<slug>`. After merge the page lives at `artifisi.com/samples/<slug>`.
- Copy `outreach.md` from the KRI folder and change the names. Send to the lead author first: say it's unofficial, offer to fix or remove it the same day, then make the offer (five working days, RM4,500, or RM2,900 for the first two clients in return for a case study).
- Log what you sent in `company-updates/docs/brainstorm.html` (or management.html once a client says yes).

## Known traps

- The cloud container and the device VM can't reach `.gov.my`, krinstitute.org, jsDelivr, unpkg or the edge-tts service. WebFetch can still read most report pages and PDFs.
- WebFetch summarises, and long PDFs get cut off. Check every number you didn't read in the PDF yourself.
- A Remote Control session on fify's PC turns off folder access until it's stopped. Stop it once the mp3s are written, then copy them over.
- Rendering uses software WebGL (`--use-gl=swiftshader`), which is slow but fine. Allow about 1 minute per screenshot run and real time for the recording.
