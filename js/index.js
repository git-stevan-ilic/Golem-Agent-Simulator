/*--Initial------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
window.onresize = resizeConsole;
window.onload = initLoad;

function initLoad(){
    /*let selectedTab = 0;
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
    }*/

    loadChaosButtonLogic();
    loadAgentLogic();
    resizeConsole();
}
function resizeConsole(){
    const consoleContainer = document.querySelector(".console-container");
    const agentContainer = document.querySelector(".agent-container");
    const agentHeight = agentContainer.getBoundingClientRect().height;
    consoleContainer.style.height = agentHeight + "px";
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
            case "red":    consoleLog.style.color = "rgb(231,  76, 60)"; break;
            case "yellow": consoleLog.style.color = "rgb(241, 196, 15)"; break;
            case "green":  consoleLog.style.color = "rgb(46, 204, 113)"; break;
            case "blue":   consoleLog.style.color = "rgb(80, 118, 246)"; break;
        }
    }

    setTimeout(()=>{
        const consoleLogBody = document.querySelector(".console-body");
        consoleLogBody.scrollTop = consoleLogBody.scrollHeight;
    }, 0);
}

/*--Agent Logic--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function loadAgentLogic(){
    let agentID = 1, nodeID = 1, agentCount = 0, version = 1,nodes = [], suspended = [];
    for(let i = 0; i < 3; i++) [nodeID, nodes] = spawnNode(nodeID, nodes);
    for(let i = 0; i < 5; i++) [nodeID, agentID, agentCount, nodes] = spawnAgent(version, nodeID, agentID, agentCount, nodes);

    let loopPopupStoped = false;
    let internalCallCountDown = Math.floor(Math.random() * 7) + 7;
    let retireCountDown = Math.floor(Math.random() * 11) + 13;
    let agentInterval = setInterval(agentLoop, 1000);

    function agentLoop(){
        [retireCountDown, nodes] = retireAgentLogic(retireCountDown, nodes);
        internalCallCountDown = internalCallLogic(internalCallCountDown, agentCount, nodes);
        externalCallLogic(nodes);
    }

    window.addEventListener("pause-loop", ()=>{
        const allExternals = document.querySelectorAll(".external");
        const allAgents = document.querySelectorAll(".agent");
        const allOrbs = document.querySelectorAll(".orb");

        for(let i = 0; i < allExternals.length; i++) allExternals[i].style.animationPlayState = "paused";
        for(let i = 0; i < allAgents.length; i++) allAgents[i].style.animationPlayState = "paused";
        for(let i = 0; i < allOrbs.length; i++) allOrbs[i].style.animationPlayState = "paused";

        clearInterval(agentInterval);
        loopPopupStoped = true;
    });
    window.addEventListener("resume-loop", ()=>{
        const allExternals = document.querySelectorAll(".external");
        const allAgents = document.querySelectorAll(".agent");
        const allOrbs = document.querySelectorAll(".orb");

        for(let i = 0; i < allExternals.length; i++) allExternals[i].style.animationPlayState = "running";
        for(let i = 0; i < allAgents.length; i++) allAgents[i].style.animationPlayState = "running";
        for(let i = 0; i < allOrbs.length; i++) allOrbs[i].style.animationPlayState = "running";

        agentInterval = setInterval(agentLoop, 1000);
        loopPopupStoped = false;
    });
    window.addEventListener("visibilitychange", ()=>{
        if(document.hidden){
            clearInterval(agentInterval);
            return;
        }
        if(!loopPopupStoped) agentInterval = setInterval(agentLoop, 1000);
    });
    window.addEventListener("add-agent", ()=>{
        [nodeID, agentID, agentCount, nodes] = spawnAgent(version, nodeID, agentID, agentCount, nodes);
    });
    window.addEventListener("remove-agent", (e)=>{
        const agentIndex = e.detail.agentIndex;
        const nodeIndex = e.detail.nodeIndex;

        nodes[nodeIndex].agents.splice(agentIndex, 1);
        agentCount--; 
    });
    window.addEventListener("kill-node", ()=>{
        const nodeIndex = randomInteger(0, nodes.length-1);
        const agentsToRecover = [];
        for(let i = 0; i < nodes[nodeIndex].agents.length; i++){
            agentsToRecover.push(nodes[nodeIndex].agents[i]);
            nodes[nodeIndex].agents[i].active = false;
        }

        let sPluralAgent = "s";
        if(nodes[nodeIndex].agents.length === 1) sPluralAgent = "";
        let logMessageTerminated = "Node-{"+nodes[nodeIndex].id+"} terminated";
        let logMessageRecovered = "{"+nodes[nodeIndex].agents.length+"} agent"+sPluralAgent+" recovered on Node";
        consoleLog(logMessageTerminated, "red");
        
        const nodeDiv = document.getElementById("node-"+nodes[nodeIndex].id);
        nodeDiv.style.animation = "kill-node ease-in-out 0.5s forwards";
        setTimeout(()=>{
            fadeOut("#node-"+nodes[nodeIndex].id, 0.1, ()=>{
                document.getElementById("h-path-"+nodes[nodeIndex].id).remove();
                nodes.splice(nodeIndex, 1);
                nodeDiv.remove();

                setTimeout(()=>{
                    const recoveredAgentNodes = [];
                    for(let i = 0; i < agentsToRecover.length; i++){
                        let newNodeIndex;
                        [nodeID, agentID, agentCount, nodes, newNodeIndex] = spawnAgent(version, nodeID, agentID, agentCount, nodes, agentsToRecover[i]);
                        recoveredAgentNodes.push(newNodeIndex);
                    }

                    let sPluralNode = "s";
                    if(recoveredAgentNodes.length === 1) sPluralNode = "";
                    logMessageRecovered += sPluralNode + " ";
                    for(let i = 0; i < recoveredAgentNodes.length; i++){
                        logMessageRecovered += "{"+recoveredAgentNodes[i]+"}";
                        if(i !== recoveredAgentNodes.length-1) logMessageRecovered += ", ";
                    }
                    logMessageRecovered += " with no lost state";
                    consoleLog(logMessageRecovered, "green");
                }, 100);
            });
        }, 1000);
    });
    window.addEventListener("fail-interaction", ()=>{
        const spinePath = document.querySelector(".spine-path");
        const spineOrbs = spinePath.querySelectorAll(".orb");
        const allOrbs = document.querySelectorAll(".orb");
        if(allOrbs.length === 0) return;

        let selectedOrb;
        if(spineOrbs.length > 0) selectedOrb = spineOrbs[randomInteger(0, spineOrbs.length-1)];
        else selectedOrb = allOrbs[randomInteger(0, allOrbs.length-1)];
        if(!selectedOrb) return;
        
        selectedOrb.style.animationPlayState = "paused";
        consoleLog("Agent-{"+selectedOrb.dataset.origin+"} external call failed", "red");

        const orbColorChange = document.createElement("div");
        orbColorChange.className = "orb-color-change";
        selectedOrb.appendChild(orbColorChange);
        selectedOrb.classList.remove("orb-success");

        const orbFailIcon = document.createElement("div");
        orbFailIcon.className = "orb-fail-icon";
        orbColorChange.appendChild(orbFailIcon);

        orbColorChange.onanimationend = (e)=>{
            e.stopPropagation();
            setTimeout(()=>{
                orbColorChange.style.animation = "orb-to-yellow ease-in-out 0.2s forwards";
                orbColorChange.onanimationend = (e)=>{
                    e.stopPropagation();

                    orbFailIcon.style.animation = "fade-out ease-in-out 0.2s forwards";
                    orbFailIcon.onanimationend = ()=>{orbFailIcon.remove()}

                    void orbColorChange.offsetWidth;
                    setTimeout(()=>{
                        orbColorChange.style.animation = "orb-to-green ease-in-out 0.2s forwards";
                        orbColorChange.onanimationend = (e)=>{
                            consoleLog("Agent-{"+selectedOrb.dataset.origin+"} external call retried successfully with exactly-once guarantee", "green");
                            e.stopPropagation();

                            void orbColorChange.offsetWidth;
                            orbColorChange.remove();
                            selectedOrb.classList.add("orb-success");
                            selectedOrb.style.animationPlayState = "running";
                        }
                    }, 500); 
                }
            }, 1000);
        }
    });
    window.addEventListener("suspend-agent", ()=>{
        let nodeIndex, loopCount = 0;
        while(loopCount < 100){
            nodeIndex = randomInteger(0, nodes.length-1);
            if(nodes[nodeIndex].agents.length > 0) break;
        }
        if(loopCount >= 100) return;

        const agentIndex = randomInteger(0, nodes[nodeIndex].agents.length-1);
        const agentDivID = "agent-"+nodes[nodeIndex].agents[agentIndex].id;
        const agentDiv = document.getElementById(agentDivID);
        if(!agentDiv) return;
        nodes[nodeIndex].agents[agentIndex].active = false;
        consoleLog("Agent-{"+nodes[nodeIndex].agents[agentIndex].id+"} suspended (awaiting approval) with state preserved", "yellow");

        fadeOut("#"+agentDivID, 0.1, ()=>{
            agentDiv.style.opacity = 0;
            agentDiv.style.display = "flex";
            agentDiv.style.animation = "agent-shrink ease-in-out 0.1s";

            agentDiv.onanimationend = ()=>{
                const currAgent = nodes[nodeIndex].agents[agentIndex];
                nodes[nodeIndex].agents.splice(agentIndex, 1);
                suspended.push(currAgent);

                const suspendedAgentContainer = document.querySelector(".suspended-agent-container");
                suspendedAgentContainer.appendChild(agentDiv);
                const agentDivIcon = agentDiv.children[0];
                agentDivIcon.classList.add("agent-sleep");
                fadeIn("#"+agentDivID, "flex", 0.1, ()=>{
                    agentDiv.style.cursor = "pointer";
                    agentDiv.style.opacity = 1;
                    agentDiv.onclick = ()=>{
                        agentDiv.onclick = null;
                        fadeOut("#"+agentDivID, 0.1, ()=>{
                            [nodeID, agentID, agentCount, nodes] = spawnAgent(version, nodeID, agentID, agentCount, nodes, currAgent, true);
                            for(let i = 0; i < suspended.length; i++){
                                if(suspended[i].id === currAgent.id){
                                    suspended.splice(i, 1);
                                    break;
                                }
                            }
                        });
                    }
                });
            }
        });
    });
    window.addEventListener("inject-defect", ()=>{
        let loopNum = 0;
        let nodeIndex = randomInteger(0, nodes.length-1);
        let agentIndex = randomInteger(0, nodes[nodeIndex].agents.length-1);
        while(true){
            loopNum++;
            if(loopNum >= 100) break;
            if(nodes[nodeIndex].agents[agentIndex].active) break;
        }

        const agentDivID = "agent-"+nodes[nodeIndex].agents[agentIndex].id;
        const agentDiv = document.getElementById(agentDivID);
        if(!agentDiv) return;
        nodes[nodeIndex].agents[agentIndex].active = false;
        nodes[nodeIndex].agents[agentIndex].error = nodes[nodeIndex].agents[agentIndex].state;
        consoleLog("Agent-{"+nodes[nodeIndex].agents[agentIndex].id+"} crashed in sandbox", "red");
        consoleLog("Agent-{"+nodes[nodeIndex].agents[agentIndex].id+"} fault contained", "green");

        const agentDivIcon = agentDiv.children[0];
        agentDivIcon.classList.add("agent-error");
        agentDiv.style.animation = "agent-shake ease-in-out 0.25s, agent-crash ease-in-out 0.25s forwards";
    });
    window.addEventListener("troubleshoot", ()=>{
        const nodeIndex = randomInteger(0, nodes.length-1);
        const agentIndex = randomInteger(0, nodes[nodeIndex].agents.length-1);
        const agentDivID = "agent-"+nodes[nodeIndex].agents[agentIndex].id;
        
        const agentDiv = document.getElementById(agentDivID);
        if(!agentDiv) return;

        const pauseLoopEvent = new Event("pause-loop");
        window.dispatchEvent(pauseLoopEvent);

        const versionSlide = document.querySelector("#version-slide");
        const versionValue = document.querySelector(".version-value");
        versionValue.innerText = "Version: " + nodes[nodeIndex].agents[agentIndex].state;
        versionSlide.max = nodes[nodeIndex].agents[agentIndex].state;
        versionSlide.min = 0;
        versionSlide.value = versionSlide.max;
        versionSlide.oninput = ()=>{
            versionValue.innerText = "Version: " + versionSlide.value;
        }

        fadeIn("#version-mask", "block", 0.1, null);

        function closeModal(){
            fadeOut("#version-mask", 0.1, ()=>{
                setTimeout(()=>{
                    const resumeLoopEvent = new Event("resume-loop");
                    window.dispatchEvent(resumeLoopEvent);

                    nodes[nodeIndex].agents[agentIndex].state = parseInt(versionSlide.value);
                    if(nodes[nodeIndex].agents[agentIndex].state < nodes[nodeIndex].agents[agentIndex].error){
                        nodes[nodeIndex].agents[agentIndex].error = -1;
                        const agentDivIcon = agentDiv.children[0];
                        agentDivIcon.classList.remove("agent-error");
                        agentDiv.style.animation = "none";
                    }
                    consoleLog("Agent-{"+nodes[nodeIndex].agents[agentIndex].id+"} rewound to earlier state for safe replay", "green");
                }, 250);
            });
        }
        document.getElementById("version-window").onclick = (e)=>{e.stopPropagation()}
        document.getElementById("version-mask").onclick = closeModal;
        document.getElementById("version-ok").onclick = closeModal;
    });
    window.addEventListener("update-agent", ()=>{
        const pauseLoopEvent = new Event("pause-loop");
        window.dispatchEvent(pauseLoopEvent);

        const updateTiles = document.querySelectorAll(".update-tile");
        for(let i = 0; i < updateTiles.length; i++){
            updateTiles[i].onclick = ()=>{
                version++;
                const agentText = document.querySelectorAll(".agent-text");
                for(let j = 0; j < agentText.length; j++){
                    const vPos = agentText[j].innerText.indexOf("v");
                    if(vPos === -1) agentText[j].innerText += " v2";
                    else{
                        const text = agentText[j].innerText.slice(0, vPos);
                        agentText[j].innerText = text + " v"+version;
                    }
                }
                
                const resumeLoopEvent = new Event("resume-loop");
                window.dispatchEvent(resumeLoopEvent);
                fadeOut("#update-mask", 0.1, null);
                consoleLog("Version {v"+version+"} deployed; {"+agentText.length+"} agents migrated with zero downtime", "green");
            }
        }

        fadeIn("#update-mask", "block", 0.1, null);
    });
}
function spawnNode(nodeID, nodes){
    const nodeConatiner = document.querySelector(".node-conatiner");
    const nodeBody = document.createElement("div");
    const nodeHead = document.createElement("div");
    const node = document.createElement("div");

    nodeBody.className = "node-body";
    nodeHead.className = "node-head";
    node.className = "node";

    nodeHead.innerText = "Node " + nodeID;
    node.dataset.index = nodeID;
    node.id = "node-" + nodeID;

    node.appendChild(nodeHead);
    node.appendChild(nodeBody);
    nodeConatiner.appendChild(node);

    const nodePaths = document.querySelector(".node-paths");
    const hPath = document.createElement("div");
    hPath.id = "h-path-"+nodeID;
    hPath.className = "h-path";
    nodePaths.appendChild(hPath);

    nodes.push({id:nodeID, agents:[]});
    nodeID++;

    return [nodeID, nodes];
}
function spawnAgent(version, nodeID, agentID, agentCount, nodes, agentToSpawn, resumed){
    const externalCallMaxTime = Math.floor(Math.random() * 5) + 5;
    let newAgent;
    if(agentToSpawn){
        newAgent = agentToSpawn;
        newAgent.active = true;
    }
    else{
        newAgent = {
            id:agentID,
            state:0,
            error:-1,
            active:true,
            externalCallMaxTime:externalCallMaxTime,
            externalCallTime:randomInteger(0, externalCallMaxTime)
        }
    }

    if(checkNewNodeRequired(nodes)){
        const allAgents = [];
        for(let i = 0; i < nodes.length; i++) allAgents.push({agents:nodes[i].agents, id:nodes[i].id});
        const minLength = Math.min(...allAgents.map(a => a.agents.length));
        const shortestArrays = allAgents.map((a, i)=>({array:a.agents, index:a.id})).filter(a => a.array.length === minLength);
        const chosen = shortestArrays[Math.floor(Math.random() * shortestArrays.length)];
        newAgent.nodeIndex = chosen.index;
        chosen.array.push(newAgent);
    }
    else{
        [nodeID, nodes] = spawnNode(nodeID, nodes);
        nodes[nodes.length-1].agents.push(newAgent);
        newAgent.nodeIndex = nodeID - 1;
    }
    
    if(resumed) consoleLog("Agent-{"+agentToSpawn.id+"} resumed on Node {"+agentToSpawn.id+"} via built-in API", "green");
    if(!agentToSpawn) consoleLog("Agent-{"+agentID+"} created on Node {"+newAgent.nodeIndex+"} via built-in API");
    generateAgentDIV(version, newAgent.nodeIndex, agentID, agentToSpawn);
    resizeConsole();

    agentCount++; agentID++;
    return [nodeID, agentID, agentCount, nodes, newAgent.nodeIndex];
}
function generateAgentDIV(version, nodeIndex, agentID, agentToSpawn){
    const nodeDiv = document.getElementById("node-"+nodeIndex);
    const nodeDivBody = nodeDiv.querySelector(".node-body");
    const agentDiv     = document.createElement("div");
    const agentDivIcon = document.createElement("div");
    const agentDivText = document.createElement("div");

    let agentDivID = agentID, versionText = " v"+version;
    if(agentToSpawn) agentDivID = agentToSpawn.id;
    if(version === 1) versionText = "";

    agentDiv.className = "agent";
    agentDivIcon.className = "agent-icon";
    agentDivText.className = "agent-text";
    agentDivText.innerText = "Agent " + agentDivID + versionText;
    agentDiv.id = "agent-"+agentDivID;

    agentDiv.appendChild(agentDivIcon);
    agentDiv.appendChild(agentDivText);
    nodeDivBody.appendChild(agentDiv);
}
function checkNewNodeRequired(nodes){
    let hasRoom = false;
    for(let i = 0; i < nodes.length; i++){
        if(nodes[i].agents.length < 2){
            hasRoom = true;
            break;
        }
    }
    return hasRoom;
}
function retireAgentLogic(retireCountDown, nodes){
    retireCountDown--;
    if(retireCountDown > 0) return [retireCountDown, nodes];

    retireCountDown = Math.floor(Math.random() * 11) + 13;
    if(nodes.length <= 0) return [retireCountDown, nodes];

    const nodeIndex = randomInteger(0, nodes.length-1);
    const retiredAgentIndex = randomInteger(0, nodes[nodeIndex].agents.length-1);
    const retiredAgent = nodes[nodeIndex].agents[retiredAgentIndex]
            
    if(!retiredAgent) return [retireCountDown, nodes];
    const retiredOrbsNotStarted = document.querySelectorAll("[data-agent-start='"+retiredAgent.id+"']");
    const retiredAgentDIV = document.getElementById("agent-"+retiredAgent.id);        
    for(let k = retiredOrbsNotStarted.length-1; k >= 0; k--) retiredOrbsNotStarted[k].remove();
                
    consoleLog("Agent-{"+retiredAgent.id+"} retired on Node {"+nodes[nodeIndex].id+"} via built-in API");
    fadeOut("#agent-"+retiredAgent.id, 0.1, ()=>{
        retiredAgentDIV.style.opacity = 0;
        retiredAgentDIV.style.display = "flex";
        retiredAgentDIV.style.animation = "agent-shrink ease-in-out 0.1s";
        retiredAgentDIV.onanimationend = ()=>{
            retiredAgentDIV.remove();

            const agentData = {nodeIndex:nodeIndex, agentIndex:retiredAgentIndex}
            const removeAgentEvent = new CustomEvent("remove-agent", {detail:agentData});
            window.dispatchEvent(removeAgentEvent);

            setTimeout(()=>{
                const addAgentEvent = new Event("add-agent");
                window.dispatchEvent(addAgentEvent);
            }, 250);
        }
    });

    return [retireCountDown, nodes];
}
function externalCallLogic(nodes){
    for(let i = 0; i < nodes.length; i++){
        for(let j = 0; j < nodes[i].agents.length; j++){
            const agent = nodes[i].agents[j];
            if(!agent.active) continue;
            agent.externalCallTime++;

            if(agent.externalCallTime < agent.externalCallMaxTime) continue;
            agent.externalCallTime = 0;

            const originElement = document.querySelectorAll(".h-path")[(agent.nodeIndex - 1)];
            const agentNode = document.getElementById("node-"+agent.nodeIndex);
            if(!originElement || !agentNode) continue;

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

            agent.state++;
            const logMessage = "Agent-{"+agent.id+"} on Node {"+agent.nodeIndex+"} called "+externalConsoleMessages[externalPathIndex];
            let nextPath = [
                {element:".spine-path", vertical:true, startPosition:(agent.nodeIndex - 1), endPosition:null},
                {element:external, vertical:true, startPosition:0, endPosition:null}
            ];
            spawnOrb("success", agent.id, agent.nodeIndex, null, originElement, false, position, null, nextPath, logMessage, externalPathIndex);
        }
    }
}
function internalCallLogic(internalCallCountDown, agentCount, nodes){
    internalCallCountDown--;
    if(internalCallCountDown > 0) return internalCallCountDown;

    internalCallCountDown = Math.floor(Math.random() * 7) + 7;
    if(agentCount < 2) return internalCallCountDown;

    let loopNum = 0, agentIndex1, agentIndex2, agentDiv1, agent1, agent2;
    while(true){
        loopNum++
        if(loopNum > 100) break;
        agentIndex1 = randomInteger(0, agentCount-1);
        agentIndex2 = randomInteger(0, agentCount-1);
        agentDiv1 = document.getElementById("agent-"+agentIndex1);
        if(agentIndex1 !== agentIndex2 && agentDiv1) break;
    }

    if(!agentDiv1) return internalCallCountDown;
    for(let i = 0; i < nodes.length; i++){
        for(let j = 0; j < nodes[i].agents.length; j++){
            const agent = nodes[i].agents[j];
            if(agent.id === agentIndex1) agent1 = agent;
            if(agent.id === agentIndex2) agent2 = agent;
        }
    }
        
    if(!agent1 || !agent2) return internalCallCountDown;
    if(!agent1.active || !agent2.active) return internalCallCountDown;
    agentDiv1.style.animation = "internal-pulse ease-in-out 0.5s";
    agentDiv1.onanimationend = ()=>{
        agentDiv1.style.animation = "none";
        agentDiv1.onanimationend = null;
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

    agent1.state++;
    const mode = getPathMode();
    if(mode === 0 && (agent1.nodeIndex - 1) % 2 === 1) startPosition = 1 - startPosition;
    if(mode === 0 && (agent2.nodeIndex - 1) % 2 === 1) endPosition = 1 - endPosition;
    let nextPath = [];
    if(agent1.nodeIndex !== agent2.nodeIndex){
        nextPath.push({element:".spine-path", vertical:true, startPosition:(agent1.nodeIndex - 1), endPosition:(agent2.nodeIndex - 1)});
        nextPath.push({element:"#h-path-"+agent2.nodeIndex, vertical:false, startPosition:0, endPosition:endPosition});
        spawnOrb("internal", agent1.id, agent1.nodeIndex, agent2.nodeIndex, originElement, false, startPosition, null, nextPath, null, null);
    }
    else spawnOrb("internal", agent1.id, agent1.nodeIndex, agent2.nodeIndex, originElement, false, startPosition, endPosition, nextPath, null, null);
    consoleLog("Agent-{"+agent1.id+"} on Node {"+agent1.nodeIndex+"} sent an internal message to Agent-{"+agent2.id+"} on Node {"+agent2.nodeIndex+"}");
    return internalCallCountDown;
}

/*--Orb Logic----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function getPathMode(){
    let mode = 0;
    if(window.innerWidth < 780 || (window.innerWidth > 1000 && window.innerWidth < 1466)) mode = 1;
    return mode;
}
function spawnOrb(type, agentID, nodeIndexStart, nodeIndexEnd, originElement, vertical, startPosition, endPosition, nextPath, logMessage, externalPathIndex){
    if(!originElement) return;
    const orb = document.createElement("div");
    let animationDelay = (nodeIndexStart - 1) * 0.5;
    switch(type){
        default: orb.className = "orb"; break;
        case "internal": orb.className = "orb orb-internal"; break;
        case  "success": orb.className = "orb orb-success";  break;
        case    "retry": orb.className = "orb orb-retry";    break;
        case     "fail": orb.className = "orb orb-fail";     break;
    }

    orb.style.animationDuration = "1s";
    if(vertical){
        orbLogicVertical(orb, nodeIndexStart, nodeIndexEnd, startPosition, endPosition);
        animationDelay = 0;
    }
    else animationDelay = orbLogicHorizontal(orb, nodeIndexStart, nodeIndexEnd, startPosition, endPosition, animationDelay);
    orb.style.animationDelay = animationDelay + "s";
    orb.dataset.agentStart = JSON.stringify(agentID);
    orb.dataset.origin = JSON.stringify(agentID);

    originElement.appendChild(orb);
    orb.onanimationstart = ()=>{orb.dataset.agentStart = ""}
    orb.onanimationend = ()=>{orbAnimationEnd(orb, type, agentID, nodeIndexStart, nodeIndexEnd, endPosition, nextPath, logMessage, externalPathIndex)}
}
function orbLogicVertical(orb, nodeIndexStart, nodeIndexEnd, startPosition, endPosition){
    const mode = getPathMode();
    orb.style.setProperty("--orb-left", "0%");
    orb.style.setProperty("--orb-top", "100%");

    if(startPosition > 0){
        if(mode === 1) orb.style.top = startPosition * 6.5 + "rem";
        else orb.style.top = Math.floor(startPosition / 2) * 2 * 3.5 + "rem";
    }
    if(endPosition !== null){
        let endCoords;
        if(mode === 1){
            orb.style.top = startPosition * 6.5 + "rem";
            endCoords = endPosition * 6.5 + "rem";
        }
        else{
            orb.style.top = Math.floor(startPosition / 2) * 2 * 3 + "rem";
            endCoords = Math.floor(endPosition / 2) * 2 * 3 + "rem";
        }
        orb.style.setProperty("--orb-top", endCoords);

        function getRow(id, mode){
            if(mode === 1) return id - 1;
            return Math.floor((id - 1) / 2);
        }
        let indexS = getRow(nodeIndexStart, mode);
        let indexE = getRow(nodeIndexEnd, mode);

        let rowDist = Math.abs(indexE - indexS);
        orb.style.animationDuration = 0.25 * rowDist + "s";
    }
}
function orbLogicHorizontal(orb, nodeIndexStart, nodeIndexEnd, startPosition, endPosition, animationDelay){
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
            if(endPosition !== null){
                let endCoords = endPosition * 12 + "rem";
                orb.style.setProperty("--orb-left", endCoords);
                orb.style.setProperty("--orb-top", "0%");
                orb.style.left = "100%";
            }
            else{
                orb.style.setProperty("--orb-left", "100%");
                orb.style.setProperty("--orb-top", "0%");
                if(startPosition > 0) orb.style.left = startPosition * 12 + "rem";
            }
        }
    }
    else{
        animationDelay += startPosition * 0.25;
        orb.style.setProperty("--orb-left", "100%");
        orb.style.setProperty("--orb-top", "0%");
        if(startPosition > 0) orb.style.left = startPosition * 12 + "rem";
    }
    return animationDelay;
}
function orbAnimationEnd(orb, type, agentID, nodeIndexStart, nodeIndexEnd, endPosition, nextPath, logMessage, externalPathIndex){
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
        else{
            const mode = getPathMode();
            let childIndex = endPosition;
            if(mode === 0 && (nodeIndexEnd - 1) % 2 === 1) childIndex = 1 - endPosition;
            try{
                const endNode = document.getElementById("node-"+nodeIndexEnd);
                const endNodeBody = endNode.children[1];
                const endAgent = endNodeBody.children[childIndex];
                endAgent.style.animation = "internal-pulse ease-in-out 0.5s";
                endAgent.onanimationend = ()=>{
                    endAgent.style.animation = "none";
                    endAgent.onanimationend = null;
                }
            }
            catch{}
        }
    }
    else{
        const nextPathObject = nextPath.shift();
        const nextPathElement = document.querySelector(nextPathObject.element);
        spawnOrb(
            type, agentID, nodeIndexStart, nodeIndexEnd, nextPathElement, nextPathObject.vertical,
            nextPathObject.startPosition, nextPathObject.endPosition,
            nextPath, logMessage, externalPathIndex
        );
    }
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

        buttonSide.addEventListener("click", ()=>{chaoButtonClick(true)});
        button.addEventListener("click", ()=>{chaoButtonClick(false)});
        activeList.push(false);

        function chaoButtonClick(side){
            buttonIconSide.classList.add("chaos-button-icon-active");
            buttonSide.classList.add("chaos-button-active");
            buttonIcon.classList.add("chaos-button-icon-active");
            button.classList.add("chaos-button-active");
            activeList[i] = true;
            if(side) chaosSideBar();

            if(!allChaosButtonsActive(activeList)) return;
            const CTAbar = document.querySelector(".CTA-bar");
            CTAbar.style.animation = "CTA-bar-slide ease-in-out 0.25s";
            CTAbar.onanimationend = ()=>{
                CTAbar.classList.add("CTA-bar-extended");
                CTAbar.style.animation = "none";
                CTAbar.onanimationend = null;
            }
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

    loadChaosButtonEvents();
}
function allChaosButtonsActive(activeList){
    for(let i = 0; i < activeList.length; i++){
        if(!activeList[i]) return false;
    }
    return true;
}
function loadChaosButtonEvents(){
    const chaosID = [
        "trigger-agent", "kill-node", "fail-interaction", "suspend-agent",
        "inject-defect", "troubleshoot", "update-agent"
    ];
    for(let i = 0; i < chaosID.length; i++){
        document.getElementById(chaosID[i]).onclick = ()=>{chaosTriggerButton(i)}
        document.getElementById("side-"+chaosID[i]).onclick = ()=>{chaosTriggerButton(i)}
    }
}
function chaosTriggerButton(index){
    const innerHTML = getChaosPopupText(index);
    const popUpText = document.querySelector(".pop-up-text");
    popUpText.innerHTML = innerHTML;

    fadeIn("#pop-up-mask", "block", 0.1, ()=>{
        const pauseLoopEvent = new Event("pause-loop");
        window.dispatchEvent(pauseLoopEvent);
    });

    const chaosEvents = [
        "add-agent", "kill-node", "fail-interaction", "suspend-agent",
        "inject-defect", "troubleshoot", "update-agent"
    ];

    function closeModal(){
        fadeOut("#pop-up-mask", 0.1, ()=>{
            setTimeout(()=>{
                const resumeLoopEvent = new Event("resume-loop");
                window.dispatchEvent(resumeLoopEvent);

                const chaosEvent = new Event(chaosEvents[index]);
                window.dispatchEvent(chaosEvent);
            }, 250);
        });
    }

    document.getElementById("pop-up-window").onclick = (e)=>{e.stopPropagation()}
    document.getElementById("pop-up-close").onclick = closeModal;
    document.getElementById("pop-up-mask").onclick = closeModal;
}
function getChaosPopupText(index){
    const allHTMLs = [
        `
        <b>Outcome:</b><br> New agent created
        instantly via Golem's built-in
        API — no extra setup.<br><br>
        <b>Guarantee:</b><br> Starts isolated,
        logged, and ready in
        milliseconds.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Web servers · Auth plumbing ·
        Message brokers
        `,
        `
        <b>Outcome:</b><br> Node goes offline;
        its agents resume
        automatically on a healthy
        node.<br><br>
        <b>Guarantee:</b><br> No lost state, no
        duplicate work.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Leader election/consensus ·
        Idempotency tables
        `,
        `
        <b>Outcome:</b><br> External call
        (API/tool/message) fails, then
        retries automatically.<br><br>
        <b>Guarantee:</b><br> Exactly-once
        execution for external side
        effects; durable delivery for
        internal messages — no
        double charges, no missed
        signals.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Retry queues · Dead-letter
        handling ·
        Backoff/orchestration code
        `,
        `
        <b>Outcome:</b><br> Running agent
        pauses without incurring cost.<br><br>
        <b>Guarantee:</b><br> Unlimited pause
        with durable state; resumes
        instantly. Supports human
        approval, scheduled
        wake-ups, and idle standby.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Cron services · Polling loops ·
        Custom timers
        `,
        `
        <b>Outcome:</b><br> Faulty agent
        contained; other agents
        unaffected.<br><br>
        <b>Guarantee:</b><br> Process, data,
        and permission isolation —
        one agent can't crash, read, or
        act as another.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Container hardening ·
        RBAC/least-privilege wiring
        `,
        `
        <b>Outcome:</b><br> Full execution
        history appears with rewind
        and safe replay<br><br>
        <b>Guarantee:</b><br> Roll back to an
        earlier point to correct
        dead-ends and errant AI
        decisions.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Distributed tracing stack ·
        One-off debug tooling
        `,
        `
        <b>Outcome:</b><br> Ship a new version
        side-by-side or migrate live
        agents without downtime.<br><br>
        <b>Guarantee:</b><br> Zero-downtime
        upgrades with controlled
        roll-forward.<br><br>
        <b>Infrastructure You Avoid:</b><br>
        Rolling-deploy scripts ·
        Drain/coordination logic
        `
    ];

    return allHTMLs[index]
}
