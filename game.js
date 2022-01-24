const url = require("url");
const User = require("./wwwroot/User.js");
const GameState = require("./wwwroot/GameState.js");
const FileManager = require("./FileManager.js");
const updater = require("./updater.js");
const responses = require("./responses.js");
const ranking = require("./ranking.js");

const seconds = 120;// play time in seconds

const playTime = seconds * 1000; // play time in milliseconds 

function endGame(game, winner, playerOne, playerTwo)
{
    FileManager.deleteGame(game)
        .then(() => {
            if (playerOne != null && playerTwo != null)
            {
                ranking.update(playerOne, playerTwo, winner);
            }
        })
        .catch(console.log);
}

module.exports.registerForUpdates = (request, response) =>
{
    const query = url.parse(request.url, true).query;
    const game = query.game;

    updater.remember(game, response);

    request
    .on("close", () => {
        updater.forget(response)
    });

    response.writeHead(200, responses.SSEHeader);

    FileManager.getGame(game)
    .then(({ board }) => {
        if (Object.keys(board.sides).length === 2)
        {
            updater.update(query.game, { board: board })
        }
    })
    .catch(console.log);
}

module.exports.join = (request, response) =>
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            const { nick, password, size, initial } = JSON.parse(body);
            const user = new User(nick, password);

            if (size < 1 || size > 9 || initial < 1 || initial > 6)
            {
                responses.validateRequestErrorResponse(response, "Invalid arguments.")
            }

            FileManager.getUser(user)
            .then(() => {
                FileManager.registerForGame(user, size, initial)
                .then(({ game, lastPlay }) => {
                    if (lastPlay !== undefined)
                    {
                        setTimeout(() => {
                            FileManager.getGame(game.id)
                            .then((g) => {
                                if (lastPlay === g.lastPlay) 
                                {
                                    const [playerOne, playerTwo] = Object.keys(g.board.sides);
                                    updater.update(game.id, { winner: playerOne === g.board.turn ? playerTwo : playerOne });
                                    endGame(game.id, playerOne === g.board.turn ? playerTwo : playerOne, playerOne, playerTwo);
                                }
                            })
                            .catch(console.log);
                        }, playTime);
                    }

                    responses.okResponse(response, { game: game.id });
                })
                .catch((r) => responses.internalErrorResponse(response, r));
            })
            .catch((r) => responses.unauthorizedErrorResponse(response, r));
            
        }
        catch (e)
        {
            console.log(e);             
            responses.internalErrorResponse(response, "Internal server error.");
        }
    })
    .on("error", () => responses.internalErrorResponse(response, "Internal server error."));
}

module.exports.notify = (request, response) =>
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            let play = JSON.parse(body);
            const [gameId, nick, password, pos] = [play.game, play.nick, play.password, play.move + 1];

            const user = new User(nick, password);

            FileManager.getUser(user)
            .then(() => {
                FileManager.getGame(gameId)
                .then((game) => {
                    if (user.nick !== game.board.turn || Object.keys(game.board.sides).length == 1)
                    {
                        responses.validateRequestErrorResponse(response, "Not your turn to play.");
                        return;
                    }

                    const [playerOne, playerTwo] = Object.keys(game.board.sides);
                    const gameState = new GameState(null, null, game.board.turn === playerOne, GameState.buildState(game.board.sides[playerOne], game.board.sides[playerTwo]));

                    if (gameState.play(pos) < 0)
                    {
                        responses.validateRequestErrorResponse(response, "Invalid move.");
                        return;
                    }
                    

                    FileManager.saveGame(gameId, game, gameState, playerOne, playerTwo)
                    .then((savedGame) => {
                        
                        let res = { board: savedGame.board, pit: pos }

                        if (gameState.isFinal())
                        {
                            const score = gameState.getGameScore();
                            res.winner = (score > 0 ? playerOne : (score < 0 ? playerTwo : null));
                            endGame(gameId, res.winner, playerOne, playerTwo);
                        }

                        setTimeout(() => {
                            FileManager.getGame(gameId)
                            .then((g) => {
                                if (savedGame.lastPlay === g.lastPlay)
                                    updater.update(gameId, { winner: playerOne === g.board.turn ? playerTwo : playerOne });
                                    endGame(gameId, playerOne === g.board.turn ? playerTwo : playerOne, playerOne, playerTwo);

                                })
                            .catch(console.log);
                        }, playTime);

                        responses.okResponse(response);
                        updater.update(gameId, res);
                    })
                    .catch(() => responses.internalErrorResponse(response, "Internal server error."));
                })
                .catch((r) => responses.validateRequestErrorResponse(response, r));
            })
            .catch((r) => responses.unauthorizedErrorResponse(response, r));
        }
        catch (e)
        {               
            console.log(e);             
            responses.internalErrorResponse(response, "Internal server error.");
        }
    })
    .on("error", () => responses.internalErrorResponse(response, "Internal server error."));
}

module.exports.leave = (request, response) =>
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            let data = JSON.parse(body);
            
            FileManager.getUser(new User(data.nick, data.password))
            .then(() => {
                FileManager.getGame(data.game)
                .then(({ board }) => {
                    const players = Object.keys(board.sides);

                    const winner = players.length == 1 ? null : (players[0] === data.nick ? players[1] : players[0]);
                    
                    updater.update(data.game, { winner: winner });
                    endGame(data.game, winner, players[0], players[1]);
                    responses.okResponse(response);
                })
                .catch((r) => r == "User registered with a different password." ? 
                responses.unauthorizedErrorResponse(response, r) :
                responses.validateRequestErrorResponse(response, r));
            });
        }
        catch (e)
        {
            console.log(e);
            responses.internalErrorResponse(response, "Internal server error.");
        }
    })
    .on("error", () => responses.internalErrorResponse(response, "Internal server error."));
}
