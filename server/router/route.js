const { Router, json, text } = require("express");
const router = Router();

const fs = require('fs')


let map1 = new Map();
let clientIdCounter = 100;





router.get('/generateId', (req, res) => {
    const id = clientIdCounter;

    clientIdCounter++;

    res.json({
        id: id
    })

});


router.post('/sendData', (req, res) => {
    let { inputdata, id } = req.body;
    id = Number(id)

    // console.log(map1)


    if (map1.has(id) ) {
        // map1.set(id, [...map1.get(id), inputdata]);
        let hasmap1PreviousTextProperty = map1.get(id).hasOwnProperty('text');
        if(hasmap1PreviousTextProperty){

            map1.set(id, {
                ...map1.get(id),
                text: [...map1.get(id).text, inputdata],
    
    
            });

        }else{
            map1.set(id, {
                ...map1.get(id),
                text: [inputdata]
    
    
            });

        }



    } else {

        // map1.set(id, [inputdata]);
        map1.set(id, {
            ...map1.get(id),
            text: [inputdata]


        });


    }

    res.json({
        inputdata,
        id
    })

    console.log(map1)





});


router.post('/uploadfile', (req, res) => {
    let { file_name, file_size, file, id } = req.body;
    let incomming_data = req.body;
    id = Number(id)
    console.log(id)

    if (map1.has(id) ) {
        let hasmap1PreviousFilesProperty = map1.get(id).hasOwnProperty('files');
        if(hasmap1PreviousFilesProperty){

            map1.set(id, {
                ...map1.get(id),
                files: [...map1.get(id).files, {file_name,file_size,file}]
    
            });

        }else{
            map1.set(id, {

                ...map1.get(id),
                files:[{file_name,file_size,file}]
            });

        }

    } else {

        map1.set(id, {

            ...map1.get(id),
            files: [{file_name,file_size,file}]
        });

    }

    res.json(incomming_data)
    console.log('upload call')





})







router.get('/checkData/:id', (req, res) => {
    const id = Number(req.params.id)
    // console.log(map1.get(req.params.id), "outside");
    if (map1.has(id)) {
        let recieveData = map1.get(id);
        res.json({
            recieveData
        });

    } else {

        res.json({
            recieveData: {},
            messege: 'not found'
        });
        // map1.delete(id)
    }

   

})







module.exports = router;
