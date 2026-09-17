window.Books = {
  async list(userId) {
    const { data, error } = await window.sb.from("books").select("*")
      .eq("user_id", userId).order("created_at", { ascending:false });
    if (error) throw error;
    return data || [];
  },

  async get(id, userId) {
    const { data, error } = await window.sb.from("books").select("*")
      .eq("id", id).eq("user_id", userId).single();
    if (error) throw error;
    return data;
  },

  async create(book, userId) {
    const payload = {
      user_id:userId, title:book.title.trim(), author:(book.author||"").trim(),
      total_pages:Number(book.total_pages), current_page:Number(book.current_page||0),
      start_date:book.start_date || new Date().toISOString().slice(0,10),
      target_date:book.target_date || null, category:book.category || "อื่นๆ",
      status:"reading", notes:(book.notes||"").trim()
    };
    const { data, error } = await window.sb.from("books").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, patch, userId) {
    const { data, error } = await window.sb.from("books").update(patch)
      .eq("id", id).eq("user_id", userId).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id, userId) {
    const { error } = await window.sb.from("books").delete()
      .eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }
};
