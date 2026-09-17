window.Auth = {
  async user() {
    if (!window.sb) return null;
    const { data, error } = await window.sb.auth.getUser();
    if (error) return null;
    return data.user || null;
  },

  async signIn(email, password) {
    if (!BP.requireClient()) throw new Error("Supabase ยังไม่พร้อม");
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(displayName, email, password) {
    if (!BP.requireClient()) throw new Error("Supabase ยังไม่พร้อม");
    const { data, error } = await window.sb.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!window.sb) return;
    const { error } = await window.sb.auth.signOut();
    if (error) throw error;
  },

  async requireAuth() {
    const user = await this.user();
    if (!user) {
      const returnTo = encodeURIComponent(location.pathname.split("/").pop() || "dashboard.html");
      location.href = "login.html?returnTo=" + returnTo;
      return null;
    }
    return user;
  }
};

document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-action='logout']");
  if (!btn) return;
  try {
    await Auth.signOut();
    location.href = "login.html";
  } catch (err) {
    BP.toast(err.message || "ออกจากระบบไม่สำเร็จ", "error");
  }
});
