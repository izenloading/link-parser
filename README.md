
[![Click here to test the tool](img/banner.png)](https://iroblivionspark.github.io/link-parser/index.html)
<div align="center">
  <h1 align="center">Link Parser To JSON</h1>
  <p align="center">A fast, online developer tool to parse V2Ray/Xray and sing-box protocol links (VMess, VLESS, Trojan, Shadowsocks, Hysteria2, TUIC) into structured JSON configuration.</p>
  
  <p align="center">
    <a href="https://github.com/iroblivionspark/link-parser/stargazers" target="_blank">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/iroblivionspark/link-parser?style=flat-square&color=FE7D37" />
    </a>
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
    <img alt="Technologies" src="https://img.shields.io/badge/Tech-React%20%7C%20Vite%20%7C%20TS-blueviolet?style=flat-square" />
  </p>
</div>

---

## 📖 Overview

**Link Parser To JSON** is a dedicated web utility for decoding proxy share links into structured, ready-to-use JSON configuration. Instead of manually parsing V2Ray-style URIs, paste a link and instantly get either a single outbound object or a full client config — targeting either the **V2Ray/Xray** core family or **sing-box**.

This tool is invaluable for system administrators, developers, and power users who need to quickly inspect, modify, or integrate proxy link parameters without hand-decoding base64 or query strings.

## ✨ Key Features

* **Two output families, selectable in the UI:**
    * **V2Ray** — generates Xray-core-style JSON (`outbounds`/`streamSettings`). A second-level **kernel** switch lets you target either:
        * **Xray** — full feature set, including VLESS, REALITY, XTLS flow (`xtls-rprx-vision`) and xHTTP transport.
        * **V2Ray** — restricted to what standard V2Ray-core actually supports; links using REALITY/XTLS/xHTTP are rejected with a clear error instead of silently producing a config that won't run.
    * **sing-box** — generates sing-box **1.14.1** outbound/config JSON (`type`/`server`/`server_port`, `tls`, `transport`, route rules with `hijack-dns`, etc.).
* **Broad protocol support:**
    * **VMess, VLESS, Trojan, Shadowsocks (SS)** — parsed for both V2Ray and sing-box output.
    * **Hysteria2** (`hysteria2://`, `hy2://`) and **TUIC** (`tuic://`) — sing-box only, since Xray/V2Ray-core don't implement these protocols.
* **Two detail levels:**
    * **Outbound** — just the single parsed outbound/proxy object.
    * **Config** — a complete client config: `log`, `dns`, `inbounds`, `outbounds` (proxy + direct + block), and routing/rules.
* **Advanced config options** (Config mode): custom DNS servers, Fragment (Xray kernel only), and Mux/Multiplex (concurrency; XUDP concurrency is Xray-only).
* **Web-based & instant:** no installation or account required, runs entirely in the browser.
* **Clean JSON output:** one-click Copy and Download (`.json`) of the generated result.
* **Multilingual UI:** English (EN) and Persian (FA), with RTL support.

## 🚀 Technologies Used

This project is built using modern front-end technologies to ensure speed and maintainability:

* **Frontend Library:** [React](https://react.dev/) (`^19.2.1`)
* **Build Tool:** [Vite](https://vitejs.dev/) (`^6.2.0`)
* **Language:** [TypeScript](https://www.typescriptlang.org/) (`~5.8.2`)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN in `index.html`)
* **Icons:** [@heroicons/react](https://heroicons.com/)

## 💻 Local Setup and Installation

Follow these steps to set up the project environment locally.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/iroblivionspark/link-parser.git
    cd link-parser
    ```

2.  **Install Dependencies:**
    Install the required packages defined in `package.json`:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run in Development Mode:**
    Start the development server using Vite:
    ```bash
    npm run dev
    ```
    The app is served under the `/link-parser/` base path, e.g. `http://localhost:3000/link-parser/` (Vite picks the next free port, like `3001`, if `3000` is taken — check the terminal output for the exact URL).

### Production Build

To create optimized static files for deployment, use the build script:

```bash
npm run build
```

The optimized files will be generated in the `dist` directory. `npm run preview` serves that build locally for a final check.

## 💡 How to Use

1. Paste a proxy link into the text area — `vmess://...`, `vless://...`, `trojan://...`, `ss://...`, and (sing-box format only) `hysteria2://...`/`tuic://...`.
2. Pick the output format: **V2Ray** or **sing-box**.
   - Under **V2Ray**, also pick the kernel: **Xray** (full support) or **V2Ray** (standard-core-compatible only).
3. Pick the detail level: **Outbound** (single object) or **Config** (full client config), and adjust DNS/Fragment/Mux options if using Config mode.
4. Click **Convert**. The structured JSON output appears in the right panel.
5. Use the **Copy** or **Download** buttons in the output panel to grab the result.

## 🤝 Contribution

We welcome contributions! If you have suggestions for new features, improvements, or bug fixes, please feel free to:

- Open an Issue to discuss potential changes.
- Submit a Pull Request with your proposed code changes.

## 📄 License

This project is licensed under the MIT License.
