const express = require('express');
var cors = require('cors');
const path = require('path');
const fs = require('fs');
let WebSocket, { WebSocketServer } = require('ws');
const http = require('http');

const CBOR = require('cbor');
const ASSERT = require('assert');
const { Buffer } = require('buffer')





const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;


let map = new Map()
let clientIdCounter = 100;





const wss = new WebSocketServer({ server, path: '/websocket/'})

wss.on('connection', function (ws) {
    map.set(clientIdCounter, ws);
    ws.id = clientIdCounter;
    let gid = CBOR.encode({
        id: ws.id,
        type: 'generateId'
    });

    console.log(gid,'gid');

    ws.send(gid);




    ws.on('message', (message) => {
        // console.log(message, 'from client');

        CBOR.decodeFirst(message, (err, obj) => {
            if (err) {
                console.log('error')
            }

            let incommingSubmitedData = obj;
            console.log(incommingSubmitedData)

            if (incommingSubmitedData.type === 'inputText') {
                if (map.has(+incommingSubmitedData.data.id)) {
                    client = map.get(+(incommingSubmitedData.data.id));
                    let Data = CBOR.encode({
                        data: {
                            text: incommingSubmitedData.data.inputText,
                            fromid: incommingSubmitedData.data.fromid,
                            text_size: incommingSubmitedData.data.text_size

                        },
                        type: 'clientData'
                    })
                    client.send(Data)
                }

            } else if (incommingSubmitedData.type === 'inputFileData') {
                // console.log(incommingSubmitedData.file.byteLength);
                if (map.has(+incommingSubmitedData.data.id)) {
                    console.log('file truu')
                    client = map.get(+(incommingSubmitedData.data.id));
                    //for test
                    let obj = {
                        data: {
                            name: "jhsbcgjasvgc",
                            roll: 2255,
                            fromid: incommingSubmitedData.data.fromid,
                            file_name: incommingSubmitedData.data.file_name,
                            file_size: incommingSubmitedData.data.file_size,
                            file: new Uint8Array( incommingSubmitedData.data.file)
                        },
                        type:"inputFileData",


                    }
                    console.log('check',+incommingSubmitedData.data.file_size)
                    let encode = CBOR.encodeOne(obj, {highWaterMark: Math.max(5*1024*1024, +incommingSubmitedData.data.file_size +2*1024 )})
                    // console.log(obj.data);
                    console.log(encode, 'text');
                    CBOR.decodeFirst(encode,(err,object)=>{
                        if(err){
                            console.log('tag',err);
                            return;
                        }
                        console.log(object,'decode')
                    })
                    // let decode = CBOR.decode(encode)
                    // console.log(encode, decode)


                    // let file = new Uint8Array(incommingSubmitedData.data.file);
                    // console.log(file)
                    // let Data = CBOR.encode({
                    //     data: {
                    //         fromid: incommingSubmitedData.data.fromid,
                    //         file_name: incommingSubmitedData.data.file_name,
                    //         file_size: incommingSubmitedData.data.file_size,
                    //         file:new Uint8Array(incommingSubmitedData.data.file)
                    //     },
                    //     type: 'inputFileData'
                    // });
                    //     console.log(Data)
                    //    console.log(CBOR.decode(Data))
                    // console.log(encode.byteLength);
                    client.send(encode);
                    // console.log(encode, 'text');


                }

            } else if (incommingSubmitedData.type === 'isrecieved') {
                // recieved status send to client
                client = map.get(+(incommingSubmitedData.data.toclientid));
                client.send(CBOR.encode({
                    data: {
                        toclientid: incommingSubmitedData.data.fromid,
                        status: true
                    },
                    type: 'isrecieved',

                }))
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


server.listen(port, () => {
    console.log(`server runnig from ${port}`)
})


module.exports = {
    wss: wss
}
