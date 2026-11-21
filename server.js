// A small local web server using only Node.js built-in modules.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = 3000;
const FRONTEND_FOLDER = path.join(__dirname, "frontend");
const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_SHIFT_DIGITS = 1000;

// Only these files can be requested from the server.
const files = {
  "/": { name: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { name: "index.html", type: "text/html; charset=utf-8" },
  "/style.css": { name: "style.css", type: "text/css; charset=utf-8" },
  "/script.js": { name: "script.js", type: "text/javascript; charset=utf-8" },
};

const apiRoutes = {
  "/api/encrypt": "encrypt",
  "/api/decrypt": "decrypt",
};

function sendJson(response, status, data) {
  const body = Buffer.from(JSON.stringify(data), "utf8");
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
}

function normalizeShift(shiftText) {
  const value = BigInt(shiftText);
  return Number((value % 26n + 26n) % 26n);
}

function caesar(text, shift) {
  let result = "";
  for (const character of text) {
    if (character >= "A" && character <= "Z") {
      result += String.fromCharCode((character.charCodeAt(0) - 65 + shift) % 26 + 65);
    } else if (character >= "a" && character <= "z") {
      result += String.fromCharCode((character.charCodeAt(0) - 97 + shift) % 26 + 97);
    } else {
      result += character;
    }
  }
  return result;
}

function validatePayload(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: "Request body must be a JSON object." };
  }

  if (typeof payload.message !== "string") {
    return { error: "Message must be text." };
  }
  if (payload.message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message is too long (maximum ${MAX_MESSAGE_LENGTH} characters).` };
  }
  if (/\p{Nd}/u.test(payload.message)) {
    return { error: "Only alphabets are allowed in the message. Numbers are not accepted." };
  }

  let shiftText;
  if (typeof payload.shift === "string") {
    shiftText = payload.shift.trim();
  } else if (typeof payload.shift === "number" && Number.isSafeInteger(payload.shift)) {
    // Accept a regular JSON integer too; strings preserve precision for huge values.
    shiftText = String(payload.shift);
  } else {
    return { error: "Invalid shift. Enter a whole number, such as 3 or -3." };
  }

  if (!/^[+-]?\d+$/.test(shiftText)) {
    return { error: "Invalid shift. Enter a whole number, such as 3 or -3." };
  }
  if (shiftText.replace(/^[+-]/, "").length > MAX_SHIFT_DIGITS) {
    return { error: `Shift is too long (maximum ${MAX_SHIFT_DIGITS} digits).` };
  }

  return { message: payload.message, shiftText };
}

function readJsonBody(request, response, onBody) {
  let size = 0;
  let tooLarge = false;
  const chunks = [];

  request.on("data", (chunk) => {
    if (tooLarge) return;
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      tooLarge = true;
      chunks.length = 0;
      return;
    }
    chunks.push(chunk);
  });

  request.on("end", () => {
    if (tooLarge) {
      sendJson(response, 413, { success: false, error: "Request body is too large." });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch (error) {
      sendJson(response, 400, { success: false, error: "Request body must contain valid JSON." });
      return;
    }
    onBody(payload);
  });

  request.on("error", () => {
    if (!response.headersSent && !response.destroyed) {
      sendJson(response, 400, { success: false, error: "Unable to read the request body." });
    }
  });
}

function handleApi(request, response, operation) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { success: false, error: "Use POST for this API endpoint." });
    return;
  }

  const contentType = (request.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    sendJson(response, 415, { success: false, error: "Send the request as application/json." });
    return;
  }

  readJsonBody(request, response, (payload) => {
    const validated = validatePayload(payload);
    if (validated.error) {
      sendJson(response, 400, { success: false, error: validated.error });
      return;
    }

    let shift = normalizeShift(validated.shiftText);
    if (operation === "decrypt") shift = (26 - shift) % 26;

    const result = caesar(validated.message, shift);
    sendJson(response, 200, { success: true, result });
  });
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  } catch (error) {
    sendJson(response, 400, { success: false, error: "Invalid request path." });
    return;
  }

  if (apiRoutes[pathname]) {
    handleApi(request, response, apiRoutes[pathname]);
    return;
  }
  if (pathname.startsWith("/api/")) {
    sendJson(response, 404, { success: false, error: "API endpoint not found." });
    return;
  }

  // The existing allowlisted static-file server behavior remains in place.
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const file = files[pathname];
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
    response.end("File not found");
    return;
  }

  const filePath = path.join(FRONTEND_FOLDER, file.name);
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      const status = error.code === "ENOENT" ? 404 : 500;
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
      response.end(status === 404 ? "File not found" : "Unable to read the requested file");
      return;
    }

    response.writeHead(200, {
      "Content-Type": file.type,
      "Content-Length": contents.length,
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other server or choose another port.`);
  } else {
    console.error("The local server could not start.", error.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`Caesar Cipher is available at http://${HOST}:${PORT}`);
  console.log("Press Ctrl+C to stop the server.");
});
