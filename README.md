# Loom X (Pvt) Ltd — PV Plush Pile Fabric Website

Minimalist static website for **Loom X (Pvt) Ltd** showcasing **PV Plush** pile fabric with an Apple Glass frosted interface and interactive swatch carousel.

## Design System
- **Comfortable 3-color palette**:
  - Fixed background: `#0E0E10` (Soft Obsidian)
  - Fixed ink: `#F2EFE9` (Warm Porcelain)
  - Dynamic 3rd accent (`--accent`): shifts softly across 8 muted textile dye tones (`Dusty Rose`, `Warm Oat`, `Sage Leaf`, `Slate Mist`, `Clay Ochre`, `Soft Mauve`, `Sea Glass`, `Mocha Linen`) to match the selected PV Plush swatch.
- **Real Macro Fabric Swatch Carousel**: Uses one macro PV Plush pile texture (`assets/images/pv-plush.jpg`) dyed per preset via `multiply` blend so every card displays the exact same plush pile fibers in different shades, framed with translucent Apple frosted glass overlays.

## Structure
- `index.html` — Single-page layout (floating Apple Glass nav, 3D swatch carousel, sticky dyed PV Plush showcase & preset list, about, buyer picker, inquiry form, swatch inspector modal)
- `css/style.css` — 3-color CSS tokens, frosted glass capsules/panels (`backdrop-filter`), macro fabric dye blending, 3D coverflow transforms
- `js/main.js` — Carousel drag/click/keyboard controller, dynamic preset color switching, inspector modal, and WhatsApp/email inquiry formatting
- `assets/images/pv-plush.jpg` — Neutral macro PV Plush fabric pile base image

## Verified Contact Details
- **Company**: Loom X (Pvt) Ltd
- **Location**: Kadawatha, Sri Lanka
- **Phone / WhatsApp**: +94 77 337 4429
- **Email**: loomxlk@gmail.com
