const nameArea = document.getElementById("name-area");
const nameDisplay = document.getElementById("name-display");
const signInForm = document.getElementById("sign-in-form");
const signInButton = document.getElementById("sign-in-button");
const signOut = document.getElementById("sign-out");
const authDialog = document.getElementById("auth-dialog");
const backDrop = document.getElementById("back-drop");
const rulesButton = document.getElementById("rules-button");
const rulesDialog = document.getElementById("rules-dialog");
const localRankingButton = document.getElementById("local-ranking-button");
const localRankingDialog = document.getElementById("local-ranking-dialog");
const globalRankingButton = document.getElementById("global-ranking-button");
const globalRankingDialog = document.getElementById("global-ranking-dialog");
const settingsDialog = document.getElementById("settings-dialog");
const leaveDialog = document.getElementById("leave-dialog");
const startButton = document.getElementById("play-button");
const settingsForm = document.getElementById("settings-form");
const errMessage = document.getElementById("error-message");
const leaveCancel = document.getElementById("button-cancel");
const leaveConfirm = document.getElementById("button-confirm");
const submitButton = document.getElementById("start-submit");
const initialSignInButton = document.getElementById("initial-sign-in-button");
const initialPageText = document.getElementById("initial-page-text");

// My debug server
const url = "http://localhost:8008/";

// My twserver
// const url = "http://twserver.alunos.dcc.fc.up.pt:8930/";

// LTW Server
// const url = "http://twserver.alunos.dcc.fc.up.pt:8008/";

const requestHandler = new RequestHandler();
let user = null;
let game = null;
let  globalRankings = null;
let  localRankings = getLocalRankings();

function getLocalRankings()
{
    if (typeof(Storage) !== undefined)
    {
        return JSON.parse(localStorage.getItem("rankings") ?? JSON.stringify({ ranking: [] })).ranking;
    }
}

function updateRankings(winner)
{
    if (typeof(Storage) !== undefined)
    {
        let i = localRankings.findIndex((v) => v.nick == user.nick);
        
        if (i == -1)
        {
            i = localRankings.push({ nick: user.nick, victories: 0, games: 0 }) - 1;
        }

        localRankings[i].games++;

        if (winner)
        {
            localRankings[i].victories++;
        }

        localStorage.setItem("rankings", JSON.stringify({ ranking: localRankings }));
    }
}

function showUsername()
{
    initialSignInButton.classList.add("hidden");
    signInButton.classList.add("hidden");
    
    nameDisplay.innerText = user.nick;
    initialPageText.innerText = "Start a game against our powerful AI or search for a game against another player and climb the ranking with every win you get."
    
    nameArea.classList.remove("hidden");
    startButton.classList.remove("hidden");
}

function showGuestPage()
{
    nameArea.classList.add("hidden");
    startButton.classList.add("hidden");
    document.getElementById("game-area").classList.add("hidden");

    initialPageText.innerText = "Create an account or sign in to start playing! Compete against other players or play against out powerful AI!"

    document.getElementById("initial-page").classList.remove("hidden");
    signInButton.classList.remove("hidden");
    initialSignInButton.classList.remove("hidden");
}

function showDialog(dialog)
{
    backDrop.classList.remove("hidden");
    dialog.classList.remove("hidden");
}

function hideDialog(dialog)
{
    backDrop.classList.add("hidden");
    dialog.classList.add("hidden");
}

function saveCredentials(name, password)
{   
    if (typeof(Storage) !== undefined)
    {
        localStorage.setItem("nick", name);
        localStorage.setItem("password", password);
    }
}

if (typeof(Storage) !== undefined)
{
    const name = localStorage.getItem("nick");
    const password = localStorage.getItem("password");

    if (name !== null && password !== null)
    {
        user = new User(name, password);
        showUsername();
    }
}

signInForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(signInForm);
    const props = ["nick", "password"];

    const params = props.reduce((p, c) => ({...p, [c]: data.get(c)}), {});
    
    fetch(url + "register", {
        method: "POST",
        body: JSON.stringify(params)
    })
    .then((r) => {
        if (r.ok)
        {
            user = new User(params.nick, params.password);
            errMessage.classList.add("hidden");
            hideDialog(authDialog);
            showUsername();
            saveCredentials(user.nick, user.password);
        }
        else
        {
            r.json().then((j) => {
                errMessage.innerText = j.error;
                errMessage.classList.remove("hidden");
            })
            .catch(console.log);
        }
    })
    .catch(() => {
        errMessage.innerText = "Couldn't connect to the server.";
        errMessage.classList.remove("hidden");
    });
});

