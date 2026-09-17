window.BP = window.BP || {};

BP.escapeHTML = function (value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
};

BP.formatDate = function (value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year:"numeric", month:"short", day:"numeric"
  }).format(new Date(value));
};

BP.daysBetween = function (from, to) {
  const a = new Date(from); a.setHours(0,0,0,0);
  const b = new Date(to); b.setHours(0,0,0,0);
  return Math.ceil((b-a)/86400000);
};

BP.clamp = (n,min,max) => Math.min(max, Math.max(min,n));

BP.requireClient = function () {
  if (!window.sb) {
    BP.toast("ยังไม่ได้ตั้งค่า Supabase ใน js/config.js", "error");
    return false;
  }
  return true;
};

BP.setLoading = function (button, loading, text) {
  if (!button) return;
  if (loading) {
    button.dataset.oldText = button.textContent;
    button.disabled = true;
    button.textContent = text || "กำลังทำงาน...";
  } else {
    button.disabled = false;
    button.textContent = button.dataset.oldText || button.textContent;
  }
};
