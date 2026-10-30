# Motion notes

Values used across the site. All motion is disabled under reduced-motion
preferences, and hidden tabs pause background work.

## Easing

- expo: cubic-bezier(.19,1,.22,1)
- quart: cubic-bezier(.25,1,.5,1)
- smooth: cubic-bezier(.25,.1,.25,1)
- snappy: cubic-bezier(.4,0,.2,1)

## Entrances

| Element | Motion |
| --- | --- |
| Intro block | Opacity 0→1, y 30→0, scale .95→1; 1s, expo |
| Intro contents | Ripple in ~70ms apart, y 20→0, scale .95→1; .6s, expo |
| Section reveals | One-time on scroll: y 20→0 (scale .95→1 for non-headings); .5–.6s, quart; 50px inset |
| Grid | Opacity 0→.2 over 2s |

## Hover

- Links: lift 2px, scale 1.05; press .95 (spring: stiffness 400, damping 17)
- Theme toggle: scale 1.05; press .95
- Work cards: lift 4px, scale 1.02; press .98; image zooms to 1.05 over .3s
- Writing rows: lift 2px, scale 1.01
- Timeline rows: shift 8px right, scale 1.02; bullets wiggle 0→10→−10→0° over 2s,
  then rest 4s + .5s per row

Keyboard focus gets the same lift as pointer hover; touch gets no sticky hover.

## Background

- Grid: 40px pattern, opacity .2
- Dots: 50 (28 on small screens), 2–5px; 8s loop rising 100px and returning,
  fading 0→1→0 and scaling .5→1→.5, starts staggered by .1s; grey in both themes;
  lit by the cursor
- Flashlight: 600px radial gradient, rgba(71,168,255,.15), layer opacity .5,
  above content
- Light mode: an 8% overlay softens the white background

## Theme switch

A single circular reveal grows from the toggle over 700ms
(cubic-bezier(.65,0,.35,1)) using the View Transitions API.
