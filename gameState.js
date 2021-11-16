class GameState
{
    state;
    player;

    constructor(size, numSeeds)
    {
        this.state = Array(2 * (size + 1)).fill(1).map((_, i, arr) => i % (arr.length / 2) == 0 ? 0 : numSeeds);
        this.player = true;
    }

    getState()
    {
        return this.player ? this.state : ; // Trocar os lados 
    }

    bank(player) 
    {
        return player ? this.state.length / 2 : 0;
    }
 
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

    score()
    {
        const [playersBank, oppoBank] = [this.bank(1), this.bank(0)];
        return (this.state[playersBank] + this.playerScore(1)) - (this.state[oppoBank] + this.playerScore(0));
    }

    play(pos)
    {
        const normPos = this.player ? pos : pos + this.state.length / 2;
        if (pos <= 0 || pos >= (this.state.length / 2) || this.state[normPos] === 0) return -1;
        if (this.isFinal()) return -2;
        
        console.log("\n" + (this.player ? "Player 1: " : "Player 2: ") + pos + "\n");
        return this.sow(normPos);
    }

    sow(pos)
    {   
        
        const len = this.state.length;
        let n = this.state[pos];
        const [playersBank, oppoBank] = [this.bank(this.player), this.bank(!this.player)];
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
            if (this.state[lastPos] === 1 && lastPos >= 1 + ((len / 2) * !this.player) && lastPos < (len / (1 + this.player)) && this.state[this.state.length - lastPos] > 0)
            {
                this.state[playersBank] += this.state[lastPos] + this.state[this.state.length - lastPos];
                this.state[lastPos] = this.state[this.state.length - lastPos] = 0;
            }

            this.player = !this.player;
        }

        return 0;
    }

    toString()
    {
        return "  " + this.state.reduce((prev, cur, i) => i > this.state.length / 2 ?  " " + cur + prev : prev, "") + "\n" 
        + this.state[0] + String(" ").repeat(this.state.length) + " " + this.state[this.bank(1)] + "\n" 
        + "  " + this.state.reduce((prev, cur, i) => (i < (this.state.length / 2)) && (i > 0) ?  prev + " " + cur : prev + "", "");
    }
}

module.exports = GameState; // Apagar

// let game = new GameState(6, 4);
// console.log(game.toString());
// console.log("\n" + game.sow(3) + " " + game.player + "\n");
// console.log(game.toString());
// console.log("\n" + game.sow(4) + " " + game.player + "\n");
// console.log(game.toString());