function createBank(b)
{
    const bank = document.createElement("div");
    bank.id = b ? "player-bank" : "oppo-bank";
    bank.classList.add("bank");

    return bank;
}

function createPit(id, seeds)
{
    const pit = document.createElement("div");
    pit.classList.add("pit");
    // pit.addEventListener("click", () => /*play (id)*/2);
    
    return pit;
}

function createBoard(size, seeds)
{
    // const gameStats = document.getElementById("game-stats");
    const gameBoard = document.getElementById("game-board");
    const pitsDiv = document.createElement("pits-div");
    pitsDiv.id = "pits-div";
    pitsDiv.style.width = (size * 108).toString(10) + "px"; // substituir 

    gameBoard.appendChild(createBank(false));
    
    for (let i = size * 2 + 1; i > 0; i--)
    {
        if (i === size + 1) continue;
        
        pitsDiv.appendChild(createPit(i, seeds));
        console.log(i);
    }
    
    gameBoard.appendChild(pitsDiv);
    gameBoard.appendChild(createBank(true));
    document.getElementById("game-area").classList.remove("hidden");
    document.getElementById("initial-page").classList.add("hidden");
}