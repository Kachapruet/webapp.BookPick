// ============================================================
// BookPick - dashboard.js
// ============================================================

console.log("📊 dashboard.js loading...");

window.Dashboard = {

  async render(user, root) {

    // --------------------------------------------------------
    // ตรวจสอบ
    // --------------------------------------------------------

    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    if (!root) {
      throw new Error("ไม่พบ #app");
    }

    if (!window.Books) {
      throw new Error("ไม่พบ Books API กรุณาตรวจสอบ books.js");
    }

    if (!window.sb) {
      throw new Error("ไม่พบ Supabase Client");
    }


    // --------------------------------------------------------
    // แสดง Loading
    // --------------------------------------------------------

    root.innerHTML = `
      <div class="loading">
        กำลังโหลดข้อมูล...
      </div>
    `;


    // --------------------------------------------------------
    // โหลด Books ครั้งเดียว
    // --------------------------------------------------------

    const books = await window.Books.list(user.id);


    // --------------------------------------------------------
    // โหลด Reading Logs ครั้งเดียว
    //
    // ไม่วน:
    // for (const book of books)
    //
    // เพื่อป้องกัน OneCompiler timeout
    // --------------------------------------------------------

    const {
      data: allLogs,
      error: logsError
    } = await window.sb
      .from("reading_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("reading_date", {
        ascending: false
      })
      .order("created_at", {
        ascending: false
      });


    if (logsError) {
      console.error(
        "Reading Logs Error:",
        logsError
      );

      throw logsError;
    }


    const logs = allLogs || [];


    // --------------------------------------------------------
    // Statistics
    // --------------------------------------------------------

    const completed =
      books.filter(
        book =>
          book.status === "completed"
      ).length;


    const reading =
      books.filter(
        book =>
          book.status === "reading"
      ).length;


    const totalPagesRead =
      logs.reduce(
        (sum, log) =>
          sum +
          Number(
            log.pages_read || 0
          ),
        0
      );


    const readingDays =
      new Set(
        logs
          .map(
            log =>
              log.reading_date
          )
          .filter(Boolean)
      ).size;


    const totalMinutes =
      logs.reduce(
        (sum, log) =>
          sum +
          Number(
            log.reading_minutes ||
            log.duration_minutes ||
            0
          ),
        0
      );


    // --------------------------------------------------------
    // หนังสือที่กำลังอ่าน
    // --------------------------------------------------------

    const currentBooks =
      books.filter(
        book =>
          book.status === "reading"
      );


    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------

    root.innerHTML = `

      <!-- ====================================================
           HERO
           ==================================================== -->

      <section class="hero">

        <div>

          <span class="eyebrow">
            BOOKPICK
          </span>

          <h1>
            ยินดีต้อนรับ 👋
          </h1>

          <p>
            ติดตามการอ่านของคุณแบบง่าย ๆ
            และอ่านให้ถึงเป้าหมาย
          </p>

        </div>


        <a
          class="btn primary"
          href="reading.html"
        >
          + บันทึกการอ่าน
        </a>

      </section>


      <!-- ====================================================
           STATISTICS
           ==================================================== -->

      <section class="stats-grid">

        ${dashboardCard(
          "กำลังอ่าน . . .",
          reading,
          "📖"
        )}

        ${dashboardCard(
          "อ่านจบแล้ว",
          completed,
          "✅"
        )}

        ${dashboardCard(
          "สถิติการอ่านติดต่อกัน",
          readingDays,
          "📅"
        )}

        ${dashboardCard(
          "อ่านไปแล้ว",
          `${totalPagesRead} หน้า`,
          "📚"
        )}

        ${dashboardCard(
          "เวลาที่อ่านทั้งหมด",
          formatMinutes(totalMinutes),
          "⏱️"
        )}

      </section>


      <!-- ====================================================
           CURRENT BOOKS
           ==================================================== -->

      <section>

        <div class="section-head">

          <div>

            <h2>
              หนังสือที่กำลังอ่าน
            </h2>

            <p>
              กดบันทึกการอ่านได้ทันที
            </p>

          </div>


          <a
            class="btn secondary"
            href="reading.html"
          >
            จัดการหนังสือ
          </a>

        </div>


        <div class="book-list">

          ${
            currentBooks.length
              ? currentBooks
                  .map(
                    dashboardBookCard
                  )
                  .join("")
              : dashboardEmpty()
          }

        </div>

      </section>


      <!-- ====================================================
           RECENT STATISTICS
           ==================================================== -->

      <section class="panel">

        <div class="section-head">

          <div>

            <h2>
              สถิติการอ่านล่าสุด
            </h2>

            <p>
              สรุปจากประวัติการอ่านของคุณ
            </p>

          </div>

        </div>


        <div id="daily-stats">

          ${renderDailyFallback(logs)}

        </div>

      </section>

    `;


    // --------------------------------------------------------
    // ใช้ Statistics ถ้ามี
    // --------------------------------------------------------

    const daily =
      root.querySelector(
        "#daily-stats"
      );


    if (
      daily &&
      window.Statistics &&
      typeof window.Statistics.renderDaily === "function"
    ) {

      try {

        window.Statistics.renderDaily(
          logs,
          daily
        );

      } catch (error) {

        console.warn(
          "Statistics.renderDaily error:",
          error
        );

      }

    }


    console.log(
      "✅ Dashboard rendered",
      {
        books: books.length,
        logs: logs.length,
        reading,
        completed,
        totalPagesRead,
        readingDays,
        totalMinutes
      }
    );
  }

};