function buildRankingTable(rankings)
{
    const table = document.createElement("table");

    table.innerHTML = ` <tr>
                            <th>Pos</th>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Games</th>
                        </tr>`;

    rankings.forEach((v, i) => {
        const row = document.createElement("tr");

        row.innerHTML =  `  <tr>
                                <td>${i + 1}</td>
                                <td>${v.nick}</td>
                                <td>${v.victories}</td>
                                <td>${v.games}</td>
                            </tr>`;

        table.appendChild(row);
    });

    return table;
}

function setDialogEvent(button, dialog)
{
    dialog.addEventListener("click", (event) => {event.stopPropagation()});
    button.addEventListener("click",
                                        () => {
                                            showDialog(dialog);
                                    });
}

setDialogEvent(initialSignInButton, authDialog);
setDialogEvent(signInButton, authDialog);
setDialogEvent(rulesButton, rulesDialog);
setDialogEvent(startButton, settingsDialog);

function openLocalRanking()
{
    localRankings = getLocalRankings();

    if (localRankings.length == 0)
    {
        localRankingDialog.innerHTML = `   <h2>Local Ranking</h2>
                                            Local ranking is empty.`;
    }
    else
    {
        localRankingDialog.innerHTML = `   <h2>Local Ranking</h2>`;
        localRankingDialog.appendChild(buildRankingTable(localRankings));
    }

    const img = document.createElement("img");
    img.src = "logo.png";
    img.width = "64";
    img.height = "64";
    localRankingDialog.appendChild(img);

    showDialog(localRankingDialog);
}

function openGlobalRanking()
{
    requestHandler.getRanking()
    .then((r) => {
        globalRankings = r.ranking;

        if (globalRankings.length == 0)
        {
            globalRankingDialog.innerHTML = `   <h2>Global Ranking</h2>
                                                Global ranking is empty.`;
        }
        else
        {
            globalRankingDialog.innerHTML = `   <h2>Global Ranking</h2>`;
            globalRankingDialog.appendChild(buildRankingTable(globalRankings));
        }

        const img = document.createElement("img");
        img.src = "logo.png";
        img.width = "64";
        img.height = "64";
        globalRankingDialog.appendChild(img);

        showDialog(globalRankingDialog);
    })
    .catch(console.log);
}

localRankingDialog.addEventListener("click", (event) => {event.stopPropagation()});
localRankingButton.addEventListener("click", openLocalRanking);

globalRankingDialog.addEventListener("click", (event) => {event.stopPropagation()});
globalRankingButton.addEventListener("click", openGlobalRanking);

leaveConfirm.addEventListener("click", 
                                    () => {
                                        backDrop.classList.add("hidden");
                                        Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
});

leaveCancel.addEventListener("click", 
                                    () => {
                                        backDrop.classList.add("hidden");
                                        Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
});

backDrop.addEventListener("click",
                                    () => {
                                        backDrop.classList.add("hidden");
                                        Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
                            });

signOut.addEventListener("click", () => {
    let ongoingGame = null;

    if (game != null && game.winner == undefined)
    {    
        ongoingGame = game;
    }
    else if (requestHandler.game != null && requestHandler.game.winner == undefined)
    {
        ongoingGame = requestHandler.game;
    }

    if (ongoingGame != null)
    {
        ongoingGame.displayError("Can't sign out during a match!");
        return;
    }
    
    user = null;

    if (typeof(Storage) !== undefined)
    {
        localStorage.removeItem("nick");
        localStorage.removeItem("password");
    }
    
    const buttonsDiv = document.getElementById("buttons-div");

    if (buttonsDiv != null && buttonsDiv.contains(startButton))
    {
        buttonsDiv.removeChild(startButton);
        startButton.classList.remove("game-button");
        startButton.classList.add("initial-button");
        startButton.innerText = "Start Game";
        document.querySelector(".home-buttons").appendChild(startButton);
    }

    showGuestPage();
});

settingsForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(settingsForm);
    const props = ["house-select", "seeds-select", "oppo-select", "difficulty-select", "side-select"];
    const params = props.reduce((p, c) => ({...p, [c]: data.get(c)}), {});
    
    if (user != undefined)
    {
        requestHandler.setUser(user);
        const seeds = parseInt(params["seeds-select"]);
        const size = parseInt(params["house-select"]);

        if (requestHandler.isSearchingForGame())
        {
            requestHandler.leave();
        }
        else if (params["oppo-select"] === "human")
        {
            requestHandler.join(size, seeds);
            submitButton.innerText = "Cancel search";
        }
        else
        {
            settingsDialog.classList.add("hidden");
            backDrop.classList.add("hidden");
            game = new Game(user.nick, "AI (" + params["difficulty-select"] + ")", size, seeds, params["side-select"] == "First" ? true : false, new Bot(params["difficulty-select"], null));
        }
    }
});