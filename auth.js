const signInButton = document.getElementById("sign-in-button");
const authDialog = document.getElementById("auth-dialog");
const backDrop = document.getElementById("back-drop");
const rulesButton = document.getElementById("rules-button");
const rulesDialog = document.getElementById("rules-dialog");
const rankingButton = document.getElementById("ranking-button");
const rankingDialog = document.getElementById("ranking-dialog");
const botConfig = document.getElementById("bot-config-button");
const settingsButton = document.getElementById("settings-button");

authDialog.addEventListener("click", (event) => {event.stopPropagation()});
rulesDialog.addEventListener("click", (event) => {event.stopPropagation()});
rankingDialog.addEventListener("click", (event) => {event.stopPropagation()});

signInButton.addEventListener("click", 
                                        () => {
                                            backDrop.classList.remove("hidden");
                                            authDialog.classList.remove("hidden");
                                });
                                
rulesButton.addEventListener("click",
                                    () => {
                                        backDrop.classList.remove("hidden");
                                        rulesDialog.classList.remove("hidden");
                            });

rankingButton.addEventListener("click",
                                    () => {
                                        backDrop.classList.remove("hidden");
                                        rankingDialog.classList.remove("hidden");
                            });

settings.addEventListener("click",
                                    () => {
                                        backDrop.classList.remove("hidden");
                                        rankingDialog.classList.remove("hidden");
                            });

backDrop.addEventListener("click", 
                                    ()=> {
                                        backDrop.classList.add("hidden");
                                        Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
                            });
