// ============================================================
// BookPick - reading.js
// ============================================================

console.log("📖 reading.js loading...");

window.Reading = {

  // ==========================================================
  // LIST
  // ==========================================================

  async list(userId, bookId) {

    if (!window.sb) {
      throw new Error("ไม่พบ Supabase Client");
    }

    let query = window.sb
      .from("reading_logs")
      .select("*")
      .eq("user_id", userId)
      .order("reading_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (bookId) {
      query = query.eq("book_id", bookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Reading list error:", error);
      throw error;
    }

    return data || [];
  },


  // ==========================================================
  // ADD
  // ==========================================================

  async add({
    userId,
    book,
    currentPage,
    minutes,
    notes,
    date
  }) {

    if (!window.sb) {
      throw new Error("ไม่พบ Supabase Client");
    }

    if (!book) {
      throw new Error("ไม่พบหนังสือ");
    }

    const endPage = Number(currentPage);
    const startPage = Number(book.current_page || 0);
    const totalPages = Number(book.total_pages || 0);

    // --------------------------------------------------------
    // ตรวจสอบหน้า
    // --------------------------------------------------------

    if (!Number.isInteger(endPage)) {
      throw new Error("กรุณากรอกเลขหน้าเป็นจำนวนเต็ม");
    }

    if (endPage < startPage) {
      throw new Error(
        `หน้าต้องไม่น้อยกว่าหน้าปัจจุบัน (${startPage})`
      );
    }

    if (endPage > totalPages) {
      throw new Error(
        `หน้าต้องไม่เกินจำนวนหน้าทั้งหมด (${totalPages})`
      );
    }

    // --------------------------------------------------------
    // IMPORTANT
    //
    // ใช้ start_page / end_page
    // และไม่ส่ง pages_read เพราะเป็น GENERATED COLUMN
    // --------------------------------------------------------

    const payload = {
      user_id: userId,
      book_id: book.id,

      reading_date:
        date ||
        new Date().toISOString().slice(0, 10),

      start_page: startPage,
      end_page: endPage,

      reading_minutes: Number(minutes || 0),

      notes: String(notes || "").trim()
    };

    console.log(
      "📖 Adding reading log:",
      payload
    );

    const {
      data,
      error
    } = await window.sb
      .from("reading_logs")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(
        "Reading log error:",
        error
      );

      throw error;
    }

    // --------------------------------------------------------
    // อัปเดตหน้าปัจจุบันของหนังสือ
    // --------------------------------------------------------

    const status =
      endPage >= totalPages
        ? "completed"
        : "reading";

    if (
      window.Books &&
      typeof window.Books.update === "function"
    ) {

      await window.Books.update(
        book.id,
        {
          current_page: endPage,
          status: status
        },
        userId
      );
    }

    console.log(
      "✅ Reading log saved:",
      data
    );

    return data;
  },


  // ==========================================================
  // METRICS
  // ==========================================================

  metrics(book, logs) {

    const total =
      Number(book?.total_pages || 0);

    const current =
      Number(book?.current_page || 0);

    const remaining =
      Math.max(
        0,
        total - current
      );

    // --------------------------------------------------------
    // Progress
    // --------------------------------------------------------

    const progress =
      total > 0
        ? Math.min(
            100,
            Math.max(
              0,
              current / total * 100
            )
          )
        : 0;

    // --------------------------------------------------------
    // Target date
    // --------------------------------------------------------

    let daysLeft = null;

    if (book?.target_date) {

      const targetDate =
        new Date(book.target_date);

      targetDate.setHours(
        0, 0, 0, 0
      );

      const today = new Date();

      today.setHours(
        0, 0, 0, 0
      );

      daysLeft =
        Math.max(
          1,
          Math.ceil(
            (targetDate - today) /
            86400000
          )
        );
    }

    // --------------------------------------------------------
    // Daily target
    // --------------------------------------------------------

    const dailyTarget =
      daysLeft
        ? Math.ceil(
            remaining / daysLeft
          )
        : null;

    // --------------------------------------------------------
    // Pages read
    //
    // pages_read มาจาก Supabase Generated Column
    // --------------------------------------------------------

    const pages =
      (logs || []).reduce(
        (sum, log) =>
          sum +
          Number(log.pages_read || 0),
        0
      );

    // --------------------------------------------------------
    // Reading days
    // --------------------------------------------------------

    const readingDays =
      new Set(
        (logs || [])
          .map(log => log.reading_date)
          .filter(Boolean)
      ).size;

    // --------------------------------------------------------
    // Average
    // --------------------------------------------------------

    const avgPagesPerDay =
      readingDays > 0
        ? pages / readingDays
        : 0;

    // --------------------------------------------------------
    // Forecast
    // --------------------------------------------------------

    let forecast = null;

    if (remaining <= 0) {

      forecast = new Date();

    } else if (avgPagesPerDay > 0) {

      const days =
        Math.ceil(
          remaining /
          avgPagesPerDay
        );

      forecast = new Date();

      forecast.setDate(
        forecast.getDate() + days
      );
    }

    return {
      total,
      current,
      remaining,
      progress,
      daysLeft,
      dailyTarget,
      pages,
      readingDays,
      avgPagesPerDay,
      forecast
    };
  }

};

console.log(
  "✅ Reading API READY",
  window.Reading
);