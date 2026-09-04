const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-backend\\src\\server.ts';
let content = fs.readFileSync(path);

// The file might be corrupted because it was appended with UTF-16LE.
// UTF-16LE characters will have null bytes if they are basic ASCII.
// Let's just read it as a buffer, and convert any null bytes to spaces, or better, 
// just strip the last few bytes that we appended.
// Actually, let's just strip everything after `);`

let text = content.toString('utf8');
// 'utf8' reading of UTF-16 might produce replacement characters (\ufffd) or null bytes (\u0000).
// Let's find `);` which is at the end of the file.
const lastIndex = text.lastIndexOf(');');
if (lastIndex !== -1) {
    text = text.substring(0, lastIndex + 2) + '\n';
    fs.writeFileSync(path, text, 'utf8');
    console.log("Fixed server.ts");
} else {
    console.log("Could not find );");
}
