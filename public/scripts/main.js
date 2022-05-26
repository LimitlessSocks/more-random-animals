window.addEventListener("load", async function () {
    const output = document.getElementById("output");
    const available = document.getElementById("available");
    
    let domains = await fetch("domains");
    domains = await domains.json();
    domains = domains.domains;
    
    for(let { commandName, description } of domains) {
        let button = document.createElement("button");
        button.className = "protocol";
        let code = document.createElement("code");
        code.textContent = `/${commandName}`;
        button.appendChild(code);
        
        button.addEventListener("click", async function () {
            let res = await fetch(commandName);
            let json = await res.json();
            let img = document.createElement("img");
            img.src = json.url;
            img.width = 250;
            output.appendChild(img);
        });
        
        let li = document.createElement("li");
        li.appendChild(button);
        li.appendChild(document.createTextNode(` - ${description}`));
        available.appendChild(li);
    }
    
    for(let button of document.querySelectorAll("button.protocol")) {
        let protocol = button.textContent;
        console.log(protocol);
    }
});
    