```markdown
# Design System Strategy: The Sovereign Architect

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sovereign Architect."** 

Government investment portals often suffer from bureaucratic density and rigid, "boxy" layouts. This system rejects that template-driven approach in favor of an editorial, high-end enterprise aesthetic. We are moving away from "Government as a Utility" and toward "Government as a Premier Financial Institution." 

The visual language balances the authority of the state with the precision of modern fintech. By utilizing intentional asymmetry, expansive negative space (breathing room), and a "layered glass" depth model, we create an experience that feels transparent yet impenetrable—much like a secure vault. We prioritize a high-contrast typography scale (Manrope for headers, Inter for data) to ensure every piece of information feels curated and intentional.

## 2. Color & Materiality
The palette is anchored in deep authority and accented with prestige. We follow a strict hierarchy of "Tonal Depth" over structural lines.

### The Palette
- **Primary / Primary Container (#000a1e / #002147):** The "Deep Navy." Used for the most stable structural elements and high-contrast text.
- **Tertiary / Tertiary Container (#110a00 / #2e1f00):** The "Gold Accents." Use sparingly for high-value CTAs, status indicators for "Growth," or subtle decorative underlines.
- **Surface Tiers:** Our canvas. We move from `surface_container_lowest` (#ffffff) for active content cards to `surface` (#f8f9fa) for the main page background.

### The Rules of Engagement
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning or card definition. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` sidebar sitting against a `surface` main content area provides enough contrast to be functional without the "visual noise" of a stroke.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. An investment dashboard should sit on `surface_dim`, while individual data modules sit on `surface_container_highest`, and the final "Active Selection" card pops on `surface_container_lowest`. This creates "natural" focus.
*   **The "Glass & Gradient" Rule:** To achieve a "Behance-tier" finish, use Glassmorphism for floating navigation bars or modal overlays. Use `surface_container_lowest` at 70% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** For Hero sections or primary CTAs, apply a subtle linear gradient transitioning from `primary` (#000a1e) to `primary_container` (#002147) at a 135-degree angle. This adds "soul" and depth that a flat color lacks.

## 3. Typography: The Editorial Voice
We use a dual-font system to separate "Vision" from "Data."

*   **Display & Headlines (Manrope):** These are your "Statement" styles. Use `display-lg` (3.5rem) with tightened letter-spacing (-0.02em) for hero headlines. The goal is an authoritative, editorial feel.
*   **Titles & Body (Inter):** The "Workhorse." Use `title-md` for card headers and `body-md` for general content. Inter’s tall x-height ensures legibility in complex investment tables.
*   **Labels (Inter):** Use `label-md` (0.75rem) in all-caps with +0.05em tracking for metadata or small subtitles to create a "technical" aesthetic.

## 4. Elevation & Depth
Depth is the differentiator. This system uses **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Stacking `surface_container` tiers creates soft, natural lift. A card should be a lighter color than the section it sits on, not a darker shadow.
*   **Ambient Shadows:** If an element must "float" (like a dropdown or a floating action button), use an extra-diffused shadow: `Y: 20px, Blur: 40px, Color: primary (4% opacity)`. It should feel like a soft glow of light, not a "drop" shadow.
*   **The "Ghost Border" Fallback:** For accessibility in forms, use the `outline_variant` token at **15% opacity**. It provides a "hint" of a boundary without breaking the seamless aesthetic.
*   **Glassmorphism Depth:** When a modal is active, the background must blur. This forces the user’s eye to the foreground and makes the UI feel like a high-end physical object.

## 5. Components & Interaction

### Buttons
*   **Primary:** A gradient blend of `primary` to `primary_container`. No border. `rounded-md` (0.375rem). Text is `on_primary`.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. This blends into the UI until hovered.
*   **Tertiary (Gold):** Use `tertiary_fixed_dim` for a "Premium" action (e.g., "Upgrade" or "Export Report").

### Cards & Lists
*   **Forbid Divider Lines:** Separate list items with `2.5` (0.85rem) of vertical white space or a subtle shift to `surface_container_low` on hover.
*   **The Portfolio Card:** Use a `surface_container_lowest` background, `xl` (0.75rem) rounded corners, and no border. Content should have at least `6` (2rem) of internal padding to feel premium.

### Form Inputs
*   **State:** Default state uses `surface_container_high` with no border. On focus, the background shifts to `surface_container_lowest` and a `primary` 1px "Ghost Border" appears at 20% opacity.
*   **Hierarchy:** Use `label-sm` positioned precisely `1.5` (0.5rem) above the input field.

### Specialized Portal Components
*   **Trend Sparklines:** Use `secondary` (#3a5f94) for neutral trends and `tertiary_container` for high-performance gold indicators.
*   **Glass Nav:** A top-pinned navigation bar using 80% `primary_container` with a heavy backdrop-blur to keep the user anchored.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. A 2/3 and 1/3 split for a dashboard is more interesting than a 50/50 split.
*   **Do** use large image backgrounds in hero sections with a `primary` color overlay at 60% to ensure text readability.
*   **Do** embrace white space. If you think there's enough space, add `1.5` (0.5rem) more.

### Don't
*   **Don't** use pure black (#000000). Use `primary` (#000a1e) for your darkest tones to maintain the "Navy" brand soul.
*   **Don't** use 100% opaque borders. They create "visual cages" that make the portal feel dated and cluttered.
*   **Don't** use standard "Success Green." Use the gold accents (`tertiary`) to signal high-value success or "Investment Growth."

### Accessibility Note
While we use "Ghost Borders" and tonal shifts, ensure the contrast ratio between `on_surface` text and the `surface` background always meets WCAG AA standards. Visual sophistication must never come at the cost of clarity.```