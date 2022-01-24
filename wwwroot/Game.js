class Game
{
    playerOne;
    playerTwo;
    bot;
    gameBoard;
    scoreboard;
    message;
    state;
    winner;
    isPlaying;
    requestHandler;

    constructor(playerOne, playerTwo, size, seeds, player, bot, requestHandler)
    {    
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.isPlaying = false;
        this.bot = bot;
        this.requestHandler = requestHandler;
        this.state = new GameState(size, seeds, player);
        this.scoreboard = new Scoreboard(playerOne, playerTwo); 
        this.message = new Message((this.state.player ? playerOne : playerTwo) + "'s turn");
        this.gameBoard = new GameBoard(size, seeds, this);
        const buttonsDiv = this.createButtonsDiv();

        const gameArea = document.getElementById("game-area");
        gameArea.innerHTML = "";

        gameArea.appendChild(this.scoreboard.render());
        gameArea.appendChild(this.message.render());
        gameArea.appendChild(this.gameBoard.render());
        gameArea.appendChild(buttonsDiv);

        document.getElementById("initial-page").classList.add("hidden");
        document.getElementById("game-area").classList.remove("hidden");

        this.gameBoard.displaySeeds();

        if (this.state.player) 
        {
            this.gameBoard.setClickableHouses(true);
        }
        else if (this.requestHandler === undefined)
        {
            setTimeout(() => this.opponentPlay(this.bot.play(this.state)), this.bot.difficulty != "Hard" ? 1000 : 0);
        }

    }

    createButtonsDiv()
    {
        const buttonsDiv = document.createElement("div");
        buttonsDiv.id = "buttons-div";

        const rules = document.createElement("button");
        rules.classList.add("game-button");
        rules.innerText = "Rules";
        setDialogEvent(rules, rulesDialog);

        const rankingDiv = document.createElement("div");

        const localRanking = document.createElement("button");
        localRanking.classList.add("game-button");
        localRanking.innerText = "Local Ranking";
        localRanking.addEventListener("click", openLocalRanking);

        const globalRanking = document.createElement("button");
        globalRanking.classList.add("game-button");
        globalRanking.innerText = "Global Ranking";
        globalRanking.addEventListener("click", openGlobalRanking)

        rankingDiv.appendChild(localRanking);
        rankingDiv.appendChild(globalRanking);

        const giveUp = document.createElement("button");
        giveUp.id = "give-up-button";
        giveUp.classList.add("game-button");
        giveUp.innerText = "Give Up";
        setDialogEvent(giveUp, leaveDialog);

        buttonsDiv.appendChild(rules);
        buttonsDiv.appendChild(rankingDiv);
        buttonsDiv.appendChild(giveUp);

        leaveConfirm.addEventListener("click", 
                                                () => {
                                                    if (this.requestHandler !== undefined && this.winner == undefined)
                                                    {
                                                        requestHandler.leave();
                                                    }
                                                    else if (this.winner == undefined)
                                                    {
                                                        this.winner = false;
                                                        this.finish();
                                                    }
        });

        return buttonsDiv;
    }

    setState(state, player)
    {
        this.state = new GameState(0, 0, player, state);
    }

    finish()
    {
        this.player = false;
        this.gameBoard.setClickableHouses(false);

        const buttonsDiv = document.getElementById("buttons-div");
        buttonsDiv.removeChild(document.getElementById("give-up-button"));
        startButton.classList.remove("initial-button");
        startButton.classList.add("game-button");
        startButton.innerText = "Play again";
        buttonsDiv.appendChild(startButton);

        this.updateGameMessage(...(this.winner === null ? ["It's a draw!", "gray"] : 
                                  (this.winner ? (this.state.isFinal() ? ["You win! Well played", "green"] : ["You win! Your opponent gave up", "green"]) : 
                                  (this.state.isFinal() ? ["You lose! Better luck next time", "red"] : ["You lose! You gave up", "red"]))));
        this.gameBoard.finishGame(this.state.getBank(true), this.state.getBank(false));
        this.updateScoreboard();
        
        if (this.bot !== undefined)
        {
            updateRankings(this.winner);
        }
    }

    selfPlay(pos)
    {
        if (this.isPlaying || !this.state.getPlayer() || this.winner !== undefined) return -1;

        if (this.requestHandler === undefined) 
        {
            if (this.state.play(pos) < 0) return -1;
            this.play(pos, this.state.getPlayer());
        }
        else
        {
            this.requestHandler.notify(pos);
        }
        
        return 0;
    }

    opponentPlay(pos)
    {
        if (this.isPlaying || this.state.getPlayer() || this.state.play(pos) < 0 || this.winner !== undefined) return -1;
        
        this.play((this.state.getSize() / 2) + pos, this.state.getPlayer());
        
        return 0;
    }

    play(pos, player)
    {
        if (pos < 0) 
        {
            if (player) this.gameBoard.setClickableHouses(true);
            return;
        }
        
        this.isPlaying = true;
        this.gameBoard.play(pos);
        this.updateScoreboard();
        
        if (this.state.isFinal() && (this.requestHandler === undefined || this.requestHandler === null))
        {
            const score = this.state.getGameScore();
            this.winner = score === 0 ? null : score > 0;
            this.finish();
            return;
        }
        
        this.isPlaying = false;

        if (player)
        {
            this.gameBoard.setClickableHouses(true);
        }
    
        this.updateGameMessage((player ? this.playerOne : this.playerTwo) + "'s turn")


        if (this.bot !== null && !player)
        {
            setTimeout(() => this.opponentPlay(this.bot.play(this.state)), this.bot.difficulty != "Hard" ? 1000 : 0);
        }
    }

    updateScoreboard()
    {
        this.scoreboard.update(this.state.getPlayerScore(true), this.state.getPlayerScore(false));
    }

    updateGameMessage(message, color)
    {
        this.message.update(message, color);
    }

    displayError(message)
    {
        this.message.error(message);
    }
}