# Caesar Cipher Project: Viva Questions and Answers

## HTML, CSS, and JavaScript

1. **What is HTML?**  
   HTML describes the structure and content of a web page.

2. **What is CSS?**  
   CSS controls how a web page looks, including its colors, spacing, and layout.

3. **What is JavaScript used for in this project?**  
   It performs the cipher, checks inputs, updates the wheel, and handles buttons and themes.

4. **What is the purpose of `index.html`?**  
   It contains the active page structure and connects the CSS and JavaScript files.

5. **Why is the CSS in a separate file?**  
   Keeping it in `style.css` separates appearance from page content and makes styles easier to find.

6. **Why is the JavaScript in a separate file?**  
   Keeping it in `script.js` separates behavior from page content and makes the code easier to maintain.

7. **What is the difference between an HTML `id` and a `class`?**  
   An `id` identifies one page element; a `class` can be shared by many elements.

8. **What does responsive design mean?**  
   It means the layout adjusts to fit different screen sizes.

9. **What is a CSS media query?**  
   It applies styles only when a condition is met, such as a screen being narrower than a set width.

10. **What does `localStorage` do in this project?**  
    It remembers the selected theme and sound/vibration setting in the browser.

## Caesar Cipher and encryption

11. **What is a Caesar Cipher?**  
    It is a classical cipher that replaces each letter with another letter a fixed number of places away.

12. **What is plaintext?**  
    Plaintext is the original readable message before encryption.

13. **What is ciphertext?**  
    Ciphertext is the transformed message produced by encryption.

14. **What is encryption?**  
    Encryption changes readable information into a protected or encoded form.

15. **What is decryption?**  
    Decryption reverses encryption to recover the original message.

16. **What is the shift key in this project?**  
    It is the whole number that tells the cipher how many positions to move each letter.

17. **What does a shift of 3 do to A?**  
    It changes A to D.

18. **What does `HELLO` become with a shift of 3?**  
    It becomes `KHOOR`.

19. **How does the project decrypt a message encrypted with a shift of 3?**  
    It moves each letter backward by 3 positions.

20. **Why does the alphabet wrap around?**  
    Wrapping lets letters near Z continue from A when shifted forward.

21. **Does the cipher change uppercase and lowercase letters into the same case?**  
    No. It keeps uppercase letters uppercase and lowercase letters lowercase.

22. **What happens to spaces and punctuation?**  
    The cipher leaves them unchanged. The message input also leaves spaces and punctuation available.

23. **How does the project handle a negative shift?**  
    It reduces the shift into the 0–25 range, then applies the selected operation.

24. **What is the difference between classical and modern encryption?**  
    Classical ciphers use simpler rules and small key choices. Modern encryption uses carefully designed algorithms and much larger key spaces.

## Cybersecurity and the project server

25. **Is the Caesar Cipher safe for passwords or private messages?**  
    No. It is for education only and must not be used to protect real information.

26. **Why is the Caesar Cipher weak?**  
    It has only 25 useful shifts, and recognizable letter patterns remain in the message.

27. **What is confidentiality?**  
    Confidentiality means information is kept from people who are not allowed to see it.

28. **What is data integrity?**  
    Integrity means data has not been changed without permission or detection.

29. **What is authentication?**  
    Authentication checks that a user, device, or message is who or what it claims to be.

30. **What is Node.js used for here?**  
    Node.js runs `server.js`, which serves the project files and performs encryption or decryption when the frontend calls the API.

31. **What does `localhost` mean?**  
    It refers to the same computer that is running the browser or server.

32. **Why does this server bind to `127.0.0.1`?**  
    That address limits the server to local connections on this computer.

33. **Does this project need `npm install`?**  
    No. It uses Node.js built-in modules and has no external package dependencies.

34. **How do you start and stop the local server?**  
    Run `npm start` in the project folder. Press Ctrl+C in that PowerShell window to stop it.

35. **What is an API endpoint?**  
    It is a URL on a server that accepts a request for a particular operation.

36. **Which API endpoint encrypts a message?**  
    `POST /api/encrypt` accepts a JSON message and shift and returns the encrypted result as JSON.

37. **Which API endpoint decrypts a message?**  
    `POST /api/decrypt` accepts a JSON message and shift and returns the decrypted result as JSON.

38. **Why does the frontend use `fetch()`?**  
    `fetch()` sends the message and shift to the backend without reloading the page.

39. **What is JSON?**  
    JSON is a text format for sending structured data, such as a message and shift, between programs.

40. **Does the server save submitted messages?**  
    No. It processes each request in memory and does not log or store its message.

41. **Why is the shift sent as a string?**  
    A string keeps every digit of a very large shift exact when JSON is sent.
