const express = require("express");
var cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("dotenv");
let WebSocket,
  { WebSocketServer } = require("ws");
const http = require("http");

const CBOR = require("cbor");
const ASSERT = require("assert");
const { Buffer } = require("buffer");

config.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

let map = new Map();
let clientIdCounter = 100;

const wss = new WebSocketServer({ server, path: "/websocket/" });

wss.on("connection", function (ws) {
  ws.on("message", (message) => {
    CBOR.decodeFirst(message, (err, obj) => {
      if (err) {
        console.log("error");
      }

      let incommingSubmitedData = obj;
      // console.log(incommingSubmitedData,"incomming data")

      if (incommingSubmitedData.type == "generateId") {
        map.set(clientIdCounter, ws);
        ws.id = clientIdCounter;
        let gid = CBOR.encode({
          id: ws.id,
          type: "generateId",
        });
        ws.send(gid);
        clientIdCounter++;
      } else if (incommingSubmitedData.type == "haveID") {
        map.set(incommingSubmitedData.data.id, ws);
        ws.id = incommingSubmitedData.data.id;
      } else if (incommingSubmitedData.type === "ping") {
        let pongmessage = CBOR.encodeOne(
          {
            type: "pong",
            message: "pong",
          },
          { highWaterMark: 1024 * 1024 }
        );
        ws.send(pongmessage);
      }
      if (incommingSubmitedData.type === "inputTextData") {
        if (map.has(+incommingSubmitedData.data.id)) {
          try {
            client = map.get(+incommingSubmitedData.data.id);
            // client.send(CBOR.encode({type:'loading',isloading:true,toid:incommingSubmitedData.data.fromid}));
            let Data = CBOR.encode({
              data: {
                text: incommingSubmitedData.data.inputText,
                clientAid: incommingSubmitedData.data.clientAid,
                text_size: incommingSubmitedData.data.text_size,
              },
              type: "inputTextData",
            });
            client.send(Data);
          } catch (error) {}
        } else {
          let noClient = CBOR.encode({
            type: "noclient",
            message: "client no avalabale",
            toid: incommingSubmitedData.data.fromid,
          });

          ws.send(noClient);
        }
      } else if (incommingSubmitedData.type === "inputFileChunk") {
        if (map.has(+incommingSubmitedData.clientBid)) {
          try {
            client = map.get(+incommingSubmitedData.clientBid);
            // client.send(CBOR.encode({type:'loading',isloading:true,toid:incommingSubmitedData.data.fromid}));
            //for test
            let obj = {
              data: {
                isLastChunk: incommingSubmitedData.isLastChunk,
                clientAid: incommingSubmitedData.clientAid,
                file_name: incommingSubmitedData.file_name,
                file_size: incommingSubmitedData.file_size,
                file: new Uint8Array(incommingSubmitedData.data),
              },
              type: "inputFileChunk",
            };
            let encode = CBOR.encodeOne(obj, {
              highWaterMark: Math.max(
                4194304 * 2, // 4mb * 2
                incommingSubmitedData.data.length
              ),
            });

            client.send(encode);
          } catch (error) {
            let errorMessage = CBOR.encode({
              type: "error",
              message: "failed to send input file data  to other  client",
            });
            ws.send(errorMessage);
          }
        } else {
          let noClient = CBOR.encode({
            type: "noclient",
            message: "client no avalabale",
            toid: incommingSubmitedData.data.fromid,
          });

          ws.send(noClient);
        }
      } else if (incommingSubmitedData.type === "isrecieved") {
        console.log("receved");
        let client = map.get(+incommingSubmitedData.data.clientAid);
        client.send(
          CBOR.encode({
            data: {
              clientAid: incommingSubmitedData.data.clientAid,
              status: true,
            },
            type: "isrecieved",
          })
        );
      } else if (incommingSubmitedData.type == "isrecievedText") {
        let client = map.get(+incommingSubmitedData.data.clientAid);
        if (client) {
          client.send(
            CBOR.encode({
              data: {
                clientAid: incommingSubmitedData.data.clientAid,
                status: true,
              },
              type: "isrecievedText",
            })
          );
        }
      } else if (incommingSubmitedData.type === "commingStatus") {
        if (map.has(+incommingSubmitedData.data.id)) {
          client = map.get(+incommingSubmitedData.data.id);
          try {
            client.send(
              CBOR.encode({
                type: incommingSubmitedData.type,
                status: incommingSubmitedData.status,
                fromid: incommingSubmitedData.data.fromid,
              })
            );
          } catch (error) {
            let errorMessage = CBOR.encode({
              type: "error",
              message: "failed to send comming status to client",
            });
            ws.send(errorMessage);
          }
        }
      } else if (incommingSubmitedData.type == "disconnected") {
        console.log("disconnected");
        if (map.has(+incommingSubmitedData.recieverId)) {
          let client = map.get(+incommingSubmitedData.recieverId);
          client.send(
            CBOR.encode({
              type: "disconnected",
            })
          );
        }
      }
    });

    // if(incommingSubmitedData.type==='pingpong'){

    //     wss.clients.forEach(function each(client) {
    //         if (client.readyState === WebSocket.OPEN) {
    //             client.send(JSON.stringify(
    //                 {

    //                   type: 'pingpong',
    //                   data: 'pong',
    //                 }
    //               ))
    //         }
    //     });
    // }
  });

  ws.onclose = () => {
    // ws.send(CBOR.encode(
    //     {
    //         type:'lostconnection'
    //     }
    // ))
    map.delete(ws.id);
  };
});

app.use(express.static(path.resolve(__dirname, "../client/build")));
// app.use(express.static('/home/mdebrahim/Documents/MY_CODE/chat/chats/client/build'))

app.use(cors());

app.use(express.json({ limit: "1gb", type: "application/json" }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
server.listen(port, () => {
  console.log(`server runnig from ${port}`);
});

module.exports = {
  wss: wss,
};
