# ShiftUp — AI Automation Consulting

เว็บไซต์หนึ่งหน้าสำหรับธุรกิจ B2B สร้างด้วย HTML, CSS และ JavaScript ล้วน ไม่ต้อง build ไม่มี dependency และพร้อม deploy บน static hosting

## ลิงก์ออนไลน์

**Live preview:** https://palmweerakorn2005-dotcom.github.io/shiftup-preview/

โฮสต์บน GitHub Pages จาก repo `palmweerakorn2005-dotcom/shiftup-preview`

## Positioning & delivery model

ShiftUp เป็น **bottleneck-first AI automation consultancy** สำหรับธุรกิจ B2B

- หา **bottleneck** หรือคอขวดที่กินเวลาและขึ้นกับคนก่อน
- ออกแบบและสร้าง automation เฉพาะจุดนั้น
- deploy ระบบ production บน **Modal.com**
- มี **aftercare** ดูแลหลังส่งมอบ

บริการหลักบนเว็บ: Bottleneck Audit → AI Automation Build → Modal.com Deployment → Aftercare & Enablement

## เปิดดูในเครื่อง

ฟอนต์ถูก self-host และโหลดผ่าน HTTP จึงควรเปิดผ่าน local server ไม่ใช่ double-click `index.html`

**Windows:** ดับเบิลคลิก `serve.cmd` แล้วเปิด http://127.0.0.1:4173/

**macOS / Linux:**
```bash
cd shiftup
python3 -m http.server 4173
```
แล้วเปิด http://127.0.0.1:4173/

## โครงไฟล์

```
shiftup/
├── index.html              # เนื้อหาทั้งหมด + SEO / structured data
├── assets/
│   ├── site.css            # design system, layout, responsive styles
│   ├── site.js             # nav, tabs, FAQ, calculator, form
│   ├── fonts.css           # @font-face declarations
│   ├── fonts/              # self-hosted woff2 + licenses
│   ├── favicon.svg
│   └── og-image.png        # 1200×630 สำหรับ social sharing
├── robots.txt
├── sitemap.xml
├── serve.cmd               # local preview สำหรับ Windows
└── README.md
```

## ก่อนเปิดใช้งานจริง — checklist

### 1. เปลี่ยนโดเมน
ตอนนี้ canonical/OG/sitemap ชี้ไปที่ `https://palmweerakorn2005-dotcom.github.io/shiftup-preview/` ซึ่งเป็น live preview บน GitHub Pages
หากจะย้ายไปโดเมนจริง เช่น `shiftup.co.th` ให้แทนที่ URL นี้ใน:
- `index.html` → canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD
- `robots.txt` → sitemap URL
- `sitemap.xml` → loc

จากนั้นอัปเดต `lastmod` ใน `sitemap.xml`

### 2. ข้อมูลติดต่อ
อีเมล `hello@shiftup.co.th` และ LINE `@shiftup` เป็น placeholder
- แทนที่อีเมลใน `index.html` (hero contact, footer, privacy dialog) และ `assets/site.js` → `CONFIG.contactEmail`
- ใส่ URL ของ LINE OA ใน `assets/site.js` → `CONFIG.lineUrl` เช่น `https://lin.ee/xxxx`
- ถ้าไม่ใส่ `lineUrl` ปุ่ม LINE จะทำหน้าที่คัดลอก LINE ID แทน

### 3. เชื่อมฟอร์มกับ backend
ตัวเลือกในฟอร์มสะท้อนบริการปัจจุบัน: Bottleneck Audit, AI Automation Build, Modal.com Deployment และ Aftercare & Enablement
ค่าเริ่มต้นฟอร์มจะเปิดแอปอีเมลของผู้ใช้พร้อมข้อความที่กรอกไว้ (ไม่มีการเก็บข้อมูลบนเว็บ) ซึ่งทำงานได้ทันทีแต่อาจไม่เหมาะกับ conversion ในระยะยาว

หากต้องการให้ส่งจากหน้าเว็บโดยตรง ให้ใส่ endpoint ใน `assets/site.js`:
```js
contactEndpoint: "https://your-api.example.com/contact"
```
Endpoint ต้องรองรับ `POST` แบบ JSON:
```json
{ "name": "...", "company": "...", "email": "...", "line": "...", "topic": "...", "message": "..." }
```
และตอบกลับด้วย HTTP 2xx พร้อมเปิด CORS สำหรับโดเมนเว็บไซต์ แนะนำ Formspree, Basin, Cloudflare Worker หรือ API ภายในองค์กร

