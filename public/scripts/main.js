window.addEventListener("load", function () {
    const output = document.getElementById("output");
    
    for(let button of document.querySelectorAll("button.protocol")) {
        let protocol = button.textContent;
        console.log(protocol);
        button.addEventListener("click", async function () {
            let res = await fetch(protocol);
            let json = await res.json();
            let img = document.createElement("img");
            img.src = json.url;
            img.width = 250;
            output.appendChild(img);
        });
    }
});