class Message
{
    message;
    errorMessage;
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

    error(message)
    {
        this.errorMessage = message;
        this.messagePanel.innerText = message;

        const color = this.messagePanel.style.color;
        const fontWeight = this.messagePanel.style.fontWeight;

        this.messagePanel.style.color = "red";
        this.messagePanel.style.fontWeight = "bold";

        setTimeout(() => {
            if (message == this.messagePanel.innerText)
            {
                this.messagePanel.innerText = this.message;
                this.messagePanel.style.color = color;
                this.messagePanel.style.fontWeight = fontWeight;
            }

        }, 3000);
    }
}