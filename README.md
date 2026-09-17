# BookPick

Web Application สำหรับติดตามการอ่านหนังสือและแนะนำหนังสือ
ใช้ HTML5 + CSS3 + JavaScript ES6+ + Supabase JS v2 ผ่าน CDN

## โครงสร้าง
- index.html
- login.html
- register.html
- dashboard.html
- reading.html
- recommendations.html
- css/
- js/
- sql/supabase-schema.sql
- assets/images/books/
- assets/images/logo/

## ติดตั้งกับ Supabase
1. สร้าง Supabase Project
2. เปิด SQL Editor
3. รัน `sql/supabase-schema.sql`
4. ไปที่ Project Settings > API
5. คัดลอก Project URL และ Publishable/Anon key
6. เปิด `js/config.js`
7. ใส่ค่า:
   SUPABASE_URL
   SUPABASE_ANON_KEY
8. ห้ามใช้ service_role key ใน Frontend
9. เปิด `index.html` ผ่าน OneCompiler หรือ Static Hosting

## Email confirmation
ถ้า Supabase เปิด Confirm email อยู่ หลังสมัครจะต้องยืนยันอีเมลก่อน Login
ถ้าปิด Confirm email สำหรับการทดสอบ บัญชีใหม่จะ Login ได้ทันที

## OneCompiler
อัปโหลดโครงสร้างโฟลเดอร์ให้เหมือนโปรเจกต์นี้ และตรวจสอบว่า script ใน HTML ใช้ path:
`js/config.js`, `js/supabase.js`, ฯลฯ

## Dynamic Target
(จำนวนหน้าทั้งหมด - หน้าล่าสุด) ÷ จำนวนวันที่เหลือ

หากไม่ได้อ่านหลายวัน ระบบจะใช้วันที่เหลือจริง ณ วันที่เปิดระบบมาคำนวณใหม่

## Completion Forecast
คำนวณจากความเร็วเฉลี่ยจริง:
จำนวนหน้าที่อ่านสะสม ÷ จำนวนวันที่มีการอ่าน
แล้วนำหน้าที่เหลือไปหารด้วยค่าเฉลี่ยดังกล่าว

## ความปลอดภัย
Frontend ใช้เฉพาะ Publishable/Anon key
ข้อมูลส่วนตัวถูกจำกัดด้วย Supabase Row Level Security (RLS)
ห้ามนำ service_role key มาใส่ใน JavaScript ฝั่ง Client
