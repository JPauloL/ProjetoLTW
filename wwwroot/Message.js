class Message
{
    message;
    errorMessage;
    messagePanel;
    previousColor;
    previousFontWeight;

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
            this.messagePanel.style.color = "white";
            this.messagePanel.style.fontWeight = "normal";    
        }
    }

    render()
    {
        return this.messagePanel;
    }

    error(message)
    {
        this.previousColor = this.messagePanel.innerText == this.errorMessage ? this.previousColor : this.messagePanel.style.color;
        this.previousFontWeight = this.messagePanel.innerText == this.errorMessage ? this.previousFontWeight : this.messagePanel.style.fontWeight;
        
        this.errorMessage = message;
        this.messagePanel.innerText = message;


        this.messagePanel.style.color = "red";
        this.messagePanel.style.fontWeight = "normal";

        setTimeout(() => {
            if (message == this.messagePanel.innerText)
            {
                this.messagePanel.innerText = this.message;
                this.messagePanel.style.color = this.previousColor;
                this.messagePanel.style.fontWeight = this.previousFontWeight;
            }

        }, 3000);
    }
}