import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import repl from "repl";
import { spawn } from "child_process";
import bodyParser from "body-parser";

const scratch = {}; // used for shell interaction

const isLocal = process.argv[2] === "l";
let __dirname = isLocal ? path.dirname(new URL(import.meta.url).pathname) : "/app";

// res.redirect("/new-thing")

if(__dirname[0] == '/' && isLocal) {
    __dirname = __dirname.slice(1);
}

console.log("Starting up at: ", __dirname);

const HTTP_STATUS = {
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    INTERNAL_SERVICE_ERROR: 500,
    NOT_IMPLEMENTED: 501,
};

let app = express();

app.use(express.urlencoded({
    extended: true
}));

const clientDir = __dirname + "/public";
app.get("/:type/:file", function (req, res) {
    let { type, file } = req.params;
    res.sendFile(__dirname + "/public/images/" + type + "/" + file);
});

const readBodyData = async function (req, res, next) {
    let body = "";
    req.on("data", (data) => {
        body += data;
    });
    req.on("end", () => {
        next(body, req, res, next);
    });
};

app.get("/gatr", async function (req, res, next) {
    let i = Math.random() < 0.5 ? 1 : 2;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        url: "https://more-random-animals.herokuapp.com/gatr/000" + i + ".jpg",
    }));
});

// app.post("/test", readBodyData, async function (body, req, res, next) {
    // console.log("DATA:", body);
    // res.send((Math.random() * 100 | 0).toString());
// });

app.use(express.static(
    clientDir,
    { extensions: ["html"] }
));


const PORT = process.env.PORT || 8080;
let server = app.listen(PORT, () => {
    console.log(server.address());
    let { address, port } = server.address();
    console.log("Listening at http://%s:%s", address, port);
    
    if(!isLocal) return;
    console.log("Launching in interactive mode");
    let instance = repl.start({
        prompt: "server> ",
    });
    instance.defineCommand("shell", {
        help: "Execute a console/shell command",
        action(command) {
            try {
                if(!command) {
                    throw new Error();
                }
                const proc = spawn(command, {
                    shell: true,
                });
                process.stdout.write("| ");
                proc.stdout.on("data", (data) => {
                    process.stdout.write(data.toString().replace(/\r?\n/g, "$&| "));
                });
                proc.on("close", (code) => {
                    this.displayPrompt();
                });
            }
            catch {
                this.displayPrompt();
            }
        }
    });
    Object.assign(instance.context, {
        instance: instance,
        server: server,
        app: app,
        scratch: scratch,
    });
    instance.on("exit", () => {
        process.exit(1);
    });
});