// ============================================================
// Dashboard Card
// ============================================================

function dashboardCard(
  label,
  value,
  icon
) {

  return `

    <article class="stat-card">

      <span>
        ${icon}
      </span>

      <div>

        <strong>
          ${escapeDashboardHTML(
            String(value)
          )}
        </strong>

        <small>
          ${escapeDashboardHTML(
            String(label)
          )}
        </small>

      </div>

    </article>

  `;
}


// ============================================================
// Book Card
// ============================================================

function dashboardBookCard(book) {

  const total =
    Number(
      book.total_pages || 0
    );


  const current =
    Number(
      book.current_page || 0
    );


  let progress = 0;


  if (total > 0) {

    progress =
      Math.round(
        current /
        total *
        100
      );

  }


  progress =
    Math.max(
      0,
      Math.min(
        100,
        progress
      )
    );


  return `

    <article class="book-progress">

      <div class="book-progress-top">

        <div>

          <h3>
            ${escapeDashboardHTML(
              book.title ||
              "ไม่มีชื่อหนังสือ"
            )}
          </h3>

          <p>
            ${escapeDashboardHTML(
              book.author ||
              "ไม่ระบุผู้แต่ง"
            )}
          </p>

        </div>


        <b>
          ${progress}%
        </b>

      </div>


      <div class="progress">

        <i
          style="width:${progress}%"
        ></i>

      </div>


      <div class="book-meta">

        <span>
          หน้า ${current}/${total}
        </span>

        <span>
          เป้าหมาย
          ${
            book.target_date
              ? formatDashboardDate(
                  book.target_date
                )
              : "ไม่ได้ตั้ง"
          }
        </span>

      </div>


      <a
        class="btn primary full"
        href="reading.html?book=${encodeURIComponent(
          book.id
        )}"
      >
        บันทึกวันนี้
      </a>

    </article>

  `;
}


// ============================================================
// Empty State
// ============================================================

function dashboardEmpty() {

  return `

    <div class="empty panel">

      <h3>
        ยังไม่มีหนังสือที่กำลังอ่าน
      </h3>

      <p>
        สร้างโปรไฟล์หนังสือเล่มแรกของคุณได้เลย
      </p>

      <a
        class="btn primary"
        href="reading.html"
      >
        สร้างหนังสือ
      </a>

    </div>

  `;
}


// ============================================================
// Format Minutes
// ============================================================

function formatMinutes(minutes) {

  const value =
    Number(minutes || 0);


  if (value >= 60) {

    const hours =
      Math.floor(
        value / 60
      );

    const mins =
      value % 60;


    return `${hours} ชม. ${mins} นาที`;

  }


  return `${value} นาที`;
}


// ============================================================
// Format Date
// ============================================================

function formatDashboardDate(date) {

  try {

    if (
      window.BP &&
      typeof BP.formatDate === "function"
    ) {

      return BP.formatDate(
        date
      );

    }


    return new Date(
      date
    ).toLocaleDateString(
      "th-TH"
    );

  } catch (error) {

    return date || "-";

  }

}


// ============================================================
// Escape HTML
// ============================================================

function escapeDashboardHTML(value) {

  if (
    window.BP &&
    typeof BP.escapeHTML === "function"
  ) {

    return BP.escapeHTML(
      value
    );

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ============================================================
// Fallback Daily Statistics
// ============================================================

function renderDailyFallback(logs) {

  if (
    !logs ||
    !logs.length
  ) {

    return `
      <p class="muted">
        ยังไม่มีประวัติการอ่าน
      </p>
    `;

  }


  const byDate = {};


  logs.forEach(
    log => {

      const date =
        log.reading_date ||
        "-";


      if (!byDate[date]) {

        byDate[date] = 0;

      }


      byDate[date] +=
        Number(
          log.pages_read || 0
        );

    }
  );


  const dates =
    Object.keys(
      byDate
    ).slice(
      0,
      7
    );


  return `

    <div class="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              วันที่
            </th>

            <th>
              อ่านไป
            </th>

          </tr>

        </thead>


        <tbody>

          ${
            dates
              .map(
                date => `
                  <tr>

                    <td>
                      ${formatDashboardDate(
                        date
                      )}
                    </td>

                    <td>
                      ${byDate[date]} หน้า
                    </td>

                  </tr>
                `
              )
              .join("")
          }

        </tbody>

      </table>

    </div>

  `;

}


// ============================================================
// Ready
// ============================================================

console.log(
  "✅ Dashboard API READY",
  window.Dashboard
);