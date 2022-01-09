const FileManager = require("./FileManager.js");
const responses = require("./responses.js");

module.exports.update = (playerOne, playerTwo, winner) =>
{
    fs.readFile("rankings.json", (e, rankingsData) => {
        if (e)
        {
            return;
        }

        const rankings = JSON.parse(rankingsData);

        if (winner !== null)
        {
            rankings[winner]++;
        }

        if (rankings)

        fs.writeFile()
    });
}

module.exports.get = (request, response) =>
{
    FileManager.getRanking()
    .then((rank) => responses.okResponse(response, { ranking: rank }))
    .catch(responses.InternalErrorResponse(response, "Couldn't get rankings."));
}