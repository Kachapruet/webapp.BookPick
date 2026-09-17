(function () {
  const cfg = window.BOOKPICK_CONFIG;

  if (!cfg) {
    console.error("BOOKPICK_CONFIG is not defined");
    return;
  }

  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    console.error("Supabase URL or Anon Key is missing");
    return;
  }

  if (!window.supabase) {
    console.error("Supabase JS library is not loaded");
    return;
  }

  try {
    window.sb = window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );

    console.log("Supabase connected:", cfg.SUPABASE_URL);
  } catch (error) {
    console.error("Supabase initialization failed:", error);
  }
})();