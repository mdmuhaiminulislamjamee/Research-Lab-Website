# Open Frontier Lab visual system

The website has one light appearance: a white page canvas and header, deep navy body text, and the approved colored sections. Existing structure, typography, and functionality are preserved.

## Shared template

The --hero-pattern variable supplies diagonal midnight navy #101233, purple #29144E, and deep blue-purple #19143F fields. It styles homepage and inner-page heroes, featured events, collaboration panels, join strips, event banners, contact panels, and the footer.

Colored panels retain white headings, pale body text, cyan details, and navy/purple cards. Standalone forms, filters, dialogs, and secondary controls use white surfaces with deep navy text. Primary buttons use coral #FF7958 to amber #FFB443. Shadows are subtle and button glows remain disabled. No photo background, glass, or blur effects are used.

## Appearance behavior

There is no theme toggle, alternate page theme, or system-appearance selection. The document initializes to light before rendering. An obsolete ofl-theme local-storage preference is removed without changing registration or newsletter records. Colored panel controls retain suitable native control styling inside their dark-colored surfaces.

## Responsive layout

Page containers, navigation, homepage hero, collaboration panels, and footer content are fluid without fixed desktop pixel caps. Shared outer gutters use clamp(12px, 1.5vw, 28px), keeping the white surround narrow on large displays. Hero padding and heading size, section spacing, and grid gaps scale automatically. Text retains an independent readable width.

Project, publication, course, and general card grids use auto-fit columns with minimum widths bounded by their container. Detail pages use a fluid sidebar which stacks below 820px. Grid children may shrink, and long main-content text wraps safely. Sections remain content-driven in height. Existing mobile navigation, focus, reduced-motion behavior, light appearance, and colors are preserved.

## Coverage and verification

All 32 generated pages and the fallback error page load the shared appearance stylesheet. Checks cover 34 light-only route states, shared headers and footers, absent theme controls, old preference cleanup, storage failure, navigation, search, filters, project tabs, and registration. Rendered browser review remains unavailable.
