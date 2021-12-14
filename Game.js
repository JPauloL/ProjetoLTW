const GameState = require('./GameState'); // Apagar

class Game
{
    playerOne;
    playerTwo;
    game;
    lastPlayTime;

    constructor(state, starterSide, players)
    {
        if (players.length !== 2)
        {
            return;
        }

        this.game = state;
        this.player = starterSide;
        [this.playerOne, this.playerTwo] = players;
    }

    async start()
    {
        // Colocar um limite de tempo para a jogada (se passar o limite, o jogador perder o jogo)
        // setInterval(() => {}, 60000);        

        const player = this.game.player ? this.playerOne : this.playerTwo

        const score = this.game.score();
    }

    notifyPlayers()
    {
        // Substituir por server comms
        this.playerOne.update(this.player, this.game.state);
        this.playerTwo.update(!this.player, this.game.state);
    }

    play(pos)
    {
        this.game.play(pos);
        this.notifyPlayers();
    }
}

module.exports = Game; // Apagar