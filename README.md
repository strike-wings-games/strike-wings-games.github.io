# Strike Wings — official site

Single-page marketing site for **Strike Wings**, hosted on GitHub Pages.

Sol, 2205. Earth has a church. Mars has a shipyard. Between them, the war.

## Stack

Hand-rolled HTML/CSS/JS with no build step and no dependencies. Generative canvas starfield
(parallax stars, nebulae, shooting stars, ember sparks), scroll-driven cinematic art
panels, and an interactive ship registry using wireframe renders extracted from the
actual game engine.

## Deploy

GitHub Pages, from the repository root:

1. Repo **Settings → Pages**
2. Source: *Deploy from a branch*, branch `main`, folder `/ (root)`

## Updating the Steam link

The wishlist buttons read a single constant at the top of `js/main.js`:

```js
var STEAM_URL = "...";
```

Swap in the real store URL (`https://store.steampowered.com/app/<appid>/Strike_Wings/`)
once the Coming Soon page is live.

## Assets

- `assets/art/` — cinematic key art and faction crests (from the game project)
- `assets/ships/` — transparent wireframe ship schematics, extracted from the game's
  target-lock HUD via the headless screenshot harness
- `assets/game/` — real in-engine gameplay captures (1920×1080)

Strike Wings is an original game — a retro homage inspired by classics like
*Solar Winds* and *Hell Fighter 32*.
