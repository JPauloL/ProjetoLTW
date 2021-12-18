class Game
{
    playerOne;
    playerTwo;
    bot;
    gameArea;
    gameBoard;
    scoreboard;
    message;
    state;
    result;
    isPlaying;

    constructor(playerOne, playerTwo, size, seeds, player)
    {    
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.isPlaying = false;
        this.state = new GameState(size, seeds, player);
        this.scoreboard = new Scoreboard(playerOne, playerTwo); 
        this.message = new Message((this.state.player ? playerOne : playerTwo) + "'s turn");
        this.gameBoard = new GameBoard(size, seeds, this);
        this.gameArea = document.getElementById("game-area");

        this.gameArea.appendChild(this.scoreboard.render());
        this.gameArea.appendChild(this.message.render());
        this.gameArea.appendChild(this.gameBoard.render());
        
        document.getElementById("initial-page").classList.add("hidden");
        document.getElementById("game-area").classList.remove("hidden");

        this.gameBoard.displaySeeds();

        if (this.state.player) 
        {
            this.gameBoard.setClickableHouses(true);
        }

    }

    addBot(difficulty)
    {
        this.bot = new Bot(difficulty);
        if (!this.state.player) this.opponentPlay(this.bot.play(this.state.state));
    }

    selfPlay(pos)
    {
        const player = this.state.getPlayer();
        console.log("Play: " + pos);
        
        if (this.isPlaying || !player || this.state.play(pos) < 0 || this.winner !== undefined) return -1;
        
        this.isPlaying = true;
        this.gameBoard.setClickableHouses(false);
        this.play(this.state.getPlayer(), pos,  this.state.getBank(player));
        return 0;
    }

    opponentPlay(pos)
    {
        const player = this.state.getPlayer();
        console.log("Play: " + pos);
        
        if (this.isPlaying || player || this.state.play(pos) < 0 || this.winner !== undefined) return -1;
     
        this.isPlaying = true;
        this.play(this.state.getPlayer(), (this.state.getSize() / 2) + pos,  this.state.getBank(player));
        
        return 0;
    }

    play(player, pos, playerBank)
    {
        this.gameBoard.play(pos, playerBank);
        this.updateScoreboard();
        
        if (this.state.isFinal())
        {
            this.player = true;
            const score = this.state.getGameScore();
            this.winner =  score > 0 ? true : (score < 0 ? false : null);

            this.updateGameMessage(...(this.winner === null ? ["It's a draw!", "gray"] : 
                                      (this.winner > 0 ? ["You win! Well played", "green"] : 
                                      ["You lose! Better luck next time", "red"])));
            this.gameBoard.finishGame(this.state.getBank(true), this.state.getBank(false));
            return;
        }
        // Descomentar para debugging 
        // console.log("Game state: " + this.state.state.toString());
        // console.log("Game board: " + this.gameBoard.toString())
        this.isPlaying = false;

        if (player) 
        {
            this.gameBoard.setClickableHouses(true);
        }
    
        setInterval(() => {
            let i = 0; // Apagar var
            while (this.bot !== null && !player && this.opponentPlay(this.bot.play(this.state.state)) != 0)
            {
                player = this.state.getPlayer();
            }
        },
            1000);
    
        this.updateGameMessage((player ? this.playerOne : this.playerTwo) + "'s turn")
    }

    updateScoreboard()
    {
        this.scoreboard.update(this.state.getPlayerScore(true), this.state.getPlayerScore(false));
    }

    updateGameMessage(message, color)
    {
        this.message.update(message, color);
    }
}