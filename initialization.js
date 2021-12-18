const signInButton = document.getElementById("sign-in-button");
const authDialog = document.getElementById("auth-dialog");
const backDrop = document.getElementById("back-drop");
const rulesButton = document.getElementById("rules-button");
const rulesDialog = document.getElementById("rules-dialog");
const rankingButton = document.getElementById("ranking-button");
const rankingDialog = document.getElementById("ranking-dialog");
const settingsDialog = document.getElementById("settings-dialog");
const startButton = document.getElementById("play-button");

function setDialogEvent(button, dialog)
{
    dialog.addEventListener("click", (event) => {event.stopPropagation()});
    button.addEventListener("click",
                                        () => {
                                            backDrop.classList.remove("hidden");
                                            dialog.classList.remove("hidden");
                                    });
}

setDialogEvent(signInButton, authDialog);
setDialogEvent(rulesButton, rulesDialog);
setDialogEvent(rankingButton, rankingDialog);
setDialogEvent(startButton, settingsDialog);

backDrop.addEventListener("click",
                                    () => {
                                        backDrop.classList.add("hidden");
                                        Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
                            });

////////////////////

const game = new Game("Player 1", "Player 2", 6, 5, true);
game.addBot(0);
// gameBoard = new GameBoard(6, 5);
// gameBoard.render(document.getElementById("game-board"));
