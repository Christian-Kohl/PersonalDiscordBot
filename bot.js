const ActionEnum= Object.freeze({"BUY":1, "SELL":2});

const StateEnum =Object.freeze({"SLEEP":1, "SESSION":2,"VOTE":3});

const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
client.login(getToken());

client.on('ready', readyDiscord);

var sessionName = "";
var currentState = StateEnum.SLEEP;
var currentVote = null;

function readyDiscord(){
    console.log("Hello");
}

client.on('message', msg => {
    if (msg.content[0] === '/') {
        var commandContent = msg.content.slice(1).split(' ');
        console.log(commandContent);
        switch (commandContent[0]) {
            case "currentSession":
                returnCurrentSession(msg);
                break;
            case "start":
                startSession(commandContent.slice(1), msg);
                break;
            case "end":
                endSession(msg);
                break;
            case "vote":
                startVote(commandContent, msg);
                break;
            case "count":
                getStateOfVote();
                break;

        }
    } else if (msg.content[0] === "+") {
        castVote(true, msg);
    } else if (msg.content[0] === "-") {
        castVote(false, msg);
    } 
});

function startSession(content, msg) {
    if (currentState === StateEnum.SLEEP) {
        sessionName = content[0]
        msg.reply("Session: " + sessionName + " has been started");
    } else {
        msg.reply("The session: " + sessionName + " is still active! End the session before you start a new one.");
    }
}

function endSession(msg) {
    if (currentState === StateEnum.SLEEP) {
        msg.reply("No session to end");
    } else {
        saveSession(msg);
        msg.reply("Session ended")
    }
}

function returnCurrentSession(msg){
    if (currentState !== SLEEP) {
        msg.reply('Currently discussing: ' + currentSession);
    } else {
        msg.reply('Currently no active session');
    }
}

function saveSession(msg) {
    msg.reply("Session 'saved'");
}

function saveVote() {
    msg.reply("Saving the vote");
}

function startVote(content, msg) {
    if (content.length === 4 && (currentState === StateEnum.SESSION || currentState === StateEnum.VOTE)) {
        if (currentState === StateEnum.VOTE) {
            saveVote();
        }
        try {
            if (content[2] !== "-") {
                action = ActionEnum.BUY
            } else {
                action = ActionEnum.SELL
            }
            currentVote = new voteObj(content[1], action, content[3])
            msg.reply("Voting to " + content[2] + " $" + content[3] + " of " + content[1])
            currentSession = StateEnum.VOTE;
        } catch (e) {
            msg.reply("Something is wrong with the statement")
            console.log(e)
        }
    } else if (content.length === 1) {
        msg.reply("Start a vote with the following command: /vote $stock $buyOrSell $amount")
    } else if (currentState === StateEnum.SLEEP){
        msg.reply("Start a session before starting a vote");
    } else{
        msg.reply("Not enough information to start a vote")
    }
}

function castVote(vote, msg) {
    if (currentState === StateEnum.VOTE){
        var authorUsername = msg.author.username
        currentVote.ledger[authorUsername] = vote;
    } else {
        msg.reply("Start a vote to cast a vote");
    }
}

function getStateOfVote() {
    console.log(currentVote.ledger)
    console.log(sumDictionary(currentVote.ledger))
}

function sumDictionary( obj ) {
    var sum = 0;
    for( var el in obj ) {
        if( obj.hasOwnProperty( el ) ) {
            sum += parseFloat( obj[el] );
        }
    }
    return sum;
}

class voteObj {
    ledger = {};
    constructor(gname, gbuyOrSell, gamount) {
        this.name = gname;
        this.amount = gamount;
        this.buyOrSell = gbuyOrSell;
    }

}

function getToken(){
    const data = fs.readFileSync('token.txt', 'UTF-8');
    const token = data.split(/\r?\n/)[0];
    return token;
}
