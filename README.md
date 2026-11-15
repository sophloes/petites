# Petite Fit

Version one: a fit closet plus manual size-chart comparison. Runs in the browser, data in localStorage.

```bash
npm install
npm run dev
```

To try it on your phone, run `npm run dev -- --host` and open the printed network URL on the same Wi-Fi.

## Where things live
- `src/config.js` — categories, measurement fields, weights, tolerances, fixable vs dealbreaker, fabric rules. Tune the app here.
- `src/lib/compare.js` — matching and plain-language differences.
- `src/lib/fabric.js` — composition parsing and fabric warnings.
- `src/screens/` — Closet and Compare screens.

Measurements are stored flat (as measured) in inches; bust/waist/hip are doubled when the size chart lists full circumference.
