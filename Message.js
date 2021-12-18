class Message
{
    message;
    messagePanel;

    constructor(message)
    {
        this.messagePanel = document.createElement("div");
        this.messagePanel.id = "message-panel";
        
        this.message = message;
        this.messagePanel.innerText = message;
    }

    update(message, color)
    {
        this.message = message;
        this.messagePanel.innerText = message;

        if (color !== undefined)
        {
            this.messagePanel.style.color = color;
            this.messagePanel.style.fontWeight = "bold";
        }
        else
        {
            this.messagePanel.style.fontWeight = "normal";    
        }
    }

    render()
    {
        return this.messagePanel;
    }
}