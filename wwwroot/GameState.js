class GameState
{
    state;
    player;

    constructor(size, numSeeds, player, state)
    {
        if (state !== undefined)
        {
            this.state = state;
            this.player = player;
            return;
        }

        this.state = Array(2 * (size + 1)).fill(1).map((_, i, arr) => i % (arr.length / 2) == 0 ? 0 : numSeeds);
        this.player = player;
    }

    static buildState(playerOne, playerTwo)
    {
        return [playerTwo.store].concat(playerOne.pits).concat(playerOne.store).concat(playerTwo.pits);
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
        return this.player ? this.state : this.state.slice(this.state.length / 2).concat(this.state.slice(0, this.state.length / 2)); 
    }

    getPits(player) 
    { 
        return player ? this.state.slice(1, (this.state.length / 2)) : this.state.slice((this.state.length / 2) + 1, this.state.length);
    }

    getBank(player) 
    {
        return player ? this.state.length / 2 : 0;
    }

    getPlayerScore(player)
    {
        return this.state[this.getBank(player)];
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
    }


    getGameScore()
    {
        if (this.isFinal()) this.finishGame();
        return this.state[this.getBank(true)] - this.state[this.getBank(false)];
    }

    getScore()
    {
        const [playersBank, oppoBank] = [this.getBank(1), this.getBank(0)];
        return (this.state[playersBank] + this.playerScore(1)) - (this.state[oppoBank] + this.playerScore(0));
    }

    finishGame()
    {
        const [playersBank, oppoBank] = [this.getBank(true), this.getBank(false)];
        
        const len = this.state.length;
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
            if (this.state[lastPos] === 1 && this.isPlayerSide(lastPos))
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
        + this.state[0] + String(" ").repeat(this.state.length) + " " + this.state[this.getBank(1)] + "\n" 
        + "  " + this.state.reduce((prev, cur, i) => (i < (this.state.length / 2)) && (i > 0) ?  prev + " " + cur : prev + "", "");
    }
}

module.exports = GameState;
