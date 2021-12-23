const nameArea = document.getElementById("name-area");
const nameDisplay = document.getElementById("name-display");
const signInForm = document.getElementById("sign-in-form");
const signInButton = document.getElementById("sign-in-button");
const signOut = document.getElementById("sign-out");
const authDialog = document.getElementById("auth-dialog");
const backDrop = document.getElementById("back-drop");
const rulesButton = document.getElementById("rules-button");
const rulesDialog = document.getElementById("rules-dialog");
const rankingButton = document.getElementById("ranking-button");
const rankingDialog = document.getElementById("ranking-dialog");
const settingsDialog = document.getElementById("settings-dialog");
const leaveDialog = document.getElementById("leave-dialog");
const startButton = document.getElementById("play-button");
const settingsForm = document.getElementById("settings-form");
const errMessage = document.getElementById("error-message");
const leaveCancel = document.getElementById("button-cancel");
const leaveConfirm = document.getElementById("button-confirm");
const submitButton = document.getElementById("start-submit");

const url = "http://twserver.alunos.dcc.fc.up.pt:8008/"//"http://localhost:8008/";

const requestHandler = new RequestHandler();
let user = null;

function showUsername()
{
    signInButton.classList.add("hidden");
    nameDisplay.innerText = user.nick;
    nameArea.classList.remove("hidden");
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
    
    fetch("http://twserver.alunos.dcc.fc.up.pt:8008/register", {  // http://localhost:8008/register
        method: "POST",
        body: JSON.stringify(params)
    })
    .then((r) => {
        if (r.status === 200)
        {
            user = new User(params.nick, params.password);
            errMessage.classList.add("hidden");
            hideDialog(authDialog);
            showUsername();
            saveCredentials(user.nick, user.password);
        }
        else if (r.status === 401)
        {
            errMessage.classList.remove("hidden");
        }
    })
    .catch(console.log);
});


function setDialogEvent(button, dialog)
{
    dialog.addEventListener("click", (event) => {event.stopPropagation()});
    button.addEventListener("click",
                                        () => {
                                            showDialog(dialog);
                                    });
}

setDialogEvent(signInButton, authDialog);
setDialogEvent(rulesButton, rulesDialog);
setDialogEvent(rankingButton, rankingDialog);
setDialogEvent(startButton, settingsDialog);

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
    user = null;
    if (typeof(Storage) !== undefined)
    {
        localStorage.removeItem("nick");
        localStorage.removeItem("password");
    }
    nameArea.classList.add("hidden");
    signInButton.classList.remove("hidden");
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

        if (requestHandler.isSearchingForGame()) // Searching
        {
            requestHandler.leave();
        }
        else if (params["oppo-select"] === "human") // !Searching
        {
            requestHandler.join(size, seeds);
            submitButton.value = "Cancel search";
        }
        else
        {
            settingsDialog.classList.add("hidden");
            backDrop.classList.add("hidden");
            new Game(user.nick, "AI (" + params["difficulty-select"] + ")", size, seeds, params["side-select"] == "First" ? true : false, new Bot(params["difficulty-select"], null));
        }

    }
});
// const data = {id: 1, user: {name: user.name, password: user.password}, pos: 3};
// fetch("http://localhost:8008/notify", {
//     method: "POST",
//     body: JSON.stringify(data)
// });