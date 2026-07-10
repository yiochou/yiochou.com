// Sync the newest tracks from the "On Repeat" Spotify playlist into src/data/songs.json.
// Reads the playlist's embed page JSON (no API credentials needed).
// Usage: npm run sync-songs
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PLAYLIST_ID = '36z7OoSOYRX3yinHG6f84f';
const MAX_SONGS = 5;
const OUT = fileURLToPath(new URL('../src/data/songs.json', import.meta.url));

const res = await fetch(`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}`, {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
if (!res.ok) throw new Error(`embed page returned ${res.status}`);

const html = await res.text();
const match = html.match(
  /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
);
if (!match) throw new Error('__NEXT_DATA__ not found; Spotify may have changed the embed page');

const entity = JSON.parse(match[1])?.props?.pageProps?.state?.data?.entity;
const trackList = entity?.trackList;
if (!Array.isArray(trackList) || trackList.length === 0) {
  throw new Error('trackList missing or empty; refusing to overwrite songs.json');
}

// New songs are appended to the playlist, so the newest are at the tail.
const songs = trackList
  .slice(-MAX_SONGS)
  .reverse()
  .map((t) => {
    const id = t.uri?.split(':').pop();
    if (!t.title || !t.subtitle || !id) throw new Error(`malformed track: ${JSON.stringify(t)}`);
    return {
      title: t.title.trim(),
      artist: t.subtitle.trim(),
      url: `https://open.spotify.com/track/${id}`,
    };
  });

await writeFile(OUT, JSON.stringify(songs, null, 2) + '\n');
console.log(`wrote ${songs.length} songs from "${entity.name}" to src/data/songs.json`);