### 4. ตัวเลขและเคส
Use case ทั้ง 3 เคสเป็น **ตัวอย่างขอบเขตงานและเป้าหมายผลลัพธ์** ไม่ใช่ผลงานที่อ้างอิงลูกค้าจริง และมีป้าย `ILLUSTRATIVE` กับข้อความ disclaimer อยู่ในหน้าเว็บแล้ว ก่อน launch ควร:
- แทนที่ด้วยเคสและตัวเลขที่ตรวจสอบได้ หรือ
- คงสถานะเป็น illustrative ตามเดิม

ส่วนคำสัญญาด้านเวลา เช่น “ระบบแรกใน 3–6 สัปดาห์” และกรอบ aftercare 30–90 วัน ควรปรับให้ตรงกับ delivery model จริง

บริการ deploy ระบุว่าใช้ Modal.com เป็นแพลตฟอร์มหลัก หากทีมต้องการเปลี่ยนผู้ให้บริการ hosting หรือมีข้อจำกัดด้าน compliance ควรแก้ข้อความใน `index.html` ส่วนบริการ กระบวนการ และ FAQ ให้สอดคล้องกัน

### 5. Legal / PDPA
ตรวจ Privacy Notice ให้ตรงกับวิธีเก็บข้อมูลจริงหลังเชื่อม backend และเพิ่มชื่อนิติบุคคล ที่อยู่ และช่องทางใช้สิทธิ์ตามที่กฎหมายกำหนด หากมี analytics หรือ cookie ต้องอัปเดต notice และเพิ่ม consent ตามความเหมาะสม

### 6. Analytics (ถ้าต้องการ)
ยังไม่มี tracking script ในเว็บ หากเพิ่ม Google Analytics / Plausible / Meta Pixel ควรวางก่อน `</head>` หรือก่อน `</body>` ตามผู้ให้บริการ และอัปเดต Privacy Notice

## Design system

แก้ไขสีและ typography ได้ที่ `:root` ใน `assets/site.css`:

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#0c0f0b` | ตัวอักษรและพื้นหลังเข้ม |
| `--paper` | `#f2f0e8` | พื้นหลังหลัก |
| `--lime` | `#d7ff3f` | accent, CTA, highlight |
| `--muted` | `#5f645a` | ข้อความรอง |
| `--font-sans` | Anuphan | ภาษาไทย |
| `--font-display` | Space Grotesk | ตัวเลข / English display |
| `--font-mono` | IBM Plex Mono | labels / metadata |

Breakpoints หลัก: `1180px`, `1040px`, `760px`, `480px`, `390px`

## Accessibility / performance notes

- มี skip link, focus states, ARIA สำหรับ tabs/accordion/menu/dialog
- รองรับ `prefers-reduced-motion`
- ฟอนต์โหลดเอง ไม่พึ่ง CDN
- ไม่มีรูปภาพ bitmap ในหน้าเว็บ ยกเว้น OG image (หน้าเว็บใช้ CSS/SVG)
- ควรสแกนซ้ำด้วย axe DevTools และทดสอบฟอร์มกับ backend จริงก่อน launch

## Deploy

ไม่ต้อง build — อัปโหลดทั้งโฟลเดอร์นี้ขึ้น static host ได้เลย

- **Netlify / Vercel / Cloudflare Pages:** ตั้ง publish directory เป็นโฟลเดอร์นี้ และไม่ต้องใส่ build command
- **Traditional hosting:** อัปโหลด `index.html`, `assets/`, `robots.txt`, `sitemap.xml`

หลัง deploy ให้ตรวจ:
1. ฟอนต์โหลดครบ (Network tab)
2. OG image แสดงผลผ่าน social debugger
3. ฟอร์มส่งถึงปลายทางจริง
4. Lighthouse mobile score และคอนทราสต์

## Fonts

- Anuphan — Cadson Demak
- Space Grotesk — Florian Karsten
- Instrument Serif — Instrument
- IBM Plex Mono — IBM

ทุกตัวอยู่ภายใต้ SIL Open Font License 1.1 ดูไฟล์ license ใน `assets/fonts/licenses/`
