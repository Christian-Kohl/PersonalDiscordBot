const ActionEnum= Object.freeze({"BUY":1, "SELL":2});

const StateEnum =Object.freeze({"SLEEP":1, "SESSION":2,"VOTE":3});

class voteObj {
    ledger = {};
    constructor(gname, gbuyOrSell, gamount) {
        this.name = gname;
        this.amount = gamount;
        this.buyOrSell = gbuyOrSell;
    }

    voteString(){
        return "Voting to " + this.buyOrSellString() + " $" + this.amount + " of " + this.name;
    }

    buyOrSellString(){
        if (this.buyOrSell === 1) {
            return "buy";
        } else {
            return "sell";
        }
    }

}

const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
client.login(getToken());

client.on('ready', readyDiscord);

var sessionName = null;
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
                getStateOfVote(msg);
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
        currentState = StateEnum.SESSION;
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
    if (currentState !== StateEnum.SLEEP) {
        msg.reply('Currently discussing: ' + sessionName);
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
            msg.reply(currentVote.voteString());
            currentState = StateEnum.VOTE;
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

function getStateOfVote(msg) {
    resultCounts = {};
    for(var key in currentVote.ledger) {
        answer = currentVote.ledger[key]
        if (isNaN(resultCounts[answer])){
            resultCounts[answer] = 1;
        } else {
            resultCounts[answer] += 1;
        }
    }
    if (!isNaN(resultCounts[true]) || !isNaN(resultCounts[false])) {
        fors = resultCounts[true];
        againsts = resultCounts[false];
        if(isNaN(fors)) {
            fors = 0;
        } else if (isNaN(againsts)) {
            againsts = 0;
        }
        total = fors + againsts;
    }
    lis = [fors, againsts]
    printVoteResult(msg, lis, total)
}

function printVoteResult( msg, votes, total ) {
    responseString ="\nCurrent Session: " + sessionName + "\nCurrent Vote: " + currentVote.voteString();
    if (votes.length === 2) {
        responseString += "\nFor: " + votes[0] + "\nAgainst: " + votes[1] + "\nTotal: " + total;
    }
    msg.reply(responseString);
}

function getToken(){
    const data = fs.readFileSync('token.txt', 'UTF-8');
    const token = data.split(/\r?\n/)[0];
    return token;
}
