class Bot
{
    difficulty;

    constructor(difficulty)
    {
        this.difficulty = difficulty;
    }

    play(state)
    {
        return (this.difficulty == "Easy" ? this.easy(state) : (this.difficulty == "Medium" ? this.medium(state) : this.hard(state)));
    }

    easy(state)
    {
        const depth = 1;
        const res = this.minimax(state, depth, state.player);

        return res.pos;
    }

    medium(state)
    {
        const depth = 3;
        const res = this.minimax(state, depth, state.player);
        
        return res.pos;
    }

    hard(state)
    {
        const depth = 5;
        const res = this.minimax(state, depth, state.player);
        return res.pos;
    }

    getHeuristicValue(state)
    {
        const score = state.getGameScore();
        return score;
    }

    minimax(state, depth, maximizing)
    {
        if (depth == 0 || state.isFinal())
        {
            return { pos: -1, value: this.getHeuristicValue(state) };
        }

        if (maximizing)
        {
            let ret = { pos: -1, value: Number.NEGATIVE_INFINITY };
            for (let i = 1; i < state.state.length / 2; i++)
            {
                let child = new GameState(null, null, state.player, state.state.slice());
                if (child.play(i) < 0) continue;

                const res = this.minimax(child, depth - 1 , child.player == state.player ? maximizing : !maximizing);

                ret.value = Math.max(ret.value, res.value);

                if (res.value === ret.value)
                {
                    ret.pos = i;
                }
            }

            return ret;
        }

        let ret = { pos: -1, value: Number.POSITIVE_INFINITY };
        for (let i = 1; i < state.state.length / 2; i++)
        {
            let child = new GameState(null, null, state.player, state.state.slice());
            if (child.play(i) < 0) continue;

            const res = this.minimax(child, depth - 1 , child.player == state.player ? maximizing : !maximizing);

            ret.value = Math.min(ret.value, res.value);

            if (res.value === ret.value)
            {
                ret.pos = i;
            }
        }

        return ret;
    }
}