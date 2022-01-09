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
    if (playerOne != null)
    {
        ranking.update(playerOne, playerTwo, winner);
    }

    FileManager.deleteGame(game);
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
    .catch();
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
                .then(({ game }) => {
                    if (game.lastPlay !== undefined)
                    {
                        setTimeout(() => {
                            FileManager.getGame(game.id)
                            .then((g) => {
                                if (game.lastPlay === g.lastPlay) 
                                {
                                    const [playerOne, playerTwo] = Object.keys(g.board.sides);
                                    endGame(game.id, playerOne === g.board.turn ? playerTwo : playerOne, playerOne, playerTwo);
                                    updater.update(data.gmae, { winner: playerOne === g.board.turn ? playerTwo : playerOne });
                                }
                            })
                            .catch(console.log);
                        }, playTime);
                    }

                    responses.okResponse(response, { game: game.id });
                })
                .catch(() => responses.InternalErrorResponse(response));
            })
            .catch(() => responses.unauthorizedErrorResponse(response));
            
        }
        catch (e)
        {
            console.log(e);             
            responses.InternalErrorResponse(response);
        }
    });
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
                    if (user.nick !== game.board.turn)
                    {
                        responses.validateRequestErrorResponse(response, "Not your turn to play.");
                        return;
                    }
                    const [playerOne, playerTwo] = Object.keys(game.board.sides);
                    const gameState = new GameState(null, null, game.board.turn === playerOne, GameState.buildState(game.board.sides[playerOne], game.board.sides[playerTwo]));

                    if (gameState.play(pos) < 0 )
                    {
                        responses.validateRequestErrorResponse(response, "Invalid move.");
                        return;
                    }
                    

                    FileManager.saveGame(gameId, game, gameState, playerOne, playerTwo)
                    .then((savedGame) => {
                        
                        let res = { board: savedGame.board }

                        if (gameState.isFinal())
                        {
                            const score = gameState.getGameScore();
                            res.winner = (score > 0 ? playerOne : (score < 0 ? playerTwo : null));
                            endGame(gameId, res.winner, playerOne, playerTwo);
                        }
                        
                        setTimeout(() => {
                            FileManager.getGame(gameId)
                            .then((g) => {
                                if (game.lastPlay === g.lastPlay) 
                                    endGame(gameId, playerOne === g.board.turn ? playerTwo : playerOne, playerOne, playerTwo);
                                    updater.update(data.gmae, { winner: playerOne === g.board.turn ? playerTwo : playerOne });
                            })
                            .catch(console.log);
                        }, playTime);

                        responses.okResponse(response);
                        updater.update(gameId, res);
                    })
                    .catch(() => responses.InternalErrorResponse(response, "Internal error."));
                })
                .catch(() => responses.validateRequestErrorResponse(response, "Game doesn't exist."));
            })
            .catch(() => responses.unauthorizedErrorResponse(response, "Unauthenticated."));
        }
        catch (e)
        {               
            console.log(e);             
            responses.InternalErrorResponse(response);
        }
    });
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
                    endGame(data.game, winner, players[0], players[1]);
                    updater.update(data.game, { winner: winner });

                    responses.okResponse(response);
                })
                .catch((e) => e == undefined ? 
                responses.unauthorizedErrorResponse(response, "User isn't authenticated.") :
                responses.validateRequestErrorResponse(response, "Game doesn't exist"));
            });
        }
        catch (e)
        {
            console.log(e);
            responses.InternalErrorResponse(response);
        }
    });
}
