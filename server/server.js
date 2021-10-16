const express = require('express');
const { router } = require('./router/route');
var cors = require('cors');
const path = require('path');
const fs = require('fs');
let WebSocket, { WebSocketServer } = require('ws');
const http = require('http');
const { setDataToMap,setFiletoMap } = require('./helper')
const map = require('./data')



const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;



let clientIdCounter = 100;





const wss = new WebSocketServer({ server, path: '/websocket/' })
wss.on('connection', function (ws) {
    ws.id = clientIdCounter;
    ws.send(JSON.stringify({
        id: ws.id,
        type: 'generateId'
    }));

    ws.on('message', (message) => {
        let incommingSubmitedData = JSON.parse(message);
        if (incommingSubmitedData.type === 'inputText') {

            setDataToMap(incommingSubmitedData);
        } else if (incommingSubmitedData.type === 'inputFileData') {
            setFiletoMap(incommingSubmitedData)

        }
        console.log(map, 'check')

        console.log(message.toString('utf-8'))
        wss.clients.forEach(function each(client) {


            if (map.has(client.id)) {
                const data = JSON.stringify(map.get(client.id))
                client.send(JSON.stringify({
                    data: data,
                    type: 'clientData'
                }));
                console.log(data)
            } else {
                console.log('no id in map')
            }

            console.log(client.id)
        });
        // console.log( map.has(client.id.toString()))


    })

    // getDataFromMapToClient()




    clientIdCounter++;



})

// console.log(map)

app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.use(express.static('/home/mdebrahim/Documents/MY_CODE/chat/chats/client/build'))
console.log(path.resolve(__dirname, '../client/build'));

app.use(cors())

app.use(express.json({ limit: '1gb', type: 'application/json' }));




app.use('/api', router);





server.listen(port, () => {
    console.log(`server runnig from ${port}`)
})


module.exports = {
    wss: wss
}
