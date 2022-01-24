const fs = require("fs");
const crypto = require("crypto");

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
                    reject("Internal server error.");
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
                        reject("User registered with a different password.");
                    }
                    return;
                }
                else
                {
                    users[user.nick] = user.password;
                    fs.writeFile("credentials.json", JSON.stringify(users), (e) => {
                        if (e) 
                        {
                            reject("Internal server error.");
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
                    reject("Internal server error.");
                    return;
                }

                let games = JSON.parse(data);
                let gameId;

                if ((gameId = Object.keys(games).find((k) => games[k].board.sides[user.nick] != undefined)) != undefined)
                {
                    return games[gameId];
                }

                gameId = Object.keys(games).find((k) => Object.keys(games[k].board.sides).length === 1 && games[k].board.sides[games[k].board.turn].pits.length === size && games[k].board.sides[games[k].board.turn].pits[0] === seeds);

                if (gameId != undefined)
                {
                    games[gameId].board.sides[user.nick] = {
                        pits: new Array(size).fill(seeds),
                        store: 0
                    }
                    games[gameId].lastPlay = Date.now();

                    fs.writeFile("games.json", JSON.stringify(games), (e) => e ? reject("Internal server error.") : resolve({ game: { id: gameId, board: games[gameId].board }, lastPlay: games[gameId].lastPlay }));

                    return;
                }

                gameId = crypto.createHash("md5").update(user.nick + (new Date().getTime().toString())).digest("hex");
                games[gameId] = this.buildGameObject(user.nick, size, seeds);

                fs.writeFile("games.json", JSON.stringify(games), (e) => e ? reject("Internal server error.") : resolve({ game: { id: gameId, board: games[gameId].board } }));
            });
        });
    }

    static getGame(game)
    {
        return new Promise((resolve, reject) => {
                    fs.readFile("games.json", (e, data) => {
                        if (e)
                        {
                            reject("Internal server error.");
                            return;
                        }
                        let games = JSON.parse(data);
                        games[game] != undefined ? resolve(games[game]) : reject("Game doesn't exist.");
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
                    reject("Internal server error.");
                    return;
                }

                let games = JSON.parse(data);
                games[gameId] = gameObj;

                fs.writeFile("games.json", JSON.stringify(games), (e) => {
                    if (e) 
                    {
                        reject("Internal server error.");
                        return;
                    }
                    resolve(gameObj);
                });               
            })
        });      
    }

    static deleteGame(game)
    {
        return new Promise ((resolve, reject) => { 
                fs.readFile("games.json", (e, data) => {
                if (e)
                {
                    reject("Internal server error.");
                    return;
                }

                let games = JSON.parse(data);
                if (games[game] != undefined)
                {
                    delete games[game];
                    fs.writeFile("games.json", JSON.stringify(games), () => {});
                    resolve();
                }
                else
                {
                    reject("Invalid game reference.");
                }
            });
        });
    }

    static updateRankings(playerOne, playerTwo, winner)
    {
        fs.readFile("rankings.json", (e, rankingsData) => {
            if (e)
            {
                return;
            }

            const rankings = JSON.parse(rankingsData);
    
            if (rankings.ranking == undefined)
            {
                rankings.ranking = [];
            }

            const ranking = rankings.ranking;
    
            let p1;
            let p2;
    
            if ((p1 = ranking.findIndex((r) => r.nick === playerOne)) == -1)
            {
                p1 = ranking.push({ 
                    nick: playerOne,
                    games: 0,
                    victories: 0
                }) - 1;
            }
    
            if ((p2 = ranking.findIndex((r) => r.nick === playerTwo)) == -1)
            {
                p2 = ranking.push({ 
                    nick: playerTwo,
                    games: 0,
                    victories: 0
                }) - 1;
            }
            
            ranking[p1].games++;
            ranking[p2].games++;
    
            if (winner !== null)
            {
                ranking[winner === playerOne ? p1 : p2].victories++;
            }
    
            ranking.sort((p1, p2) => {
                const cmp = p2.victories - p1.victories;
    
                if (cmp != 0)
                {
                    return cmp;
                }
    
                return p1.games - p2.games;
            });
    
            rankings.ranking = ranking;
    
            fs.writeFile("rankings.json", JSON.stringify(rankings), (e) => {
                if (e) console.log(e);
            });
        });
    }

    static getRanking()
    {
        return new Promise((resolve, reject) => {
            fs.readFile("rankings.json", (e, data) => {
                if (e)
                {
                    reject("Internal server error.");
                    return;
                }
                const { ranking } = JSON.parse(data);

                resolve({ ranking: ranking.slice(0, 10) });
            });
        });
    }
}