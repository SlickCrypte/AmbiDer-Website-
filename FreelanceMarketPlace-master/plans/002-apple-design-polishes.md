# 002 — Apple Design Polishes: Optical Typography, Translucent Materials, & Instant Response

- **Status**: DONE
- **Commit**: 3f8f3be
- **Severity**: LOW
- **Category**: Cohesion & tokens / Materials & depth / Response
- **Estimated scope**: 7 files (`index.css`, `HomePage.module.css`, `JobsPage.module.css`, `PostJobPage.module.css`, `PostProductPage.module.css`, `DashboardPage.module.css`, `ClientDashboardPage.module.css`)

## Problem

The FreelanceHub web application has opaque navbars and lacks tactile press feedback on interactive buttons. Furthermore, the typography lacks size-specific adjustments (like negative letter-spacing for large text), causing layout headings to feel generic.

## Target

1. **Optical Typography**: Headings (`h1`, `h2`, `h3`) should have subtle negative tracking (`letter-spacing: -0.02em`) to feel tighter and more premium.
2. **Tactile Response**: Buttons should respond on press (`:active` state) with a micro-scale transition (`scale(0.97)`) in `100ms ease-out`.
3. **Translucent Materials**: Headers should use a translucent blur background (`backdrop-filter: blur(20px) saturate(180%)`) with a light reflective border edge at the bottom instead of flat opaque navy backgrounds.

Target Global CSS in `index.css`:
```css
h1, h2, h3 {
  letter-spacing: -0.02em;
  font-optical-sizing: auto;
}

button:active, 
input[type="button"]:active, 
input[type="submit"]:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}
```

Target Header CSS in module files:
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(27, 42, 65, 0.75) !important; /* Translucent Navy Dark */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  /* other existing styles */
}
```

## Repo conventions to follow

- Transitions and typography are defined globally in `src/index.css` or scoped inside CSS modules.
- We will update the global button reset and heading reset in `src/index.css`, and local headers inside their respective CSS modules.

## Steps

1. Open [index.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/index.css).
2. Add global rules to the bottom of the file:
   ```css
   h1, h2, h3, h4, h5, h6 {
     letter-spacing: -0.02em;
     font-optical-sizing: auto;
   }
   
   button:active, 
   .navLink:active,
   .btnPrimary:active,
   .btnSecondary:active {
     transform: scale(0.97);
     transition: transform 100ms ease-out;
   }
   ```
3. Open the following CSS module files:
   - [HomePage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/HomePage.module.css)
   - [JobsPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/JobsPage.module.css)
   - [PostJobPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/PostJobPage.module.css)
   - [PostProductPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/PostProductPage.module.css)
   - [DashboardPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/DashboardPage.module.css)
   - [ClientDashboardPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/ClientDashboardPage.module.css)
4. For each file, find `.navbar` class and modify it:
   - Change `background-color` to `rgba(27, 42, 65, 0.75)` (or `var(--color-navy-dark)` equivalent in opacity).
   - Add `backdrop-filter: blur(20px) saturate(180%);` and `-webkit-backdrop-filter: blur(20px) saturate(180%);`.
   - Add `border-bottom: 1px solid rgba(255, 255, 255, 0.08);`.

## Boundaries

- Do NOT change structural layout alignments or paddings of the header components.
- Do NOT add JavaScript event listeners for active states; leverage native CSS `:active`.

## Verification

- **Mechanical**: Ensure the frontend builds cleanly with `npm run build` or runs without errors on `npm run dev`.
- **Feel check**:
  - Open the homepage and scroll down. Verify that list items and banner contents blur beautifully as they scroll behind the navbar.
  - Press down on any navigation link or action button. Verify it instantly scales down to `0.97` on pointer-down and returns on pointer-up.
  - Inspect headings (e.g. "Find Talent", "Quick Stats"). Verify their letter-spacing is tighter (`-0.02em`).
