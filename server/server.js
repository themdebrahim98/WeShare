const express = require('express');
var cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('dotenv')
let WebSocket, { WebSocketServer } = require('ws');
const http = require('http');

const CBOR = require('cbor');
const ASSERT = require('assert');
const { Buffer } = require('buffer')



config.config()

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;


let map = new Map()
let clientIdCounter = 100;





const wss = new WebSocketServer({ server, path: '/websocket/' })

wss.on('connection', function (ws) {
    map.set(clientIdCounter, ws);
    ws.id = clientIdCounter;
    let gid = CBOR.encode({
        id: ws.id,
        type: 'generateId'
    });
    ws.send(gid);

    ws.on('message', (message) => {


        CBOR.decodeFirst(message, (err, obj) => {
            if (err) {
                console.log('error')
            }

            let incommingSubmitedData = obj;
            if (incommingSubmitedData.type === 'ping') {
                let pongmessage = CBOR.encodeOne({
                    type: 'pong',
                    message: 'pong'
                }, { highWaterMark: 1024 * 1024 });
                ws.send(pongmessage);

            }
            if (incommingSubmitedData.type === 'inputText') {
                if (map.has(+incommingSubmitedData.data.id)) {
                    client = map.get(+(incommingSubmitedData.data.id));
                    // client.send(CBOR.encode({type:'loading',isloading:true,toid:incommingSubmitedData.data.fromid}));
                    let Data = CBOR.encode({
                        data: {
                            text: incommingSubmitedData.data.inputText,
                            fromid: incommingSubmitedData.data.fromid,
                            text_size: incommingSubmitedData.data.text_size

                        },
                        type: 'clientData'
                    })
                    client.send(Data)
                } else {
                    let noClient = CBOR.encode({
                        type: 'noclient',
                        message: 'client no avalabale',
                        toid: incommingSubmitedData.data.fromid,
                    });

                    ws.send(noClient);

                }

            } else if (incommingSubmitedData.type === 'inputFileData') {
                // console.log(incommingSubmitedData.file.byteLength);
                if (map.has(+incommingSubmitedData.data.id)) {


                    client = map.get(+(incommingSubmitedData.data.id));
                    // client.send(CBOR.encode({type:'loading',isloading:true,toid:incommingSubmitedData.data.fromid}));
                    //for test
                    let obj = {
                        data: {

                            fromid: incommingSubmitedData.data.fromid,
                            file_name: incommingSubmitedData.data.file_name,
                            file_size: incommingSubmitedData.data.file_size,
                            file: new Uint8Array(incommingSubmitedData.data.file)
                        },
                        type: "inputFileData",


                    }
                    let encode = CBOR.encodeOne(obj, { highWaterMark: Math.max(5 * 1024 * 1024, +incommingSubmitedData.data.file_size + 2 * 1024) })



                    client.send(encode);


                }

            } else if (incommingSubmitedData.type === 'isrecieved') {
                console.log('recieved', incommingSubmitedData)
                client = map.get(+(incommingSubmitedData.data.toclientid));
                client.send(CBOR.encode({
                    data: {
                        toclientid: incommingSubmitedData.data.fromid,
                        status: true
                    },
                    type: 'isrecieved',

                }))
            } else if (incommingSubmitedData.type === 'loadingStatusSend') {
                if (map.has(+incommingSubmitedData.data.id)) {
                    client = map.get(+(incommingSubmitedData.data.id));
                    client.send(CBOR.encode({type:'loading',isloading:false,toid:incommingSubmitedData.data.fromid}));
                }


            }
        })

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

    })


    clientIdCounter++;

    ws.onclose = () => {
        console.log('clientdisconnected', ws.id)
        map.delete(ws.id)
    }

})


app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.use(express.static('/home/mdebrahim/Documents/MY_CODE/chat/chats/client/build'))
console.log(path.resolve(__dirname, '../client/build'));

app.use(cors())

app.use(express.json({ limit: '1gb', type: 'application/json' }));

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,"../client/build/index.html"));
})
server.listen(port, () => {
    console.log(`server runnig from ${port}`)
    
})


module.exports = {
    wss: wss
}
