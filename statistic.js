window.Statistics = {

  progress(book) {
    return book?.total_pages
      ? Math.min(
          100,
          Math.max(
            0,
            (Number(book.current_page || 0) /
              Number(book.total_pages)) * 100
          )
        )
      : 0;
  },

  remaining(book) {
    return Math.max(
      0,
      Number(book?.total_pages || 0) -
      Number(book?.current_page || 0)
    );
  },

  dailyTarget(book) {
    if (!book) return null;

    const remaining = this.remaining(book);

    const days = book.target_date && window.BP?.daysBetween
      ? BP.daysBetween(BP.today(), book.target_date)
      : null;

    if (remaining <= 0) {
      return {
        value: 0,
        label: "อ่านจบแล้ว"
      };
    }

    if (days === null) {
      return {
        value: null,
        label: "ยังไม่ได้ตั้งเป้าหมาย"
      };
    }

    if (days <= 0) {
      return {
        value: null,
        label: days === 0
          ? "ถึงวันเป้าหมายแล้ว"
          : "เกินกำหนด"
      };
    }

    const value = Math.ceil(remaining / days);

    return {
      value,
      label: `${value} หน้า / วัน`
    };
  },

  average(logs) {
    const byDay = {};

    (logs || []).forEach(log => {
      const date = log.reading_date;

      byDay[date] =
        (byDay[date] || 0) +
        Number(log.pages_read || 0);
    });

    const values = Object.values(byDay);

    return values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  },

  forecast(book, logs) {
    const remaining = this.remaining(book);
    const average = this.average(logs);

    if (!remaining) {
      return {
        text: "อ่านจบแล้ว"
      };
    }

    if (!average) {
      return {
        text: "ยังไม่มีข้อมูลเพียงพอสำหรับคาดการณ์"
      };
    }

    const days = Math.ceil(remaining / average);

    const date = new Date();
    date.setDate(date.getDate() + days);

    const dateText = window.BP?.date
      ? BP.date(date.toISOString().slice(0, 10))
      : date.toLocaleDateString("th-TH");

    return {
      date: date.toISOString().slice(0, 10),
      text: `ประมาณ ${dateText}`
    };
  },

  summarize(books, logs) {
    const completed =
      (books || []).filter(
        b => b.status === "completed"
      ).length;

    const reading =
      (books || []).filter(
        b => b.status === "reading"
      ).length;

    const totalPagesRead =
      (logs || []).reduce(
        (sum, log) =>
          sum + Number(log.pages_read || 0),
        0
      );

    const days =
      new Set(
        (logs || []).map(
          log => log.reading_date
        )
      ).size;

    const totalMinutes =
      (logs || []).reduce(
        (sum, log) =>
          sum +
          Number(
            log.reading_minutes ??
            log.duration_minutes ??
            0
          ),
        0
      );

    return {
      reading,
      completed,
      days,
      totalPagesRead,
      totalMinutes,
      avg: days
        ? totalPagesRead / days
        : 0
    };
  },

  summary(books, logs) {
    return this.summarize(books, logs);
  },

  renderDaily(logs, root) {

    if (!root) return;

    const byDay = {};

    (logs || []).forEach(log => {
      const date = log.reading_date;

      if (!byDay[date]) {
        byDay[date] = {
          pages: 0,
          minutes: 0
        };
      }

      byDay[date].pages +=
        Number(log.pages_read || 0);

      byDay[date].minutes +=
        Number(
          log.reading_minutes ??
          log.duration_minutes ??
          0
        );
    });

    const dates = Object.keys(byDay)
      .sort()
      .reverse()
      .slice(0, 7);

    if (!dates.length) {
      root.innerHTML = `
        <div class="empty">
          <p>ยังไม่มีประวัติการอ่าน</p>
        </div>
      `;
      return;
    }

    root.innerHTML = dates.map(date => `
      <div class="daily-row">
        <strong>${date}</strong>
        <span>
          ${byDay[date].pages} หน้า
        </span>
        <span>
          ${byDay[date].minutes} นาที
        </span>
      </div>
    `).join("");
  }
};