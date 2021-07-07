import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import repl from "repl";
import { spawn } from "child_process";
import bodyParser from "body-parser";

let __dirname = path.dirname(new URL(import.meta.url).pathname);
const scratch = {}; // used for shell interaction

// res.redirect("/new-thing")

if(__dirname[0] == '/') {
    __dirname = __dirname.slice(1);
}

console.log(__dirname);

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

app.get("/gatr/:file", function (req, res) {
    
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

app.post("/gatr", async function (req, res, next) {
    res.send(JSON.stringify({
        url: "",
    }));
});

// app.post("/test", readBodyData, async function (body, req, res, next) {
    // console.log("DATA:", body);
    // res.send((Math.random() * 100 | 0).toString());
// });

const clientDir = __dirname + "/client";
app.use(express.static(
    clientDir,
    { extensions: ["html"] }
));


const PORT = process.env.PORT || 8080;
let server = app.listen(PORT, () => {
    console.log(server.address());
    let { address, port } = server.address();
    console.log("Listening at http://%s:%s", address, port);
    if(process.argv[2] != "i") return;
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
