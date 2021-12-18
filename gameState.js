class GameState
{
    state;
    player;

    constructor(size, numSeeds, player)
    {
        this.state = Array(2 * (size + 1)).fill(1).map((_, i, arr) => i % (arr.length / 2) == 0 ? 0 : numSeeds);
        this.player = player;
    }

    getPlayer()
    {
        return this.player;
    }

    getSize()
    {
        return this.state.length;
    }

    getState()
    {
        // console.log(this.state.slice(this.state.length / 2).concat(this.state.slice(0, this.state.length / 2)));
        return this.player ? this.state : this.state.slice(this.state.length / 2).concat(this.state.slice(0, this.state.length / 2)); // Trocar os lados 
    }

    getBank(player) 
    {
        return player ? this.state.length / 2 : 0;
    }

    getPlayerScore(player)
    {
        return this.state[this.getBank(player)];
    }

    // Evitar usar ()
    playerScore(player)
    {
        const len = this.state.length;
        let params = [(player ? 1 : (len / 2) + 1), (player ? (len / 2) : len)]
        return this.state.slice(...params).reduce((prev, cur) => prev + cur);
    }

    isFinal()
    {
        return this.playerScore(this.player) == 0 || this.playerScore(!this.player) == 0;
        // const len = this.state.length;
        // return this.state.slice(1, (len / 2) - 1).reduce((prev, cur) => prev + cur) == 0 
        //     || this.state.slice((len / 2) + 1, len).reduce((prev, cur) => prev + cur) == 0;
    }


    getGameScore()
    {
        return this.state[this.getBank(true)] - this.state[this.getBank(false)];
    }

    // Evitar usar
    getScore()
    {
        const [playersBank, oppoBank] = [this.getBank(1), this.getBank(0)];
        return (this.state[playersBank] + this.playerScore(1)) - (this.state[oppoBank] + this.playerScore(0));
    }

    finishGame()
    {
        const [playersBank, oppoBank] = [this.getBank(true), this.getBank(false)];
        
        const len = this.state.length;
        // this.state[playersBank] += this.state.slice(1, playersBank - 1).reduce((prev, cur) => prev + cur); 
        // this.state[oppoBank] += this.state.slice(playersBank + 1, len).reduce((prev, cur) => prev + cur);

        this.state[playersBank] += this.playerScore(true);
        this.state[oppoBank] += this.playerScore(false);
    }

    isPlayerSide(pos)
    {
        const len = this.state.length;
        return pos >= 1 + ((len / 2) * !this.player) && pos < (len / (1 + this.player));
    }

    play(pos)
    {
        const normPos = this.player ? pos : pos + this.state.length / 2;
        if (pos <= 0 || pos >= (this.state.length / 2) || this.state[normPos] === 0) return -1;
        
        console.log("\n" + (this.player ? "Player 1: " : "Player 2: ") + pos + "\n");
        return this.sow(normPos);
    }

    sow(pos)
    {   
        const len = this.state.length;
        let n = this.state[pos];
        const [playersBank, oppoBank] = [this.getBank(this.player), this.getBank(!this.player)];
        this.state[pos] = 0;

        for (let i = 1; i <= n; i++)
        {
            if ((pos + i) % len == oppoBank)
            {
                n++;
                continue;
            }

            this.state[(pos + i) % len]++;
        }

        const lastPos = (pos + n) % len;
        if (lastPos != playersBank)
        {
            if (this.state[lastPos] === 1 && this.state[this.state.length - lastPos] > 0 && this.isPlayerSide(lastPos))
            {
                this.state[playersBank] += this.state[lastPos] + this.state[this.state.length - lastPos];
                this.state[lastPos] = this.state[this.state.length - lastPos] = 0;
            }

            this.player = !this.player;
        }

        if (this.isFinal()) 
        {
            this.finishGame();
        }

        return 0;
    }

    toString()
    {
        return "  " + this.state.reduce((prev, cur, i) => i > this.state.length / 2 ?  " " + cur + prev : prev, "") + "\n" 
        + this.state[0] + String(" ").repeat(this.state.length) + " " + this.state[this.getBank(1)] + "\n" 
        + "  " + this.state.reduce((prev, cur, i) => (i < (this.state.length / 2)) && (i > 0) ?  prev + " " + cur : prev + "", "");
    }
}

// module.exports = GameState; // Apagar

// let game = new GameState(6, 4);
// console.log(game.toString());
// console.log("\n" + game.sow(3) + " " + game.player + "\n");
// console.log(game.toString());
// console.log("\n" + game.sow(4) + " " + game.player + "\n");
// console.log(game.toString());