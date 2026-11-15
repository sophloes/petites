# Petite Fit App

A web app that memorizes the measurements of clothes that fit me well as a petite woman. When I find an item online, I can tell whether its measurements will work and whether the fabric is worth the price.

## Current decisions
- Web app first, mobile-friendly (used on a phone browser). No App Store work yet.
- Start simple: plain HTML/CSS/JS or React. Browser localStorage first; Supabase later if I want sync.
- Build in layers. Version one is closet + manual comparison, usable on day one.
- Link import and AI parsing come after version one.

## Features (full vision)
1. **Fit Closet:** save garments that fit perfectly, tagged by category, with key measurements.
2. **Link Import:** paste a product link; fetch the page, then use an AI model to extract the size chart per size, fabric composition and price into structured data. Flag low-confidence results (some retailers list only size labels) instead of guessing.
3. **Smart Comparison:** find the closest size and explain differences in plain language ("inseam is an inch too long, shoulders are spot on"). Weight measurements by importance for a petite frame: shoulders heavily, hems and sleeves lightly.
4. **Tailoring Flags:** label each difference fixable (hem, sleeve length, waist taken in) or dealbreaker (shoulders, bust, torso length).
5. **Fabric and Material Analysis:**
   - Fit adjustment: cotton/linen can shrink (flag sizing up in length or washing cold); stretch fibers tolerate a slightly tighter measurement; drape differs by fabric (heavy polyester crepe vs crisp cotton poplin).
   - Value score: quality vs price. Natural fibers (wool, silk, linen) score higher than cheap blends. Red flags: high price on mostly polyester, high acrylic in sweaters (pills). Use fabric weight (g/m²) when listed. Present as a guide, not a verdict, since composition does not reveal construction quality.
6. **Wear and Durability Log:** per owned piece, log washing results, pilling, stretching, wears before wear shows. Learn personal patterns (e.g. viscose blends shrink in length) and adjust scores.
7. **Wishlist:** save items with match score and value score.
8. **Return History:** log why something that looked right on paper did not work; use it to refine matches.

## Build order
1. Closet with manual comparison
2. Link import
3. Tailoring flags and fabric notes
4. Wishlist, wear log and return history

## Version one spec

### Measurement fields by category
| Category | Measurements |
| --- | --- |
| Tops and sweaters | Shoulder width, bust (armpit to armpit, flat), sleeve length, body length |
| Blazers and jackets | Shoulder width, bust, sleeve length, body length, waist |
| Dresses | Shoulder width, bust, waist, hip, length from shoulder |
| Pants and jeans | Waist, hip, front rise, inseam, leg opening |
| Skirts | Waist, hip, length |

Every garment also stores: brand, size, fabric composition, price.

Flat measurements are doubled for bust/waist/hip when comparing. Decide once whether to store flat or doubled and keep it consistent (suggest: store flat, as measured, and double at compare time).

### Screens
1. **Closet:** add, edit, delete garments; category picker; fields change per category.
2. **Compare:** type in a product page's size chart (one row per size); show each size's difference from the closest saved piece in the same category, per measurement.
3. **Weighting:** each measurement is marked fixable or dealbreaker; color differences accordingly.
4. **Fabric notes:** composition field with simple warnings (e.g. shrinkage for 100% cotton or linen).

### Done when
Tried on three items I am actually considering, and the app's verdict matches what I would have decided by eye. If not, adjust weights before adding anything else.

## Open questions
- Which retailers do I shop most? (test link import on those first)
- Store measurements in inches or cm? (assume inches)

## First task for Claude Code
Scaffold the version one web app (closet screen + compare screen) with localStorage persistence, mobile-first layout, and the category/measurement field definitions above kept in a single config file so they are easy to change. Ask me before adding dependencies beyond a bundler and React.
