const FileManager = require("./FileManager.js");
const responses = require("./responses.js");

module.exports.update = (playerOne, playerTwo, winner) =>
{            
    FileManager.updateRankings(playerOne, playerTwo, winner);
}

module.exports.get = (request, response) =>
{
    FileManager.getRanking()
    .then((ranking) => responses.okResponse(response, ranking))
    .catch((e) => responses.internalErrorResponse(response, "Couldn't get rankings."));
}