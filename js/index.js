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
    loadAgentLogic();
}

function randomInteger(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function nanoid(length){
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
    let id = "";
    const random = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) id += alphabet[random[i] % alphabet.length];
    return id;
}
function fadeIn(query, type, durration, callabck){
    const element = document.querySelector(query);
    element.style.animation = "fade-in ease-in-out "+durration+"s";
    if(!type) element.style.display = "block";
    else element.style.display = type;
    element.onanimationend = ()=>{
        element.style.animation = "none";
        element.onanimationend = null;
        if(callabck) callabck();
    }
}
function fadeOut(query, durration, callabck){
    const element = document.querySelector(query);
    element.style.animation = "fade-out ease-in-out "+durration+"s";
    element.onanimationend = ()=>{
        element.style.animation = "none";
        element.style.display = "none";
        element.onanimationend = null;
        if(callabck) callabck();
    }
}

/*--Agent Logic--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function loadAgentLogic(){
    let agentID = 1, agentCount = 0, nodes = [
        {id:"node-1", agents:[]},
        {id:"node-2", agents:[]},
        {id:"node-3", agents:[]}
    ];
    for(let i = 0; i < 5; i++){
        spawnAgent(agentID, nodes);
        agentCount++;
        agentID++;
    }

    let internalCallCountDown = Math.floor(Math.random() * 7) + 7;
    let retireCountDown = Math.floor(Math.random() * 11) + 13;
    let agentInterval = setInterval(()=>{
        for(let i = 0; i < nodes.length; i++){
            for(let j = 0; j < nodes[i].agents.length; j++){
                const agent = nodes[i].agents[j];
                agent.externalCallTime++;
                if(agent.externalCallTime >= agent.externalCallMaxTime){
                    agent.externalCallTime = 0;

                    const originElement = document.querySelectorAll(".h-path")[(agent.nodeIndex - 1)];
                    const agentNode = document.getElementById("node-"+agent.nodeIndex);
                    if(originElement && agentNode){
                        let position = 0;
                        const agentNodeBody = agentNode.children[1];
                        for(let k = 0; k < agentNodeBody.children.length; k++){
                            if(agentNodeBody.children[k].id === "agent-" + agent.id){
                                position = k;
                            }
                        }
                        const mode = getPathMode();
                        if(mode === 0 && (agent.nodeIndex - 1) % 2 === 1) position = 1 - position;

                        const externalConsoleMessages = ["External Tools", "External APIs", "External Agents"];
                        const externalPaths = ["#external-tools", "#external-apis", "#external-agents"];
                        const externalPathIndex = Math.floor(Math.random() * externalPaths.length);
                        const external = externalPaths[externalPathIndex];

                        const logMessage = "Agent-{"+agent.id+"} on Node {"+agent.nodeIndex+"} called "+externalConsoleMessages[externalPathIndex];
                        let nextPath = [
                            {element:".spine-path", vertical:true, startPosition:(agent.nodeIndex - 1), endPosition:null},
                            {element:external, vertical:true, startPosition:0, endPosition:null}
                        ];
                        spawnOrb("success", agent.nodeIndex, null, originElement, false, position, null, nextPath, logMessage, externalPathIndex);

                        /*const agentDiv = document.getElementById("agent-" + agent.id);
                        agentDiv.style.animationDelay = (agent.nodeIndex - 1) * 0.5 + position * 0.25 + "s";
                        agentDiv.style.animation = "external-pulse ease-in-out 0.5s";
                        agentDiv.onanimationend = ()=>{
                            agentDiv.style.animationDelay = "0s";
                            agentDiv.style.animation = "none";
                            agentDiv.onanimationend = null;
                        }*/
                    }
                }
            }
        }
        retireCountDown--;
        if(retireCountDown <= 0){
            retireCountDown = Math.floor(Math.random() * 11) + 13;

            if(nodes.length > 0){
                const nodeIndex = randomInteger(0, nodes.length-1);
                const retiredAgentIndex = randomInteger(0, nodes[nodeIndex].agents.length-1);
                const retiredAgent = nodes[nodeIndex].agents[retiredAgentIndex]
                if(retiredAgent){
                    const retiredAgentDIV = document.getElementById("agent-"+retiredAgent.id);
                    nodes[nodeIndex].agents.splice(retiredAgentIndex, 1);
                    agentCount--;

                    consoleLog("Agent-{"+retiredAgent.id+"} retired on Node {"+(nodeIndex + 1)+"} via built-in API");
                    fadeOut("#agent-"+retiredAgent.id, 0.1, ()=>{
                        retiredAgentDIV.style.opacity = 0;
                        retiredAgentDIV.style.display = "flex";
                        retiredAgentDIV.style.animation = "agent-shrink ease-in-out 0.1s";
                        retiredAgentDIV.onanimationend = ()=>{
                            retiredAgentDIV.remove();
                            setTimeout(()=>{
                                spawnAgent(agentID, nodes);
                                agentCount++;
                                agentID++;
                            }, 250);
                        }
                    });
                }
            }
        }
        //internalCallCountDown--
        if(internalCallCountDown <= 0){
            internalCallCountDown = Math.floor(Math.random() * 7) + 7;
           
            if(agentCount >= 2){
                let loopNum = 0, agentIndex1, agentIndex2, agentDiv1, agentDiv2, agent1, agent2;
                while(true){
                    loopNum++
                    if(loopNum > 100) break;
                    agentIndex1 = randomInteger(0, agentCount-1);
                    agentIndex2 = randomInteger(0, agentCount-1);
                    agentDiv1 = document.getElementById("agent-"+agentIndex1);
                    agentDiv2 = document.getElementById("agent-"+agentIndex2);
                    if(agentIndex1 !== agentIndex2 && agentDiv1 && agentDiv2) break;
                }

                if(agentDiv1 && agentDiv2){
                    for(let i = 0; i < nodes.length; i++){
                        for(let j = 0; j < nodes[i].agents.length; j++){
                            const agent = nodes[i].agents[j];
                            if(agent.id === agentIndex1) agent1 = agent;
                            if(agent.id === agentIndex2) agent2 = agent;
                        }
                    }
                    if(agent1 && agent2){
                        agentDiv1.style.animation = "internal-pulse ease-in-out 0.5s";
                        agentDiv2.style.animation = "internal-pulse ease-in-out 0.5s";
                        agentDiv1.onanimationend = ()=>{
                            agentDiv1.style.animation = "none";
                            agentDiv1.onanimationend = null;
                        }
                        agentDiv2.onanimationend = ()=>{
                            agentDiv2.style.animation = "none";
                            agentDiv2.onanimationend = null;
                        }

                        const originElement = document.querySelectorAll(".h-path")[(agent1.nodeIndex - 1)];
                        const originAgentNode = document.getElementById("node-"+agent1.nodeIndex);
                        const destAgentNode = document.getElementById("node-"+agent2.nodeIndex);
                        const originAgentNodeBody = originAgentNode.children[1];
                        const destAgentNodeBody = destAgentNode.children[1];
                        
                        let startPosition = 0, endPosition = 0;
                        for(let k = 0; k < originAgentNodeBody.children.length; k++){
                            if(originAgentNodeBody.children[k].id === "agent-" + agent1.id){
                                startPosition = k;
                            }
                        }
                        for(let k = 0; k < destAgentNodeBody.children.length; k++){
                            if(destAgentNodeBody.children[k].id === "agent-" + agent2.id){
                                endPosition = k;
                            }
                        }

                        const mode = getPathMode();
                        if(mode === 0 && (agent1.nodeIndex - 1) % 2 === 1) startPosition = 1 - startPosition;
                        let nextPath = [];
                        if(agent1.nodeIndex !== agent2.nodeIndex){
                            const mode = getPathMode();
                            nextPath.push({element:".spine-path", vertical:true, startPosition:(agent1.nodeIndex - 1), endPosition:(agent2.nodeIndex - 1)});
                            if(
                                mode === 0 &&
                                (Math.abs(agent1.nodeIndex - agent2.nodeIndex) === 1) &&
                                Math.floor(agent1.nodeIndex / 2) === Math.floor(agent2.nodeIndex / 2)
                            ) nextPath.pop();
                        
                            /*if(
                                mode === 1 || 
                                (mode === 0 && 
                                    (Math.abs(agent1.nodeIndex - agent2.nodeIndex) !== 1) ||
                                    Math.floor(agent1.nodeIndex / 2) * 2 !== Math.floor(agent2.nodeIndex / 2) * 2
                                )){
                                nextPath.push({element:".spine-path", vertical:true, startPosition:(agent1.nodeIndex - 1), endPosition:(agent2.nodeIndex - 1)});
                            }*/
                            //nextPath.push({element:"#h-path-"+(agent2.nodeIndex-1), vertical:false, startPosition:0, endPosition:endPosition});
                        }
                        spawnOrb("internal", agent1.nodeIndex, agent2.nodeIndex, originElement, false, startPosition, endPosition, nextPath, null, null);
                    }
                }
            }
        }
    }, 1000);



    window.oncontextmenu = (e)=>{
        e.preventDefault();
        console.log(nodes);
    }
}
function spawnAgent(agentID, nodes){
    const newAgent = {
        id:agentID,
        externalCallTime:0,
        externalCallMaxTime:Math.floor(Math.random() * 5) + 5
    }

    const allAgents = [];
    for(let i = 0; i < nodes.length; i++) allAgents.push(nodes[i].agents);
    const minLength = Math.min(...allAgents.map(a => a.length));

    const shortestArrays = allAgents.map((a, i)=>({array:a, index:i+1})).filter(a => a.array.length === minLength);
    const chosen = shortestArrays[Math.floor(Math.random() * shortestArrays.length)];
    newAgent.nodeIndex = chosen.index;
    chosen.array.push(newAgent);

    consoleLog("Agent-{"+agentID+"} created on Node {"+chosen.index+"} via built-in API");
    generateAgentDIV(chosen.index, agentID);
}
function generateAgentDIV(nodeIndex, agentID){
    const nodeDiv = document.getElementById("node-"+nodeIndex);
    const nodeDivBody = nodeDiv.querySelector(".node-body");
    const agentDiv     = document.createElement("div");
    const agentDivIcon = document.createElement("div");
    const agentDivText = document.createElement("div");

    agentDiv.className = "agent";
    agentDivIcon.className = "agent-icon";
    agentDivText.className = "agent-text";
    agentDivText.innerText = "Agent " + agentID;
    agentDiv.id = "agent-"+agentID;

    agentDiv.appendChild(agentDivIcon);
    agentDiv.appendChild(agentDivText);
    nodeDivBody.appendChild(agentDiv);
}

