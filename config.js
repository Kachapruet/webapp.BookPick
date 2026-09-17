// BookPick Configuration

window.BOOKPICK_CONFIG = Object.freeze({
  SUPABASE_URL: "https://ukamptprhfzcwrhbznsw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYW1wdHByaGZ6Y3dyaGJ6bnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjkyMzEsImV4cCI6MjEwNDk0NTIzMX0.vsdM9rKuW58gESWL3_95LVGhljaCYts_Vogc9uU9iBE"
});

// Global BookPick namespace
window.BP = window.BP || {};

// Toast notification
window.BP.toast = function (message, type = "info") {
  const old = document.querySelector(".bp-toast");
  if (old) {
    old.remove();
  }

  const el = document.createElement("div");

  el.className = "bp-toast " + type;
  el.textContent = message;

  document.body.appendChild(el);

  setTimeout(function () {
    el.classList.add("show");
  }, 10);

  setTimeout(function () {
    el.classList.remove("show");

    setTimeout(function () {
      el.remove();
    }, 300);
  }, 3000);
};