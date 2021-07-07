import fetch from "node-fetch";

// async function getRandom() {
    // let res = await fetch("http://localhost:8080/test", {
        // method: "POST", 
        // body: JSON.stringify({})
    // });
    // return res.body.read().toString();
// };

async function getGatr() {
    let res = await fetch("http://localhost:8080/gatr");
    let j = await res.json();
    return j;
}

async function main() {
    let k = await getGatr();
    console.log(k);
};

main();