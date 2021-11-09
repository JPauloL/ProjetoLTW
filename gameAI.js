import Game from 'gameState.js';

let alpha = Number.MIN_VALUE; // Maximize
let beta = Number.MAX_VALUE;  // Minimize

export default class GameAI
{
    difficulty;

    constructor(difficulty)
    {
        this.difficulty = difficulty;
    }

    nextPlay(game)
    {
        return this.difficulty == 0 ? easy() : (this.difficulty == 1 ? medium() : hard());
    }

    easy(game)
    {
        console.log(Math.floor(Math.random(game.state.length) * ((10 / 2) - 1) + 1));
    }

    medium(game)
    {
        // Calcular best-first (last lands on bank state[pos] = state.length - pos) > (maximize)
    }

    hard()
    {
        // negamax com alpha beta prune
    }
}
console.log(Math.floor(Math.random() * ((10 / 2) - 1) + 1));

// Alpha-Beta prune algorithm. Call alphaBeta(initialState, depth, Number.MIN_VALUE, Number.MAX_VALUE, true)
function alphaBeta(state, depth, alpha, beta, maximizing)
{
    if (depth == 0 || isFinished(state))
    for (let i = 1; i < state.length; i++)
    {
        
    }
    // slice: copiar o array
}

function minimax(state, depth, maximizing)
{
    if (depth == 0 || isFinished(state))
    {
        return state[(state.length - 2) / 2] - state[state.length - 1];
    }
    // slice: copiar o array

    if (maximizing)
    {
        value = Number.MIN_VALUE;
        for (let i = 0; i < (state.length - 2) / 2; i++)
        {
            if (state[i] == 0) continue;
            let child = sow(state, i);

            value = Math.max(value, minimax(child, depth - 1 , child[(state.length - 2) / 2] != state[(state.length - 2) / 2]));
        }

        return value;
    }

    value = Number.MAX_VALUE;
    for (let i = 0; i < (state.length - 2) / 2; i++)
    {
        value = Math.min(value, minimax(sow(state, state.length - i - 1), depth - 1 , true));
    }

    return value;
}