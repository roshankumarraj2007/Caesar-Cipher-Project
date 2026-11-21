# Caesar Cipher Project Report

## Project objective

The objective is to build a simple, interactive learning project that demonstrates encryption and decryption with a Caesar Cipher and introduces beginner cybersecurity ideas. The project is designed for practice and presentation, not to protect sensitive information.

## Introduction to the Caesar Cipher

A Caesar Cipher is a classical substitution cipher. It replaces each English letter with another letter a fixed number of places away in the alphabet. The shift is the key. The alphabet wraps around at its end; for example, with a shift of 3, X becomes A.

The original readable message is called **plaintext**. The shifted output is called **ciphertext**. Encryption changes plaintext into ciphertext; decryption applies the reverse shift to recover the plaintext.

## Working methodology

1. The user selects Encrypt (`1`) or Decrypt (`2`), enters a message, and supplies a whole-number shift.
2. The frontend keeps the existing choice and shift validation messages. It sends the message and shift as JSON using `fetch()` to the matching API route.
3. The Node.js backend validates the JSON, message type and length, and whole-number shift. The shift is normalized to the range 0–25 with `BigInt`, preserving precision for very large positive and negative values.
4. The backend moves each uppercase or lowercase English letter through the alphabet. Other characters are left unchanged by the cipher function. The frontend input removes digits and shows its existing alert, while the backend independently rejects digit-containing API messages. Spaces and punctuation are allowed.
5. During decryption, the backend applies the reverse of the normalized shift.
6. The backend returns a JSON result. The frontend displays it in the existing result panel. The user can copy it or send it back through the opposite API operation using the reverse button.

For example, encrypting `HELLO` with a shift of 3 gives `KHOOR`; decrypting `KHOOR` with the same shift gives `HELLO`.

The cipher wheel visualizes the current shift. The user can change it by dragging the inner ring, selecting an outer letter, or using arrow keys. Its letter mapping is a visual preview calculated in the browser; message encryption and decryption are performed by the backend. The page also provides four saved themes, optional sound/vibration feedback, and a learning section with a Security Analysis.

## Technologies used

- **HTML**: page structure, form controls, cipher wheel container, and educational content.
- **CSS**: Wine & Gold, Emerald, Royal Purple, and Obsidian themes; layout, animations, responsive rules, and reduced-motion styling.
- **JavaScript**: frontend validation, API requests, result actions, saved preferences, audio/vibration feedback, and interactive SVG wheel.
- **Node.js**: local static-file server and cipher API, using only the built-in `http`, `fs`, and `path` modules.

The application has no external JavaScript framework or npm dependency. `package.json` provides the `npm start` command and specifies Node.js 18 or later.

## Features and limitations

### Features

- Encrypt and decrypt uppercase and lowercase English letters.
- Accept positive, negative, zero, and very large whole-number shifts.
- Preserve spaces and punctuation in the cipher calculation.
- Validate the operation choice and shift, then display readable input errors.
- Process encryption and decryption on the backend through separate JSON `POST` endpoints.
- Interact with the cipher wheel using drag, pointer selection, and keyboard input.
- Switch among four themes, copy results, reverse an operation, and optionally enable sound/vibration.
- Read introductory material, a worked example, and a warning that the cipher is for educational use only.
- Serve the active page from `http://localhost:3000` with a server bound to `127.0.0.1`.

### Limitations

- The Caesar Cipher is not secure for modern communication. It has only 25 non-zero shifts, preserves language patterns, and does not provide integrity or prove who sent a message.
- The cipher logic shifts only English A–Z letters. Accented letters and other symbols are unchanged. The current message input filters out digits, even though the cipher function itself leaves non-letter characters unchanged.
- Vibration and clipboard behavior depend on browser and device support. The copy action may show a manual-copy hint when the Clipboard API is unavailable.
- The local server is for this computer only. It serves a fixed allowlist of the page and assets and accepts bounded API request bodies; it is not a production hosting system.
- The API caps messages at 10,000 characters, shifts at 1,000 digits, and JSON request bodies at 64 KiB. These limits protect the small local service from unnecessarily large inputs.
- Messages are processed in memory and are not logged or saved by the server. The browser still stores the selected theme and feedback setting in local storage.
- `frontend/caesar_cipher_local.html` is an older standalone copy retained from earlier project work. `server.js` serves `frontend/index.html`, `frontend/style.css`, and `frontend/script.js` instead.

## Testing summary

Cipher and API validation functions were exercised with uppercase/lowercase examples, punctuation, spaces, zero/positive/negative/large shifts, invalid messages and shifts, and encrypt/decrypt round trips. A frontend simulation exercised fetch endpoint selection and response display, along with Run, Reverse, Copy, all four themes, wheel drag/tap/keyboard, and feedback toggling. JavaScript syntax, API routes, static file connections, and response formats were inspected.

Node.js and a real browser were not available in the checking environment, so the HTTP server and API could not be launched for end-to-end requests and the frontend could not be visually checked at actual viewport sizes. The stylesheet contains responsive breakpoints at 560px and 480px and a reduced-motion rule; these were inspected in code.

## Conclusion

This project demonstrates how a simple substitution cipher works and gives learners a visual way to experiment with shifts. A browser frontend communicates with a small Node.js backend for message transformation, while the server also serves the frontend files. It also shows why a small key space and preserved language patterns make classical ciphers unsuitable for modern protection. The project should be used as a learning aid only.

## References

- [NIST CSRC: Cryptography glossary](https://csrc.nist.gov/glossary/term/cryptography)
- [Tufts University: Introduction to cryptography lecture](https://www.cs.tufts.edu/comp/114/2025S/lectures/lec03-crypto.pdf)
