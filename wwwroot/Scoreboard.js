class Scoreboard
{
    element;
    playerOneScore;
    playerTwoScore;

    createPlayerColumn(player)
    {
        const col = document.createElement("div");
        col.classList.add("score-column");

        const name = document.createElement("div");
        name.classList.add("name-display");
        name.innerText = player;

        const score = document.createElement("div");
        score.classList.add("score-display");
        score.innerText = "0";

        col.appendChild(name);
        col.appendChild(score);

        return [col, score];
    }

    constructor(playerOne, playerTwo)
    {
        this.element = document.createElement("div");
        this.element.id = "score-board";

        let playerOneCol;
        let playerTwoCol;

        [playerOneCol, this.playerOneScore] = this.createPlayerColumn(playerOne);
        [playerTwoCol, this.playerTwoScore] = this.createPlayerColumn(playerTwo);

        this.element.appendChild(playerTwoCol);
        this.element.appendChild(playerOneCol);
    }

    update(scoreOne, scoreTwo)
    {
        this.playerOneScore.innerText = scoreOne;
        this.playerTwoScore.innerText = scoreTwo;
    }

    render()
    {
        return this.element;
    }
}