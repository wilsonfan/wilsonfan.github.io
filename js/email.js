// Builds the mailto href at runtime so the address never appears in page
// source or static HTML — defeats basic scrapers without any backend.
(function () {
  var user = "wilson.fan";
  var domain = "pm.me";
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + user + "@" + domain;
  });
})();
