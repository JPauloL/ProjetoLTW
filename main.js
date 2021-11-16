/*

Apenas para teste da lógica do jogo em Node.js

*/

const process = require('process');
const readline = require("readline");
const util = require('util');
const Game = require('./Game');
const Player = require('./Player');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });


async function main()
{
    // const question = util.promisify(rl.question).bind(rl);
    // const answer = await question("Head or Tails\n");

    // let game = new Game(6, 5, 1, [new Player("Bot", 0), new Player("Bot", 0)]); // 2 AIs
    // let game = new Game(6, 5, 1, [new Player("Human", 0), new Player("Bot", 0)]); // 1 AI 1 Human
    let game = new Game(6, 5, 0, [new Player("Human", 0), new Player("Human", 0)]); // 2 Humans

    await game.run();

    // rl.close();
    process.exit(0);
}

main();
