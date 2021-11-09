export default class Game
{
    state;
    player;

    constructor(size, numSeeds)
    {
        this.state = Array(2 * (size + 1)).fill(1).map((_, i, arr) => i % (arr.length / 2) == 0 ? 0 : numSeeds);
        this.player = true;
    }

    bank(player) 
    {
        return player ? this.state.length / 2 : 0;
    }
 
    isFinal()
    {
        return state.slice(/* completar */).reduce((prev, cur) => prev + cur) == 0 || state.slice(/* completar */).reduce((prev, cur) => prev + cur) == 0;
    }

    play(pos)
    {
        if (pos >= 0 && pos < this.state.length) return -1;

        this.sow(player ? pos : pos + this.state.length / 2);

        if (this.isFinal()) return 
    }

    sow(pos)
    {   
        
        const len = this.state.length;
        const n = this.state[pos];
        const playersBank = this.bank(this.player);
        const oppoBank = this.bank(!this.player);
        this.state[pos] = 0;

        for (let i = 1; i <= n; i++)
        {
            if ((pos + i) % len == oppoBank)
            {
                n++;
                continue;
            }

            this.state[(pos + i) % len]++;
            console.log(this.state[(pos + i) % len] + "\n"); 
        }

        const lastPos = pos + n % len;
        if (lastPos != playersBank)
        {
            this.player = !this.player;
        }
        
        if (this.state[lastPos] == 1 && lastPos )
        {
            this.state[playersBank] += this.state[lastPos];
            this.state[this.state.length - lastPos] = 0;
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

let game = new Game(6, 4);
console.log(game.toString());
console.log("\n" + game.sow(3) + " " + game.player + "\n");
console.log(game.toString());
console.log("\n" + game.sow(4) + " " + game.player + "\n");
console.log(game.toString());