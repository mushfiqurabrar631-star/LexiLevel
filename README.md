# LexiLevel

ইংরেজি–বাংলা শব্দভান্ডার শেখার অ্যাপ (PWA)। কোনো build লাগে না — ফোল্ডারটি যেকোনো static hosting-এ রাখলেই চলে।

## ফাইল
| ফাইল | কাজ |
|---|---|
| `index.html` | পুরো অ্যাপ ও মূল শব্দভান্ডার |
| `packs/` | IELTS (AWL) ও Phrasal Verb প্যাক |
| `manifest.json`, `manifest.webmanifest` | অ্যাপের নাম, রং, আইকন (Install-এর জন্য) |
| `sw.js` | অফলাইন ক্যাশ ও রিমাইন্ডার নোটিফিকেশন |
| `icons/` | লোগো ও সব আইকন |
| `.nojekyll` | GitHub Pages-এর জন্য |
| `_headers` | Netlify-র জন্য (sw.js যেন পুরোনো না থাকে) |

## GitHub-এ রাখা
1. github.com → **New repository** → নাম দিন `lexilevel` → **Create**।
2. **Add file → Upload files** → zip খুলে ভেতরের সব ফাইল ও ফোল্ডার টেনে দিন → **Commit changes**।

## চালু করা (যেকোনো একটি)
**GitHub Pages:** Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**। ১–২ মিনিট পর লিংক পাবেন: `https://<username>.github.io/lexilevel/`

**Netlify:** app.netlify.com → **Add new site → Import an existing project → GitHub** → `lexilevel` বেছে নিন → Build command ফাঁকা, Publish directory `/` → **Deploy**।

## ফোনে ইনস্টল
Chrome-এ লিংকটি খুলুন → ⋮ মেনু → **Install app / Add to Home screen**।

## আপডেট দেওয়ার সময়
১. নতুন `index.html` আপলোড করুন।
২. `sw.js`-এর প্রথম লাইনের `CACHE='lexilevel-v2.3'` সংখ্যাটি বাড়ান (যেমন `v2.4`) — নইলে ফোনে পুরোনো সংস্করণ থেকে যেতে পারে।
