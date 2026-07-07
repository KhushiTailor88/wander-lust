const { spawn } = require("child_process");
const fs = require("fs");

const env = { ...process.env, NODE_ENV: "development" };
const child = spawn("node", ["index.js"], { env, cwd: "c:\\Users\\KHUSHI\\majorproject" });

const logStream = fs.createWriteStream("c:\\Users\\KHUSHI\\majorproject\\server.log", { flags: "w" });

child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

child.on("exit", (code) => {
  logStream.write(`\n--- SERVER EXITED WITH CODE ${code} ---\n`);
});

logStream.write("Server spawn initiated...\n");
