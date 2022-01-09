const fs = require("fs");
const crypto = require("crypto");
const { resolve } = require("path/posix");

module.exports = class FileManager
{
    static buildGameObject(player, size, seeds)
    {
        return {
            board: {
                sides: {
                    [player]: {
                        pits: new Array(size).fill(seeds),
                        store: 0
                    }
                },
                turn: player
            }
        };
    }

    static getUser(user)
    {
        return new Promise((resolve, reject) => {
            user.password = crypto.createHash("sha256").update(user.password).digest("hex");

            fs.readFile("credentials.json", (e, data) => {
                if (e) 
                {
                    reject();
                    return;
                }

                const users = JSON.parse(data);

                if (users[user.nick] !== undefined)
                {
                    if (users[user.nick] === user.password)
                    {
                        resolve(user);
                    }
                    else
                    {
                        reject();
                    }
                    return;
                }
                else
                {
                    users[user.nick] = user.password;
                    fs.writeFile("credentials.json", JSON.stringify(users), (e) => {
                        if (e) 
                        {
                            reject();
                            return;
                        }
        
                        resolve(user);
                    });
                }
            });
        });
    }

    static registerForGame(user, size, seeds)
    {
        return new Promise((resolve, reject) => {
            fs.readFile("games.json", (e, data) => {
                if (e)
                {
                    reject();
                    return;
                }

                let games = JSON.parse(data);
                let gameId = Object.keys(games).find((k) => Object.keys(games[k].board.sides).length === 1 && games[k].board.sides[games[k].board.turn].pits.length === size && games[k].board.sides[games[k].board.turn].pits[0] === seeds);

                if (gameId != undefined)
                {
                    games[gameId].board.sides[user.nick] = {
                        pits: new Array(size).fill(seeds),
                        store: 0
                    }

                    fs.writeFile("games.json", JSON.stringify(games), (e) => e ? reject() : resolve({ game: { id: gameId, board: games[gameId].board }, joined: true }));

                    return;
                }

                gameId = crypto.createHash("sha256").update(user.nick + (new Date().getTime().toString())).digest("hex");
                games[gameId] = this.buildGameObject(user.nick, size, seeds);

                fs.writeFile("games.json", JSON.stringify(games), (e) => e ? reject() : resolve({ game: { id: gameId, board: games[gameId].board }, joined: false }));
            });
        });
    }

    static getGame(game)
    {
        return new Promise((resolve, reject) => {
                    fs.readFile("games.json", (e, data) => {
                        if (e)
                        {
                            reject();
                            return;
                        }
                        let games = JSON.parse(data);
                        games[game] != undefined ? resolve(games[game]) : reject("game");
                    })
                });
    }

    static saveGame(gameId, gameObj, state, playerOne, playerTwo)
    {
        gameObj.board.sides = {
            [playerOne]: {
                pits: state.getPits(true),
                store: state.state[state.getBank(true)]
            },
            [playerTwo]: {
                pits: state.getPits(false),
                store: state.state[state.getBank(false)]
            }
        }

        gameObj.board.turn = state.player ? playerOne : playerTwo;
        gameObj.lastPlay = Date.now();

        return new Promise((resolve, reject) => {
            fs.readFile("games.json", (e, data) => {
                if (e)
                {
                    reject();
                    return;
                }

                let games = JSON.parse(data);
                games[gameId] = gameObj;

                fs.writeFile("games.json", JSON.stringify(games), (e) => {
                    if (e) 
                    {
                        reject();
                        return;
                    }
                    resolve(gameObj);
                });               
            })
        });      
    }

    static deleteGame(game)
    {
        fs.readFile("games.json", (e, data) => {
            if (e)
            {
                return;
            }

            let games = JSON.parse(data);
            if (games[game] != undefined)
            {
                delete games[game];
                fs.writeFile("games.json", JSON.stringify(games), () => {});
            } 
        })
    }
}