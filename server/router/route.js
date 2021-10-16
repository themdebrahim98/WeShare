const { Router, json, text } = require("express");
const router = Router();
const { WebSocketServer } = require('ws')
const fs = require('fs')
const map = require('../data')


// let map = new Map();
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

    // console.log(map)


    if (map.has(id)) {
        // map.set(id, [...map.get(id), inputdata]);
        let hasmapPreviousTextProperty = map.get(id).hasOwnProperty('text');
        if (hasmapPreviousTextProperty) {

            map.set(id, {
                ...map.get(id),
                text: [...map.get(id).text, inputdata],


            });

        } else {
            map.set(id, {
                ...map.get(id),
                text: [inputdata]


            });

        }



    } else {

        // map.set(id, [inputdata]);
        map.set(id, {
            ...map.get(id),
            text: [inputdata]


        });


    }

    res.json({
        inputdata,
        id
    })

    console.log(map)





});


router.post('/uploadfile', (req, res) => {
    let { file_name, file_size, file, id } = req.body;
    let incomming_data = req.body;
    id = Number(id)
    console.log(id)

    if (map.has(id)) {
        let hasmapPreviousFilesProperty = map.get(id).hasOwnProperty('files');
        if (hasmapPreviousFilesProperty) {

            map.set(id, {
                ...map.get(id),
                files: [...map.get(id).files, { file_name, file_size, file }]

            });

        } else {
            map.set(id, {

                ...map.get(id),
                files: [{ file_name, file_size, file }]
            });

        }

    } else {

        map.set(id, {

            ...map.get(id),
            files: [{ file_name, file_size, file }]
        });

    }

    res.json(incomming_data)
    console.log('upload call',map)





})










// router.get('/checkData/:id', (req, res) => {
//     const id = Number(req.params.id)
//     // console.log(map.get(req.params.id), "outside");
//     if (map.has(id)) {
//         let recieveData = map.get(id);
//         res.json({
//             recieveData
//         });

//     } else {

//         res.json({
//             recieveData: {},
//             messege: 'not found'
//         });
//         // map.delete(id)
//     }



// })







module.exports ={router:router,map:map};
