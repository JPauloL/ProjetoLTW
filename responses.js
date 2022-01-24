const plainHeader = {
    'Access-Control-Allow-Origin': '*'
};

const SSEHeader = {    
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream'
};

module.exports.plainHeader = plainHeader;

module.exports.SSEHeader = SSEHeader;

// Outros erros
module.exports.internalErrorResponse = (response, message) =>
{
    response.writeHead(500, plainHeader);
    response.end(JSON.stringify({error: message}));
}

// Recurso não encontrado
module.exports.notFoundErrorResponse = (response, message) =>
{
    response.writeHead(404, plainHeader);
    response.end(JSON.stringify({error: message}));
}

// Pedido não autorizado
module.exports.unauthorizedErrorResponse = (response, message) =>
{
    response.writeHead(401, plainHeader);
    response.end(JSON.stringify({error: message}));
}

// Validação de argumentos
module.exports.validateRequestErrorResponse = (response, message) =>
{
    response.writeHead(400, plainHeader);
    response.end(JSON.stringify({error: message}))
}

// Pedido bem sucedido
module.exports.okResponse = (response, message) =>
{
    const m = message ?? {};

    response.writeHead(200, plainHeader);
    response.end(JSON.stringify(m));
}