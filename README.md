# Caesar Cipher Learning Project

## Introduction

This is a small, beginner-friendly web project for learning how a Caesar Cipher shifts letters. It can encrypt and decrypt text, shows the shift on an interactive cipher wheel, and includes a short cybersecurity lesson. It is intended for education only. A Caesar Cipher is not safe for protecting real messages.

## Features

- Encrypt with choice `1` and decrypt with choice `2`.
- Send encryption and decryption requests to separate local Node.js API endpoints.
- Keep uppercase and lowercase letters in their original case.
- Support positive, negative, zero, and very large whole-number shifts. Shifts are reduced to the range 0–25.
- Preserve spaces and punctuation. The message field removes digits and displays an alert; other non-letter characters pass through the cipher unchanged.
- Use the wheel by dragging its inner ring, clicking an outer letter, or pressing the arrow keys while the wheel is focused.
- Switch among Wine & Gold, Emerald, Royal Purple, and Obsidian themes. The selected theme is saved in the browser.
- Copy a result or run it through the opposite operation with the reverse button.
- Optionally enable sound and vibration feedback. Availability depends on the browser and device.
- Read the learning section and Security Analysis below the cipher.
- Run from a local Node.js server bound to `127.0.0.1`.

There is no brute-force tool and no external package dependency.

## Project files

```text
D:\Caeser cipher\
├── server.js
├── package.json
├── README.md
├── PROJECT_REPORT.md
├── VIVA_QUESTIONS.md
└── frontend\
    ├── index.html
    ├── style.css
    ├── script.js
    └── caesar_cipher_local.html  (older standalone copy; not served by server.js)
```

The active page is `frontend/index.html`. Its CSS and JavaScript are in `frontend/style.css` and `frontend/script.js`. The older `caesar_cipher_local.html` file is retained, but the Node server does not serve it.

## Technologies used

- **HTML** provides the page content and controls.
- **CSS** provides the existing themes, responsive layout, and animation.
- **Vanilla JavaScript** (JavaScript without a framework) manages the interface and sends cipher requests with `fetch()`. It uses browser features such as local storage, the Clipboard API, Web Audio, vibration, pointer events, and SVG.
- **Node.js built-in modules** (`http`, `fs`, and `path`) serve the frontend and perform encryption and decryption through HTTP APIs. No npm packages are required. Node.js 18 or later is specified in `package.json`.

## Run locally

1. Install Node.js 18 or later if it is not already installed.
2. Open PowerShell and run:

   ```powershell
   Set-Location "D:\Caeser cipher"
   node --version
   npm start
   ```

3. Open <http://localhost:3000> in your browser.
4. To stop the server, return to PowerShell and press **Ctrl+C**.

No `npm install` command is needed because this project has no external dependencies. The server binds to `127.0.0.1`, so it is intended to be reached from this computer, not from the public internet.

## Backend API

The active page sends requests to the same local server that serves its files:

| Method and path | Operation |
| --- | --- |
| `POST /api/encrypt` | Encrypt the message |
| `POST /api/decrypt` | Decrypt the message |

Both endpoints expect JSON with a text `message` and a whole-number `shift`. The frontend sends the shift as a string so very large values keep their exact digits. A regular safe integer sent as a JSON number is also accepted. For example:

```json
{"message":"Hello, World!","shift":"3"}
```

A successful response contains `success: true` and the transformed `result`. An invalid request returns `success: false` with a readable `error`. The server accepts messages up to 10,000 characters, shifts with up to 1,000 digits, and request bodies up to 64 KiB. Submitted messages are processed in memory for the request; they are not logged or saved by the server.

## How encryption and decryption work

The browser sends the message and shift to the Node.js API. The backend treats A as position 0, B as 1, and so on through Z at position 25. For encryption, it adds the shift to each letter's position and wraps around the alphabet when needed. For decryption, it applies the reverse shift. Uppercase letters stay uppercase and lowercase letters stay lowercase. Spaces and punctuation are copied without shifting. The browser-side wheel updates its visual letter mapping locally; it does not encrypt or decrypt the submitted message.

For example, with a shift of 3:

```text
Plaintext:  HELLO
Ciphertext: KHOOR
```

Decryption moves each ciphertext letter back by 3 and returns `HELLO`. Large and negative whole-number shifts are normalized with JavaScript `BigInt`, so a shift such as 29 has the same letter effect as a shift of 3.

## Security note

The Caesar Cipher has only 25 non-zero shifts, and it preserves recognizable language patterns. It can be guessed or analyzed easily and does not protect message integrity or sender identity. Use it to study basic encryption concepts, never to protect passwords, personal information, or real communications.
