/**
 * src/utils/layoutDirection.js
 *
 * ✅ Enforces LTR layout globally
 * Prevents any RTL direction from being applied accidentally
 * Use this in App.jsx + AdminLayout.jsx
 */

let monitoringInitialized = false;

/* ----------------------------------------
   ✅ Enforce LTR Layout Globally
----------------------------------------- */
export const enforceLTRLayout = () => {
  // Force HTML to LTR
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.style.direction = "ltr";

  // Force Body to LTR
  document.body.setAttribute("dir", "ltr");
  document.body.style.direction = "ltr";

  // Remove RTL-related classes
  const rtlClasses = ["rtl", "admin-layout-rtl", "layout-rtl", "text-right"];

  rtlClasses.forEach((cls) => {
    document.documentElement.classList.remove(cls);
    document.body.classList.remove(cls);
  });

  // Ensure text alignment stays consistent
  document.documentElement.style.textAlign = "left";
  document.body.style.textAlign = "left";

  console.log("✅ LTR layout enforced globally");
};

/* ----------------------------------------
   ✅ Monitor & Block RTL Direction Changes
----------------------------------------- */
export const initLayoutDirectionMonitoring = () => {
  if (monitoringInitialized) return;
  monitoringInitialized = true;

  // Run immediately on load
  enforceLTRLayout();

  // Run again after small delay (React render safety)
  setTimeout(enforceLTRLayout, 200);

  /* ----------------------------------------
     ✅ Block RTL if any script tries to apply it
  ----------------------------------------- */
  const observer = new MutationObserver(() => {
    const dir = document.documentElement.getAttribute("dir");

    if (dir === "rtl") {
      console.warn("⚠️ RTL detected → forcing back to LTR");
      enforceLTRLayout();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir", "class"],
  });

  /* ----------------------------------------
     ✅ Re-apply on resize / orientation changes
  ----------------------------------------- */
  window.addEventListener("resize", enforceLTRLayout);

  console.log("🛡️ Layout direction monitoring initialized");
};
