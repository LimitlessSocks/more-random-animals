import express from "express";
import fs from "fs";
import path from "path";
import repl from "repl";
import { spawn } from "child_process";
import bodyParser from "body-parser";
import util from "util";
const readdir = util.promisify(fs.readdir);

const scratch = {}; // used for shell interaction

const isLocal = process.argv[2] === "l";
let __dirname = isLocal ? path.dirname(new URL(import.meta.url).pathname) : "/app";

if(__dirname[0] == '/' && isLocal) {
    __dirname = __dirname.slice(1);
}

console.log("Starting up at: ", __dirname);

const HTTP_STATUS = {
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVICE_ERROR: 500,
    NOT_IMPLEMENTED: 501,
};

let app = express();

app.use(express.urlencoded({
    extended: true
}));

const SERVE_DOMAINS = [
    "gatr", "snek", "capy", "fish",
    "bear", "turtle", "duck"
];
const clientDir = __dirname + "/public";

const readBodyData = async function (req, res, next) {
    let body = "";
    req.on("data", (data) => {
        body += data;
    });
    req.on("end", () => {
        next(body, req, res, next);
    });
};

const IMAGE_NAME_WIDTH = 4;
for(let domain of SERVE_DOMAINS) {
    let maxCount = NaN;
    
    try {
        let files = await readdir(path.join(__dirname, "/public/images/", domain));
        maxCount = files.length;
    }
    catch(err) {
        console.error("Error reading all files for domain '" + domain + "'");
        console.error(err);
    }
    console.log(domain.padEnd(10), ":", maxCount);
    
    app.get("/" + domain, async function (req, res, next) {
        let rand = 1 + Math.floor(Math.random() * maxCount);
        let name = rand.toString().padStart(IMAGE_NAME_WIDTH, "0") + ".jpg";
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
            url: "https://more-random-animals.herokuapp.com/" + domain + "/" + name,
        }));
    });
    app.get("/" + domain + "/:file", function (req, res) {
        let { file } = req.params;
        res.sendFile(__dirname + "/public/images/" + domain + "/" + file);
    });
}

app.use(express.static(
    clientDir,
    { extensions: ["html", "css", "js"] }
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
