/*--Initial------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
window.onload = initLoad;

function initLoad(){
    let selectedTab = 0;
    const codeDisplays = document.querySelectorAll(".code-display");
    const codeDisplayTabsContainer = document.querySelector(".code-display-tab-container");
    const tabs = codeDisplayTabsContainer.children;
    for(let i = 0; i < tabs.length; i++){
        tabs[i].onclick = ()=>{
            if(i === selectedTab) return;
            for(let j = 0; j < codeDisplays.length; j++) codeDisplays[j].style.display = "none";
            for(let j = 0; j < tabs.length; j++) tabs[j].classList.remove("code-display-selected-tab");
            tabs[i].classList.add("code-display-selected-tab");
            codeDisplays[i].style.display = "block";
            selectedTab = i;
        }
    }

    loadChaosButtonLogic();

    let consoleLogs = [
        "Agent-{id} created on Node {n} via built-in API",
        "Node-{n} terminated; {x} agents recovered on Node {m} with no lost state",
        "Agent-{id} external call failed; retried successfully with exactly-once guarantee",
        "Agent-{id} suspended (awaiting approval) with state preserved",
        "Agent-{id} crashed in sandbox; fault contained",
        "Agent-{id} rewound to earlier state for safe replay",
        "Version {v2} deployed; {x} agents migrated with zero downtime",
    ];

    let logIndex = 0;
    let colors = [null, "red", "yellow", "green"];
    setInterval(()=>{
        const colorIndex = Math.floor(Math.random() * colors.length);
        const logText = getConsoleTime() + " " + consoleLogs[logIndex];
        consoleLog(logText, colors[colorIndex]);
        logIndex++;
        if(logIndex >= consoleLogs.length) logIndex = 0;
    }, 1000)
}

/*--Console Logic------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function getConsoleTime(){
    const date = new Date();
    const h = JSON.stringify(date.getHours()).padStart(2, "0");
    const m = JSON.stringify(date.getMinutes()).padStart(2, "0");
    const s = JSON.stringify(date.getSeconds()).padStart(2, "0");

    return "["+h+":"+m+":"+s+"]";
}
function consoleLog(text, color){
    const consoleLogList = document.querySelector(".console-log-list");
    const consoleLog = document.createElement("div");
    consoleLog.className = "console-log";
    consoleLog.innerText = text;
    consoleLogList.appendChild(consoleLog);

    if(color){
        switch(color){
            default:break;
            case "red":    consoleLog.style.color = "rgb(231, 76, 60)";  break;
            case "yellow": consoleLog.style.color = "rgb(241, 196, 15)"; break;
            case "green":  consoleLog.style.color = "rgb(46, 204, 113)"; break;
        }
    }

    setTimeout(()=>{
        const consoleLogBody = document.querySelector(".console-body");
        consoleLogBody.scrollTop = consoleLogBody.scrollHeight
    }, 0);
}

/*--Communication------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function spawnOrb(type, originElement, vertical, position, nextPath){
    const orb = document.createElement("div");
    
    switch(type){
        default: orb.className = "orb"; break;
        case "internal": orb.className = "orb orb-internal"; break;
        case  "success": orb.className = "orb orb-success";  break;
        case    "retry": orb.className = "orb orb-retry";    break;
        case     "fail": orb.className = "orb orb-fail";     break;
    }
    if(vertical){
        orb.style.setProperty("--orb-left", "0%");
        orb.style.setProperty("--orb-top", "100%");
        if(position > 0) orb.style.top = "5rem";
    }
    else{
        orb.style.setProperty("--orb-left", "100%");
        orb.style.setProperty("--orb-top", "0%");
        if(position > 0) orb.style.left = "5rem";
    }
    originElement.appendChild(orb);
    orb.onanimationend = ()=>{
        orb.remove();
        if(nextPath.length > 0){
            const nextPathObject = nextPath.shift();
            console.log(nextPathObject)
            spawnOrb(type, nextPathObject.element, nextPathObject.vertical, nextPathObject.position, nextPath);
        }
    }
}
//➔

/*--Chaos Buttons Logic------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function loadChaosButtonLogic(){
    let activeList = [];
    const chaosButtons = document.querySelectorAll(".chaos-button");
    for(let i = 0; i < 7; i++){
        const buttonIconSide = chaosButtons[i + 7].children[0];
        const buttonSide = chaosButtons[i + 7];
        const buttonIcon = chaosButtons[i].children[0];
        const button = chaosButtons[i];

        buttonSide.onclick = ()=>{chaoButtonClick(true)};
        button.onclick = ()=>{chaoButtonClick(false)};
        activeList.push(false);

        function chaoButtonClick(sideBar){
            buttonIconSide.classList.add("chaos-button-icon-active");
            buttonSide.classList.add("chaos-button-active");
            buttonIcon.classList.add("chaos-button-icon-active");
            button.classList.add("chaos-button-active");
            activeList[i] = true;
            //if(sideBar) setTimeout(chaosSideBar, 100);

            if(!allChaosButtonsActive(activeList)) return;
            const CTAbar = document.querySelector(".CTA-bar");
            CTAbar.style.animation = "CTA-bar-slide ease-in-out 0.25s forwards";
        }
    }

    let barVisible = false;
    const sideBar = document.querySelector(".side-chaos-button-container");
    const sideCloseMask = document.querySelector(".side-close-mask");
    const sideMenu = document.querySelector("#side-menu");
    sideCloseMask.onclick = chaosSideBar;
    sideMenu.onclick = chaosSideBar;

    function chaosSideBar(){
        if(!barVisible){
            sideBar.style.animation = "side-bar-slide-in ease-in-out 0.1s forwards";
            sideCloseMask.style.pointerEvents = "all";
            barVisible = true;
            return
        }
        sideBar.style.animation = "side-bar-slide-out ease-in-out 0.1s forwards";
        sideCloseMask.style.pointerEvents = "none";
        barVisible = false;
    }
}
function allChaosButtonsActive(activeList){
    for(let i = 0; i < activeList.length; i++){
        if(!activeList[i]) return false;
    }
    return true;
}

setTimeout(()=>{
pathH = document.querySelector(".h-path") 
pathV = document.querySelector(".spine-path") 
externalH = document.querySelector(".external-paths").querySelector(".v-path")
}, 100)
let pathH = document.querySelector(".h-path") 
let pathV = document.querySelector(".spine-path") 
let externalH