/*--Orb Logic----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function getPathMode(){
    let mode = 0;
    if(window.innerWidth < 780 || (window.innerWidth > 1000 && window.innerWidth < 1466)) mode = 1;
    return mode;
}
function spawnOrb(type, nodeIndexStart, nodeIndexEnd, originElement, vertical, startPosition, endPosition, nextPath, logMessage, externalPathIndex){
    const mode = getPathMode();
    const orb = document.createElement("div");
    let animationDelay = (nodeIndexStart - 1) * 0.5;
    switch(type){
        default: orb.className = "orb"; break;
        case "internal": orb.className = "orb orb-internal"; break;
        case  "success": orb.className = "orb orb-success";  break;
        case    "retry": orb.className = "orb orb-retry";    break;
        case     "fail": orb.className = "orb orb-fail";     break;
    }
    if(vertical){
        animationDelay = 0;
        orb.style.setProperty("--orb-left", "0%");
        orb.style.setProperty("--orb-top", "100%");

        if(startPosition > 0){
            if(mode === 1) orb.style.top = startPosition * 6.5 + "rem";
            else orb.style.top = Math.floor(startPosition / 2) * 2 * 3.5 + "rem";
        }
        if(endPosition !== null){
            console.log(startPosition, endPosition)
            let endCoords;
            if(mode === 1){
                orb.style.top = startPosition * 6.5 + "rem";
                endCoords = endPosition * 3.5 + "rem";
            }
            else{
                orb.style.top = Math.floor(startPosition / 2) * 2 * 3 + "rem";
                endCoords = Math.floor(endPosition / 2) * 2 * 3 + "rem";
            }
            orb.style.setProperty("--orb-top", endCoords);
        }
    }
    else{
        if(nodeIndexEnd !== null){
            animationDelay = 0;
            if(nodeIndexStart === nodeIndexEnd){
                if(startPosition < endPosition){
                    orb.style.setProperty("--orb-left", "50%");
                    orb.style.setProperty("--orb-top", "0%");
                }
                else{
                    orb.style.setProperty("--orb-left", "0%");
                    orb.style.setProperty("--orb-top", "0%");
                    orb.style.left = "50%";
                }
            }
            else{
                orb.style.setProperty("--orb-left", "100%");
                orb.style.setProperty("--orb-top", "0%");
                if(startPosition > 0) orb.style.left = startPosition * 12 + "rem";
            }
        }
        else{
            animationDelay += startPosition * 0.25;
            orb.style.setProperty("--orb-left", "100%");
            orb.style.setProperty("--orb-top", "0%");
            if(startPosition > 0) orb.style.left = startPosition * 12 + "rem";
        }
    }
    orb.style.animationDelay = animationDelay + "s";

    originElement.appendChild(orb);
    orb.onanimationend = ()=>{
        orb.remove();
        if(nextPath.length === 0){
            if(logMessage !== null) consoleLog(logMessage);
            if(externalPathIndex !== null){
                const externalDIV = document.querySelectorAll(".external")[externalPathIndex];
                externalDIV.style.animation = "none";
                externalDIV.style.animation = "external-pulse ease-in-out 0.5s";
                externalDIV.onanimationend = ()=>{
                    externalDIV.style.animation = "none";
                    externalDIV.onanimationend = null;
                }
            }
        }
        else{
            const nextPathObject = nextPath.shift();
            const nextPathElement = document.querySelector(nextPathObject.element);
            spawnOrb(
                type, nodeIndexStart, nodeIndexEnd, nextPathElement, nextPathObject.vertical,
                nextPathObject.startPosition, nextPathObject.endPosition,
                nextPath, logMessage, externalPathIndex
            );
        }
    }
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
    consoleLogList.appendChild(consoleLog);
    consoleLog.innerText = getConsoleTime() + " " + text;

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





















//➔
/*
setTimeout(()=>{
pathH = document.querySelector(".h-path") 
pathV = document.querySelector(".spine-path") 
externalH = document.querySelector(".external-paths").querySelector(".v-path")
}, 100)
let pathH = document.querySelector(".h-path") 
let pathV = document.querySelector(".spine-path") 
let externalH

*/