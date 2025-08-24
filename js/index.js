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
            if(sideBar) setTimeout(chaosSideBar, 100);

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
