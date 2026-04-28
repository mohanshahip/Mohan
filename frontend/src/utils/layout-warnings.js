// utils/layout-warnings.js

/**
 * Check for common layout issues and log warnings
 * Call this in AdminLayout.jsx and App.jsx useEffect
 */
export const checkLayoutIssues = () => {
  // Check for duplicate topbars/navbars
  const topbars = document.querySelectorAll('.topbar');
  const navbars = document.querySelectorAll('.navbar');
  
  if (topbars.length > 1) {
    console.warn('⚠️ Multiple topbars detected. Check AdminLayout nesting.');
    console.warn('Topbars found:', topbars.length);
  }
  
  if (navbars.length > 1) {
    console.warn('⚠️ Multiple navbars detected. Admin pages should not show public navbar.');
    console.warn('Navbars found:', navbars.length);
  }
  
  // Check for body padding conflicts
  const bodyPadding = parseInt(window.getComputedStyle(document.body).paddingTop);
  const isAdmin = document.querySelector('.admin-layout');
  
  if (isAdmin && bodyPadding > 0) {
    console.warn('⚠️ Body padding detected on admin page. Should be 0.');
    console.warn('Current body padding-top:', bodyPadding, 'px');
  }
  
  // Check for CSS variable conflicts
  const topbarHeight = getComputedStyle(document.documentElement)
    .getPropertyValue('--topbar-height')
    .trim();
    
  if (!topbarHeight || topbarHeight === '') {
    console.warn('⚠️ --topbar-height CSS variable not set.');
  }
  
  // Check for z-index issues
  const topbar = document.querySelector('.topbar');
  const sidebar = document.querySelector('.sidebar');
  
  if (topbar && sidebar) {
    const topbarZ = window.getComputedStyle(topbar).zIndex;
    const sidebarZ = window.getComputedStyle(sidebar).zIndex;
    
    if (parseInt(topbarZ) <= parseInt(sidebarZ)) {
      console.warn('⚠️ Topbar z-index should be higher than sidebar.');
      console.warn('Topbar z-index:', topbarZ, 'Sidebar z-index:', sidebarZ);
    }
  }
  
  return {
    hasIssues: topbars.length > 1 || navbars.length > 1 || (isAdmin && bodyPadding > 0),
    issues: {
      multipleTopbars: topbars.length > 1,
      multipleNavbars: navbars.length > 1,
      adminBodyPadding: isAdmin && bodyPadding > 0,
      missingTopbarHeight: !topbarHeight || topbarHeight === ''
    }
  };
};

/**
 * Initialize layout monitoring
 */
export const initLayoutMonitoring = () => {
  // Run checks on load
  setTimeout(() => {
    const issues = checkLayoutIssues();
    
    if (!issues.hasIssues) {
      console.log('✅ Layout checks passed');
    }
  }, 1000);
  
  // Run checks on resize
  window.addEventListener('resize', () => {
    setTimeout(checkLayoutIssues, 500);
  });
};