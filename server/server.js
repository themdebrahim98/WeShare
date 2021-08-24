const express = require('express');
const router = require('./router/route');
var cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.use(express.static('/home/mdebrahim/Documents/MY_CODE/chat/chats/client/build'))
console.log(path.resolve(__dirname,'../client/build'));


app.use(express.json());
app.use(cors())
app.use('/api', router);



app.listen(port, () => {
    console.log(`server runnig from ${port}`)
})


