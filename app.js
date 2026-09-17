// ============================================================
// BookPick - app.js
// ============================================================

(async function () {
  const page = document.body.dataset.page;

  if (!page) return;

  // หน้า Login / Register ไม่ต้องตรวจสอบ Login
  if (["login", "register"].includes(page)) return;

  try {
    const user = await Auth.requireAuth();

    if (!user) return;

    // แสดง Email ผู้ใช้ ถ้ามี
    const emailEl = document.querySelector("[data-user-email]");
    if (emailEl) {
      emailEl.textContent = user.email || "";
    }

    // Dashboard
    if (page === "dashboard") {
      const root = document.querySelector("#app");

      if (!root) {
        throw new Error("ไม่พบ #app");
      }

      await Dashboard.render(user, root);
    }

    // Reading
    if (page === "reading") {
      const root = document.querySelector("#app");

      if (!root) {
        throw new Error("ไม่พบ #app");
      }

      await renderReadingPage(user, root);
    }

  } catch (err) {
    console.error("App Error:", err);

    if (window.BP && typeof BP.toast === "function") {
      BP.toast(
        err?.message || "เกิดข้อผิดพลาด",
        "error"
      );
    } else {
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  }
})();


// ============================================================
// Reading Page
// ============================================================

async function renderReadingPage(user, root) {

  let books = await Books.list(user.id);

  const urlBook =
    new URLSearchParams(location.search).get("book");

  // ----------------------------------------------------------
  // HTML
  // ----------------------------------------------------------

  root.innerHTML = `
    <section class="hero compact">
      <div>
        <span class="eyebrow">READING TRACKER</span>

        <h1>บันทึกการอ่านหนังสือ</h1>

        <p>
          สร้างโปรไฟล์หนังสือและบันทึกความคืบหน้า
        </p>
      </div>
    </section>


    <section class="two-col">

      <!-- ====================================================
           Create Book
           ==================================================== -->

      <div class="panel">

        <h2>เพิ่มเข้าชั้นวาง</h2>

        <form id="book-form" class="form-grid">

          <label>
            ชื่อหนังสือ
            <input
              name="title"
              required
              placeholder="เช่น Atomic Habits"
            >
          </label>


          <label>
            ผู้แต่ง
            <input
              name="author"
              placeholder="ชื่อผู้แต่ง"
            >
          </label>


          <label>
            จำนวนหน้าทั้งหมด
            <input
              name="total_pages"
              type="number"
              min="1"
              required
              placeholder="350"
            >
          </label>


          <label>
            ตั้งเป้าอ่านจบวันที่
            <input
              name="target_date"
              type="date"
            >
          </label>


          <label>
            หมวดหมู่

            <select name="category">

              <option value="การเรียน">
                การเรียน
              </option>

              <option value="การพัฒนาตนเอง">
                การพัฒนาตนเอง
              </option>

              <option value="การ์ตูน / นิยาย">
                นิยาย
              </option>

              <option value="ศาสนาและวัฒนธรรม">
                การ์ตูน
              </option>

              <option value="อื่นๆ">
                อื่นๆ
              </option>

            </select>
          </label>


          <label>
            อ่านไปแล้ว(หน้า)

            <input
              name="current_page"
              type="number"
              min="0"
              value="0"
            >
          </label>


          <label class="span-2">
            หมายเหตุ

            <textarea
              name="notes"
              rows="3"
            ></textarea>
          </label>


          <button
            class="btn primary span-2"
            type="submit"
          >
            เพิ่มเข้าชั้นหนังสือ
          </button>

        </form>

      </div>


      <!-- ====================================================
           Quick Page Log
           ==================================================== -->

      <div class="panel quick-panel">

        <h2>เพิ่มหนังสืออ่านใหม่</h2>

        <p class="muted">
          เลือกหนังสือ แล้วกรอกแค่</p>
        <p class="muted"> “วันนี้อ่านถึงหน้าไหน”</p>


        <form id="log-form" class="form-grid">

          <label class="span-2">
            หนังสือ

            <select
              id="book-select"
              required
            ></select>
          </label>


          <div
            class="quick-current span-2"
            id="quick-current"
          ></div>


          <label class="span-2">
            วันนี้อ่านถึงหน้าที่

            <input
              id="page-input"
              type="number"
              min="0"
              required
              placeholder="เช่น 120"
            >
          </label>


          <label>
            เวลาอ่าน (นาที)

            <input
              id="minutes-input"
              type="number"
              min="0"
              value="0"
            >
          </label>


          <label>
            วันที่

            <input
              id="date-input"
              type="date"
              value="${new Date()
                .toISOString()
                .slice(0, 10)}"
            >
          </label>


          <label class="span-2">
            โน๊ต

            <textarea
              id="log-notes"
              rows="2"
            ></textarea>
          </label>


          <button
            class="btn primary span-2"
            type="submit"
          >
            บันทึกการอ่านวันนี้
          </button>

        </form>

      </div>

    </section>


    <!-- ======================================================
         My Books
         ====================================================== -->

    <section>

      <div class="section-head">

        <div>
          <h2>หนังสือของฉัน</h2>
        </div>

      </div>


      <div
        id="my-books"
        class="reading-grid"
      ></div>

    </section>


    <!-- ======================================================
         Reading Logs
         ====================================================== -->

    <section class="panel">

      <h2>ประวัติการอ่าน</h2>

      <div id="logs"></div>

    </section>
  `;


  // ==========================================================
  // Elements
  // ==========================================================

  const select =
    root.querySelector("#book-select");

  const currentEl =
    root.querySelector("#quick-current");

  const pageInput =
    root.querySelector("#page-input");

  const logForm =
    root.querySelector("#log-form");

  const bookForm =
    root.querySelector("#book-form");


  // ตรวจสอบ Reading API
  if (!window.Reading) {

    console.error(
      "Reading API ไม่พร้อมใช้งาน",
      window.Reading
    );

    throw new Error(
      "ไม่พบ Reading API กรุณาตรวจสอบ reading.js"
    );
  }


  // ==========================================================
  // Refresh Book Select
  // ==========================================================

  function refreshSelect() {

    if (!select) return;


    if (!books.length) {

      select.innerHTML = `
        <option value="">
          ยังไม่มีหนังสือ
        </option>
      `;

      updateQuick();

      return;
    }


    select.innerHTML = books
      .map(b => `
        <option value="${b.id}">
          ${BP.escapeHTML(b.title)}
          — หน้า ${Number(b.current_page || 0)}
          / ${Number(b.total_pages || 0)}
        </option>
      `)
      .join("");


    // ถ้ามี ?book=xxxx ใน URL
    if (
      urlBook &&
      books.some(b => String(b.id) === String(urlBook))
    ) {
      select.value = urlBook;
    }


    updateQuick();
  }


  // ==========================================================
  // Update Quick Page
  // ==========================================================

  async function updateQuick() {

    const b =
      books.find(
        x => String(x.id) === String(select.value)
      );


    if (!b) {

      currentEl.innerHTML = `
        <strong>ยังไม่มีหนังสือ</strong>
        <span>สร้างหนังสือก่อน</span>
      `;

      pageInput.min = 0;
      pageInput.max = "";
      pageInput.value = 0;

      renderBooks();

      root.querySelector("#logs").innerHTML = `
        <p class="muted">
          ยังไม่มีประวัติการอ่าน
        </p>
      `;

      return;
    }


    // ========================================================
    // จุดสำคัญ:
    // ต้องใช้ b.id ไม่ใช่ book.id
    // ========================================================

    const logs =
      await window.Reading.list(
        user.id,
        b.id
      );


    const m =
      window.Reading.metrics(
        b,
        logs
      );


    currentEl.innerHTML = `
      <strong>
        อ่านถึงหน้าที่ ${Number(b.current_page || 0)}
        /
        ${Number(b.total_pages || 0)}
      </strong>

      <span>
        ความคืบหน้า
        ${Math.round(m.progress)}%
      </span>

      <span>
        เป้าหมายวันนี้
        ${m.dailyTarget ?? "-"} หน้า
      </span>

      <span>
        คาดว่าจะจบ
        ${
          m.forecast
            ? BP.formatDate(
                m.forecast.toISOString
                  ? m.forecast.toISOString().slice(0, 10)
                  : m.forecast
              )
            : "-"
        }
      </span>
    `;


    // กำหนดช่วงของ Page Input
    pageInput.min =
      Number(b.current_page || 0);

    pageInput.max =
      Number(b.total_pages || 0);

    pageInput.value =
      Number(b.current_page || 0);


    renderBooks();

    renderLogs(logs, b);
  }


  // ==========================================================
  // Render My Books
  // ==========================================================

  function renderBooks() {

    const container =
      root.querySelector("#my-books");


    if (!container) return;


    if (!books.length) {

      container.innerHTML = `
        <div class="empty panel">
          <h3>ยังไม่มีหนังสือ</h3>

          <p>
            สร้างโปรไฟล์หนังสือเล่มแรกของคุณได้เลย
          </p>
        </div>
      `;

      return;
    }


    container.innerHTML =
      books
        .map(b => {

          const total =
            Number(b.total_pages || 0);

          const current =
            Number(b.current_page || 0);

          const p =
            total
              ? Math.min(
                  100,
                  Math.round(
                    current / total * 100
                  )
                )
              : 0;


          return `
            <article class="book-card">

              <div class="book-cover">
                📘
              </div>


              <div class="book-card-body">

                <span class="tag">
                  ${BP.escapeHTML(
                    b.category || "อื่นๆ"
                  )}
                </span>


                <h3>
                  ${BP.escapeHTML(
                    b.title || "ไม่มีชื่อ"
                  )}
                </h3>


                <p>
                  ${BP.escapeHTML(
                    b.author || "ไม่ระบุผู้แต่ง"
                  )}
                </p>


                <div class="progress">
                  <i style="width:${p}%"></i>
                </div>


                <div class="book-meta">

                  <span>
                    ${current}/${total} หน้า
                  </span>

                  <span>
                    ${p}%
                  </span>

                </div>


                <button
                  class="btn danger small"
                  data-delete-book="${b.id}"
                  type="button"
                >
                  ลบ
                </button>

              </div>

            </article>
          `;

        })
        .join("");
  }


  // ==========================================================
  // Render Reading Logs
  // ==========================================================

  function renderLogs(logs, b) {

    const container =
      root.querySelector("#logs");


    if (!container) return;


    const m =
      window.Reading.metrics(
        b,
        logs
      );


    let html = `

      <div class="metrics-line">

        <b>
          อ่านแล้ว ${m.pages} หน้า
        </b>

        <b>
          ${m.readingDays} วัน
        </b>

        <b>
          เฉลี่ย
          ${
            m.avgPagesPerDay
              ? m.avgPagesPerDay.toFixed(1)
              : "0"
          }
          หน้า/วัน
        </b>

      </div>

    `;


    if (!logs.length) {

      html += `
        <p class="muted">
          ยังไม่มีประวัติ
        </p>
      `;

      container.innerHTML = html;

      return;
    }


    html += `

      <div class="table-wrap">

        <table>

          <thead>

            <tr>
              <th>วันที่</th>
              <th>หน้า</th>
              <th>เพิ่ม</th>
              <th>เวลา</th>
            </tr>

          </thead>


          <tbody>

            ${
              logs
                .map(l => `

                  <tr>

                    <td>
                      ${BP.formatDate(
                        l.reading_date
                      )}
                    </td>

                    <td>
                      ${Number(
                        l.current_page || 0
                      )}
                    </td>

                    <td>
                      +${Number(
                        l.pages_read || 0
                      )}
                    </td>

                    <td>
                      ${Number(
                        l.reading_minutes || 0
                      )}
                      นาที
                    </td>

                  </tr>

                `)
                .join("")
            }

          </tbody>

        </table>

      </div>

    `;


    container.innerHTML = html;
  }


  // ==========================================================
  // Book Form
  // ==========================================================

  if (bookForm) {

    bookForm.addEventListener(
      "submit",
      async function (e) {

        e.preventDefault();


        const form =
          e.currentTarget;


        const button =
          form.querySelector(
            'button[type="submit"]'
          );


        try {

          BP.setLoading(
            button,
            true,
            "กำลังสร้าง..."
          );


          const f =
            new FormData(form);


          const payload =
            Object.fromEntries(
              f.entries()
            );


          // แปลงตัวเลข
          payload.total_pages =
            Number(payload.total_pages || 0);

          payload.current_page =
            Number(payload.current_page || 0);


          const b =
            await Books.create(
              payload,
              user.id
            );


          books = [
            b,
            ...books
          ];


          // Reset อย่างปลอดภัย
          if (
            typeof form.reset === "function"
          ) {
            form.reset();
          }


          const currentPageInput =
            form.querySelector(
              '[name="current_page"]'
            );


          if (currentPageInput) {
            currentPageInput.value = 0;
          }


          refreshSelect();


          select.value = b.id;


          await updateQuick();


          BP.toast(
            "สร้างโปรไฟล์หนังสือแล้ว",
            "success"
          );

        } catch (err) {

          console.error(
            "Create book error:",
            err
          );

          BP.toast(
            err?.message ||
            "สร้างหนังสือไม่สำเร็จ",
            "error"
          );

        } finally {

          BP.setLoading(
            button,
            false
          );

        }

      }
    );
  }


  // ==========================================================
  // Reading Log Form
  // ==========================================================

  if (logForm) {

    logForm.addEventListener(
      "submit",
      async function (e) {

        e.preventDefault();


        const b =
          books.find(
            x =>
              String(x.id) ===
              String(select.value)
          );


        if (!b) {

          BP.toast(
            "กรุณาเลือกหนังสือ",
            "error"
          );

          return;
        }


        const button =
          e.submitter ||
          logForm.querySelector(
            'button[type="submit"]'
          );


        try {

          BP.setLoading(
            button,
            true,
            "กำลังบันทึก..."
          );


          await window.Reading.add({

            userId: user.id,

            book: b,

            currentPage:
              pageInput.value,

            minutes:
              root.querySelector(
                "#minutes-input"
              ).value,

            notes:
              root.querySelector(
                "#log-notes"
              ).value,

            date:
              root.querySelector(
                "#date-input"
              ).value

          });


          // โหลดข้อมูลใหม่จาก Supabase
          books =
            await Books.list(
              user.id
            );


          refreshSelect();


          select.value = b.id;


          await updateQuick();


          BP.toast(
            "บันทึกการอ่านแล้ว",
            "success"
          );


        } catch (err) {

          console.error(
            "Reading log error:",
            err
          );

          BP.toast(
            err?.message ||
            "บันทึกการอ่านไม่สำเร็จ",
            "error"
          );


        } finally {

          BP.setLoading(
            button,
            false
          );

        }

      }
    );
  }


  // ==========================================================
  // Delete Book
  // ==========================================================

  root.addEventListener(
    "click",
    async function (e) {

      const target =
        e.target.closest(
          "[data-delete-book]"
        );


      if (!target) return;


      const id =
        target.dataset.deleteBook;


      if (!id) return;


      const confirmed =
        confirm(
          "ลบหนังสือเล่มนี้และประวัติการอ่านทั้งหมด?"
        );


      if (!confirmed) return;


      try {

        await Books.remove(
          id,
          user.id
        );


        books =
          books.filter(
            b =>
              String(b.id) !==
              String(id)
          );


        refreshSelect();


        await updateQuick();


        BP.toast(
          "ลบหนังสือแล้ว",
          "success"
        );


      } catch (err) {

        console.error(
          "Delete book error:",
          err
        );

        BP.toast(
          err?.message ||
          "ลบหนังสือไม่สำเร็จ",
          "error"
        );

      }

    }
  );


  // ==========================================================
  // Book Select Change
  // ==========================================================

  select.addEventListener(
    "change",
    function () {
      updateQuick();
    }
  );


  // ==========================================================
  // Initial Render
  // ==========================================================

  refreshSelect();
}