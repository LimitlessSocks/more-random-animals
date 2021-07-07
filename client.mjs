import fetch from "node-fetch";

async function getRandom() {
    let res = await fetch("http://localhost:8080/test", {
        method: "POST", 
        body: JSON.stringify({})
    });
    return res.body.read().toString();
};

async function main() {
    let nums = 10;
    for(let k = 0; k < nums; k++) {
        let i = await getRandom();
        console.log("Received:", i);
    }
};

main();