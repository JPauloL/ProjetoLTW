const FileManager = require("./FileManager.js");
const User = require("./wwwroot/User.js");
const responses = require("./responses.js");

module.exports = function register(request, response)
{
    if (request.method !== "POST") return;

    let body = "";
    let user;

    request
        .on("data", (data) => body += data)
        .on("end", () => {
            try 
            {
                
                const { nick, password } = JSON.parse(body);
                user = new User(nick, password);

                if (user.nick == undefined || user.password == undefined || user.nick == null || user.password == null || user.nick == "" || user.nick.length > 20 || user.password == "")
                {
                    responses.validateRequestErrorResponse(response, "Wrong nick/password.");
                    return;
                }

                FileManager.getUser(user)
                .then(() => responses.okResponse(response))
                .catch(() => responses.unauthorizedErrorResponse(response, "Not authorized"));
            }
            catch (e)
            {
                console.log(e);
                responses.InternalErrorResponse(response);
            }
        });
}