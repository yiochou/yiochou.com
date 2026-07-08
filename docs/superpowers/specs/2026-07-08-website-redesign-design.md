# yiochou.com 重新設計 — 設計文件

日期:2026-07-08
狀態:已與 Yio 逐項確認(風格與字型經瀏覽器 mockup 比較定案)

## 1. 目標與定位

從「單頁名片卡」升級為**長期經營的個人品牌內容站**:以寫作為主角,兼作個人入口。

- 讀者:中文與英文讀者皆有;介面文字用英文,文章中英混合(每篇擇一語言書寫)
- 成功標準:發佈一篇文章的成本趨近於「寫完 Markdown、git push」;頁面極快、SEO 建置時自動完成

## 2. 資訊架構

| 路徑 | 內容 |
|---|---|
| `/` | 名字 + 兩行自介 + Writing 文章列表(依日期新到舊) |
| `/blog/<slug>` | 文章內文頁 |
| `/now` | 近況:正在做/學的東西,隨性更新(本身是一篇可編輯的 Markdown) |
| `/about` | 簡短自介 + 對外連結 |
| `/404` | 自訂 404 頁 |

- 對外連結(About 頁 + 全站頁尾):GitHub、LinkedIn、CV(resume.yiochou.com/index.pdf)、Email(hi@yiochou.com)
- Instagram(https://www.instagram.com/yio.chou/)——2026-07-08 追加保留

## 3. 視覺設計(已定案)

**方向:極簡文字風 → 襯線書卷 × 粉綠明快點綴(「明快版」)**

### 色彩

- 底色:米白 `#fffdf8`
- 文字:墨色 `#292524`;次要文字 `#78716c`;淡出文字 `#a8a29e`
- 點綴:粉 `#ffcfdf` × 湖水綠 `#b0f3f1`(延續舊站漸層的記憶點)
  - 名字「Yio」帶粉→綠漸層底色高亮
  - 名字後的句點用桃紅 `#e0679a`
  - 導覽目前頁:粉色底線
  - 區塊小標(如 WRITING):湖水綠 pill(深綠字 `#134e4a`)
  - 新文章標記:粉色 pill(`new`,深粉字 `#9d2c5a`)
  - 連結 hover:粉/綠底線

### 字型

- 內文與標題(襯線):**EB Garamond**(西文)+ **霞鶩文楷 LXGW WenKai TC**(中文)
- UI 文字(導覽、日期、小標):**Inter** + **Noto Sans TC**
- 程式碼:等寬字型(JetBrains Mono 或系統等寬 fallback)
- 載入策略:**self-host**(Fontsource 套件,含中文子集化 unicode-range 切片)、`font-display: swap`、preload 關鍵字重;不使用 Google Fonts CDN,維持除 Analytics 外零第三方資源

### 版面

- 單欄置中,內文寬約 65ch;大量留白
- 手機優先響應式;無深色模式(第一版)
- 全站零 client-side JS(Analytics script 除外)

## 4. 技術架構

- **框架:Astro**(定案理由:自刻版面用的就是 HTML/CSS、SEO 套件官方齊全、零 JS 輸出、Cloudflare Pages 一鍵部署)
- 文章:`src/content/blog/*.md`,Content Collections schema 驗證:
  - `title: string`、`description: string`、`pubDate: date`、`lang: 'zh-tw' | 'en'`、`updatedDate?: date`、`draft?: boolean`
- 共用 Layout 一個:header(名字 + Blog/Now/About 導覽)、footer(社群連結)、全部 meta tags
- `lang` 欄位同時用於 `<html lang>` 與 hreflang 標記
- 現有 repo **原地改造**成 Astro 專案:舊手寫 `dist/` 由建置產物取代,`_headers`、`_redirects` 既有行為保留(移入 `public/`)
- 部署:沿用 Cloudflare Pages,git push 自動建置(build command `npm run build`,output `dist`)

## 5. SEO 自動化(建置時完成,發文零手動)

- `@astrojs/sitemap` → `sitemap.xml`
- `@astrojs/rss` → `/rss.xml`(全文章)
- 每頁 `title` / `description` / canonical / Open Graph / Twitter card,由 Layout 統一產生(文章頁取自 frontmatter)
- 文章頁附 JSON-LD(`BlogPosting` 結構化資料)
- **OG 分享圖:satori + sharp 建置時逐篇自動生成**(網站同款襯線 + 粉綠風格,含文章標題)
- `robots.txt`(指向 sitemap)
- 圖片:Astro 內建 `<Image>` 最佳化(lazy loading、寬高防 CLS)

## 6. 分析

- **Cloudflare Web Analytics**:無 cookie、不追蹤個人,一行 script(唯一的第三方資源)

## 7. 明確不做(第一版)

深色模式、留言系統、標籤/分類、站內搜尋、多語言介面切換。文章量少時這些都是負擔,之後有需要再加。

## 8. 測試與驗收

- `npm run build` 成功且零警告;frontmatter 缺欄位時建置必須失敗(schema 驗證生效)
- 驗收頁面:`/`、一篇中文文章、一篇英文文章、`/now`、`/about`、`/404`
- 檢查:sitemap.xml 與 rss.xml 內容正確、每篇文章 OG 圖生成、Lighthouse(Performance / SEO / a11y)分數 95+
- 手機(375px)與桌面(1280px)版面皆正常

## 9. 修訂:單頁化(2026-07-08,與 Yio 經 mockup 確認)

- **資訊架構改為單頁**:`/` 一頁含三區塊 `● Words`(文章列表)/ `● Now` / `● Elsewhere`(對外連結);導覽列移除;`/blog`、`/now`、`/about` 301 轉回首頁對應錨點;文章頁 `/blog/<slug>` 保留(header 只剩站名、無導覽)
- **首頁標題**:不用 "Hi, I'm Yio";大標 `Yio Chou` 全素,後接粉綠漸層「呼吸游標」方塊(3.4s 緩慢明滅,全站唯一動態,respects prefers-reduced-motion)——取代原「Yio 帶漸層底色」設計
- **區塊小標**:8px 粉綠漸層圓點 + Garamond 斜體(取代湖水綠 pill)
- **About 頁裁撤**:自介縮為 tagline 本身;`src/content/pages/about.md` 移除
- 基調:低調、精簡、帶點酷
