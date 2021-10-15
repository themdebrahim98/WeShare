const express = require('express');
const router = require('./router/route');
var cors = require('cors');
const path = require('path');
const fs  = require('fs')

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.use(express.static('/home/mdebrahim/Documents/MY_CODE/chat/chats/client/build'))
console.log(path.resolve(__dirname,'../client/build'));

app.use(cors())

app.use(express.json({limit:'1gb',type:'application/json'}));
// app.use(express.raw({type: "image/jpeg",limit:'4gb'}));

// app.post('/api/uploadfile',(req,res)=>{
//     console.log(req.body);
//     fs.writeFile("data.jpeg", req.body, (err) => {
//         if (err)
//           console.log('error');
//         else {
//           console.log("File written successfully\n");
//         }
//       });
   

    
// })


app.use('/api', router);



app.listen(port, () => {
    console.log(`server runnig from ${port}`)
})


