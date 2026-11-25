# The World in One Day — Wednesday 25 November 2026

An entry for the make.fun bounty **"Sum up 25 November's world news in one
image"** (news-image-20261125).

[![Competition](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125)
[![Rank](https://make.fun/badge/news-image-20261125/Robekk/makefun-news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125)
[![Reward](https://make.fun/badge/news-image-20261125/Robekk/makefun-news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125)

One broadsheet page, one day: 38 stories from Wednesday 25 November 2026.
Shenzhou-24 lifts the first foreign astronaut to Tiangong; Shanghai's
leadership pledges loyalty while its party chief faces a graft probe; a
Brooklyn jury finds Huawei guilty; the Riyadh tower strike draws
condemnation; Nvidia gives back its bounce; Poland summons Russia's envoy;
Sarkozy is ordered to stand trial; Madrid rout PSV 5-1; a 75th Miss
Universe is crowned in San Juan.

Every story carries a certainty tag and a named source. A numbers band,
a UTC timeline, a where-it-happened map and a date-check box (what was
left out, and why) complete the page.

## Layout of this repository

- `entry.png` — the finished front page, 1024 x 1024.
- `main.py` — the entry program. Standard library only, no network:
  it copies `entry.png` into the output directory, byte for byte,
  and verifies the copy before reporting success.
