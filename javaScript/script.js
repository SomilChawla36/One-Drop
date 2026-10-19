/**
 * ONE DROP BLOOD BANK - Main Entry Point
 *
 * NOTE: This file is kept for backward compatibility.
 * All logic has been refactored into separate modules:
 *
 *   store.js         → LocalStorage Data Store
 *   ui.js            → Toast Notifications & Modals
 *   auth.js          → Authentication & Navbar State
 *   donor.js         → Donor Registration Wizard (become-a-donar.html)
 *   find-blood.js    → Live Blood Search & Emergency Broadcast (find.html)
 *   certificates.js  → Certificate Lookup / Generate / Verify (certificates.html)
 *   community.js     → Drive Bookings & Story Wall (community.html)
 *   why-donate.js    → Myth Toggles & Eligibility Checker (why-donate.html)
 *   index-page.js    → Home Page Metrics (index.html)
 *
 * Each page includes only its own module files via <script> tags.
 * This script.js is loaded on pages that do NOT have a dedicated page script
 * (e.g. pages where only auth + hamburger menu is needed like login/signup).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Core modules available on every page
  if (typeof OneDropStore !== 'undefined') OneDropStore.init();
  if (typeof OneDropAuth !== 'undefined') {
    OneDropAuth.setupMobileMenu();
    OneDropAuth.updateNavbar();
    OneDropAuth.initSignupPage();   // only activates on signup.html
    OneDropAuth.initLoginPage();    // only activates on login.html
  }

  // Page-specific modules — each guards itself with an early return
  if (typeof OneDropDonor !== 'undefined')       OneDropDonor.init();
  if (typeof OneDropSearch !== 'undefined')      OneDropSearch.init();
  if (typeof OneDropCertificates !== 'undefined') OneDropCertificates.init();
  if (typeof OneDropCommunity !== 'undefined')   OneDropCommunity.init();
  if (typeof OneDropWhyDonate !== 'undefined')   OneDropWhyDonate.init();
  if (typeof OneDropIndex !== 'undefined')       OneDropIndex.init();
});