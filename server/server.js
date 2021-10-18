const express = require('express');
var cors = require('cors');
const path = require('path');
const fs = require('fs');
let WebSocket, { WebSocketServer } = require('ws');
const http = require('http');



const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;


let map = new Map()
let clientIdCounter = 100;





const wss = new WebSocketServer({ server, path: '/websocket/',maxPayload:100000000 })

wss.on('connection', function (ws) {
    map.set(clientIdCounter, ws);
    ws.id = clientIdCounter;
    ws.send(JSON.stringify({
        id: ws.id,
        type: 'generateId'
    }));

    ws.on('message', (message) => {
        let incommingSubmitedData = JSON.parse(message);
        if (incommingSubmitedData.type === 'inputText') {
            if (map.has(+incommingSubmitedData.data.id)) {
                client = map.get(+(incommingSubmitedData.data.id));
                let Data = JSON.stringify({
                    data:{
                       text: incommingSubmitedData.data.inputText,
                       fromid: incommingSubmitedData.data.fromid,
                    },
                    type: 'clientData'
                })
                client.send(Data)
            }

        } else if (incommingSubmitedData.type === 'inputFileData') {
            if (map.has(+incommingSubmitedData.data.id)) {
                console.log('file truu')
                client = map.get(+(incommingSubmitedData.data.id));
                let Data = JSON.stringify({
                    data: {
                        fromid:incommingSubmitedData.data.fromid,
                        file_name: incommingSubmitedData.data.file_name,
                        file_size: incommingSubmitedData.data.file_size,
                        file: incommingSubmitedData.data.file
                    },
                    type: 'inputFileData'
                })
                client.send(Data)
            }

        }

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
