# 001 — Transition Application Modal on JobsPage

- **Status**: DONE
- **Commit**: 3f8f3be
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Preventing jarring changes
- **Estimated scope**: 2 files (`JobsPage.jsx`, `JobsPage.module.css`)

## Problem

The proposal application modal overlay and card snap instantly onto the screen when the user clicks "Apply" on [JobsPage.jsx:398](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/JobsPage.jsx#L398). This sudden transition is jarring and disorienting.

Verbatim code in [JobsPage.jsx:398-401](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/JobsPage.jsx#L398-L401):
```javascript
      {/* Application Message Overlay Modal */}
      {isModalOpen && selectedJob && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
```

CSS definitions in [JobsPage.module.css:440-461](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/JobsPage.module.css#L440-L461):
```css
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(17, 34, 51, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modalCard {
  background-color: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
```

## Target

The modal should animate on entry:
1. **Overlay**: Fade the background alpha and scale the backdrop blur from `blur(0)` to `blur(4px)`.
2. **Card**: Slide up and scale from `scale(0.95); translateY(15px)` to settled values with a crisp, physical spring overshoot: `cubic-bezier(0.34, 1.56, 0.64, 1)`.

Target CSS:
```css
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(17, 34, 51, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  transition: opacity var(--transition-fast) ease-out, backdrop-filter var(--transition-fast) ease-out;
  opacity: 1;
}

@starting-style {
  .modalOverlay {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

.modalCard {
  background-color: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out;
  transform: scale(1) translateY(0);
  opacity: 1;
}

@starting-style {
  .modalCard {
    transform: scale(0.95) translateY(15px);
    opacity: 0;
  }
}
```

## Repo conventions to follow

- Easing and transitions are specified inside individual components. Shared tokens like `var(--transition-fast)` live in `src/index.css`.
- Modals are conditionally rendered in React via standard `{isOpen && <Modal />}`.
- Native CSS `@starting-style` is used for entry transitions on conditionally rendered DOM elements.

## Steps

1. Open [JobsPage.module.css](file:///e:/FreelanceHub/FreelanceMarketPlace/frontend/src/features/services/JobsPage.module.css).
2. Locate the `.modalOverlay` class (lines 440-452) and append the transition properties and the `@starting-style` rule:
   ```css
   transition: opacity var(--transition-fast) ease-out, backdrop-filter var(--transition-fast) ease-out;
   opacity: 1;
   ```
   and append the `@starting-style` block:
   ```css
   @starting-style {
     .modalOverlay {
       opacity: 0;
       backdrop-filter: blur(0px);
     }
   }
   ```
3. Locate the `.modalCard` class (lines 454-461) and append the transition, transform, and opacity properties, followed by the `@starting-style` block:
   ```css
   transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out;
   transform: scale(1) translateY(0);
   opacity: 1;
   ```
   and:
   ```css
   @starting-style {
     .modalCard {
       transform: scale(0.95) translateY(15px);
       opacity: 0;
     }
   }
   ```

## Boundaries

- Do NOT add external animation libraries.
- Do NOT touch other components.
- Do NOT alter the HTML markup inside `JobsPage.jsx`.

## Verification

- **Mechanical**: Ensure the frontend builds cleanly with `npm run build` or runs without errors on `npm run dev`.
- **Feel check**:
  - Open a job application modal by clicking the "Apply" button on the Jobs board page.
  - Verify that the background dark overlay and backdrop blur fade in smoothly.
  - Verify that the card slides up and bounces slightly with a quick spring feel.
  - Set the Chrome developer tools Animations panel speed to 10% and inspect the scale and translation curve of the card on entry.
