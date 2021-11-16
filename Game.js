const GameState = require('./GameState'); // Apagar

class Game
{
    playerOne;
    playerTwo;
    game;

    constructor(size, numSeeds, starterSide, players)
    {
        this.game = new GameState(size, numSeeds);
        
        if (players.length !== 2)
        {
            return;
        }

        if (starterSide)
        {
            [this.playerOne, this.playerTwo] = players;
        }
        else
        {
            [this.playerTwo, this.playerOne] = players;   
        }
    }

    async run()
    {
        console.log(this.game.toString());
        while (!this.game.isFinal())
        {   
            // await new Promise(resolve => setTimeout(resolve, 1000));
            
            const player = this.game.player ? this.playerOne : this.playerTwo

            while ((await player.play(this.game)) < 0);
            console.log(this.game.toString());
        }

        const score = this.game.score();

        console.log((score > 0 ? "Player 1 wins! (" + score + ")" : (score < 0 ? "Player 2 wins! (" + -score + ")" : "It's a draw")));
    }
}

module.exports = Game; // Apagar