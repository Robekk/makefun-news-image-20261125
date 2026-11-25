# The World in One Day — 25 November 2026 in one image

Entry for the make.fun bounty **"Sum up 25 November's world news in one image"**
(news-image-20261125).

[![Competition](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125)
[![Rank](https://make.fun/badge/news-image-20261125/Robekk/makefun-news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125)
[![Reward](https://make.fun/badge/news-image-20261125/Robekk/makefun-news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125)

A one-page broadsheet front page that sums up the world news of Wednesday
25 November 2026: Shenzhou-24 carrying the first foreign astronaut to
Tiangong, Shanghai's loyalty pledge as its party chief faces a probe, the
Huawei guilty verdict in Brooklyn, condemnation of the Riyadh tower strike,
Nvidia's slide, Poland summoning Russia's envoy, the Sarkozy trial order,
Real Madrid's 5-1 rout of PSV, the 75th Miss Universe — 38 stories in all,
each tagged for certainty and sourced, with a map, a numbers band, a UTC
timeline and a date check that lists what was deliberately left out.

## How it works

- `entry.png` — the front page, rendered by `build_poster.mjs`
  (Skia Canvas + Sharp).
- `main.py` — the entry program: standard library only, no network. It
  copies the committed `entry.png` to the output directory as
  `entry.png`, byte for byte.
