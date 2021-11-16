const GameState = require('./GameState'); // Apagar
const Bot = require('./Bot'); // Apagar
const readline = require("readline");
const util = require('util');
// Bot might extend this class if OOP is needed
class Player
{
    type;
    bot;

    constructor(type, diff)
    {
        this.type = type;
        
        if (type === "Bot")
        {
            this.bot = new Bot(diff);
        }
    }

    async play(game)
    {
        if (this.type === "Bot")
        {
            return this.bot.play(game);
        }
        else
        {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });            
            const question = util.promisify(rl.question).bind(rl);
            const answer = await question("");
            rl.close();

            return game.play(parseInt(answer, 10));
        }
    }
}

module.exports = Player; // Apagar