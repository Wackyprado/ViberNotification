require("dotenv").config();

const express = require("express");
const cors = require('cors')
const bodyParser = require("body-parser");
const axios = require("axios");
const https = require('https');

const app = express();
app.use(bodyParser.json());
const { VIBER_TOKEN,END_POINT,ALLOWED_ORIGIN,ALLOWED_ORIGIN_2 } = process.env;

const agent = new https.Agent({
  rejectUnauthorized: false
});

app.use(cors({
  origin: [ ALLOWED_ORIGIN,ALLOWED_ORIGIN_2 ],
}))

const headers = {
  "X-Viber-Auth-Token": VIBER_TOKEN,
  "Content-Type": "application/json",
};



app.post("/viber/webhook", (req, res) => {
  const body = req.body;
  if (body.event === "message" && body.message.type === "text") {
    const userId = body.sender.id;

    const name = body.sender.name;
    if(body.message.text === "start" || body.message.text === "Start") {

    const replyText = `Welcome ${name}! You're now subcribed to our Ardent Notification `;
    sendTextMessage(userId, replyText);

    }

  }

  if (body.event === "conversation_started") {
    const { id, name } = body.user;
    const context = body.context
    console.log("context", context);
    console.log("id", id);

    if(context){
        save_user(id,context)
    }

    welcomeMessage(id, name);
  }

  res.sendStatus(200);
});


app.post("/sendMessage", (req,res) => {
    const body = req.body;
    const {viber_id,message,botName} = body;

    console.log(body)
    sendTextMessage(viber_id,message, botName ? botName : 'Ardent Notification')

    res.json({ message: "Message sent" });
})


async function save_user(viberId,employee_id){
    await axios.get(`${END_POINT}/save_viber?viber_id=${viberId}&employee_id=${employee_id}`,{httpsAgent:agent})
}


function welcomeMessage(
  receiverId,
  receiverName,
  botName = "Ardent Notification"
) {
  axios
    .post(
      "https://chatapi.viber.com/pa/send_message",
      {
        receiver: receiverId,
        min_api_version: 1,
        sender: {
          name: botName,
        },
        type: "text",
        text: `Welcome ${receiverName} ! Hope Your Doing Well.`,
      },
      {
        headers,
      }
    )
    .then((response) => {
      console.log("Welcome message sent:", response.data);
    })
    .catch((error) => {
      console.error(
        "Error sending welcome message:",
        error.response?.data || error.message
      );
    });
}

function sendTextMessage(
  receiverId,
  messageText,
  botName = "Ardent Notification"
) {
  axios
    .post(
      "https://chatapi.viber.com/pa/send_message",
      {
        receiver: receiverId,
        min_api_version: 1,
        sender: {
          name: botName,
        },
        type: "text",
        text: messageText,
      },
      {
        headers,
      }
    )
    .then((response) => {
      console.log("Message sent:", response.data);
    })
    .catch((error) => {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    });
}

app.listen(3000, () => {
  console.log("Viber bot server running on port 3000");
});
