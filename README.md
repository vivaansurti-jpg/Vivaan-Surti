# Portfolio

Open `index.html` directly, or serve this folder with a local static server.
The existing `foundation/index.html` entry also displays the same site.

Home and Work are sections of one document. The navbar's Work link lands on
the closed capsule; scroll to open the gallery and browse 12 black placeholders.
Scrolling backward reverses the sequence. Light/dark mode is saved locally.

Files:
- `foundation/style.css` and `foundation/ambient.js`: the original grid, dots,
  flashlight, and theme controls.
- `foundation/work.css` and `foundation/work.js`: navigation, responsive Work
  layout, capsule masks, repeated typography, and project movement.
- `foundation/assets/anton.ttf`: locally hosted Anton display font, under the
  accompanying SIL Open Font License.

Replace the `blank` image in `work.js` with project artwork when ready. The
current project labels are placeholders, with no outbound project links.

The scroll effect is dependency-free and uses the site's neutral palette, its
own scroll interpolation and an open-source display font. Reduced-motion
preferences show a static grid.

Rendering optimizations: card measurements are cached on resize/font load;
offscreen letters are culled; card visibility and counters update only when
changed; the capsule clip updates only during entrance/exit; the flashlight is
a bounded translated layer; particle illumination uses cached anchors; hidden
tabs pause background motion. Work shares Home's original fine grid, dots,
and flashlight. No separate Work background grid is rendered.
