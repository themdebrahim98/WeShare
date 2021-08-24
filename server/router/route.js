const { Router, json } = require("express");
const router = Router();



const map1 = new Map();
let clientIdCounter = 100;





router.get('/generateId', (req, res) => {
 const id = clientIdCounter ;

 clientIdCounter++;

    res.json({
        id: id
    })

});


router.post('/sendData', (req, res) => {
    const { inputdata, id } = req.body;
    if (map1.has(id)) {
        map1.set(id, [...map1.get(id),inputdata]);
    } else {

        map1.set(id, [inputdata]);

    }

    res.json({
        inputdata,
        id
    })
    console.log(inputdata,id)


});






router.get('/checkData/:id', (req, res) => {
    const id = req.params.id
    // console.log(map1.get(req.params.id), "outside");
    if (map1.has(id)) {
        let recieveData = map1.get(id);
        res.json({
            recieveData
        });
        map1.set(id,[])

    } else {

        res.json({
            recieveData: []
        });
    }

   






})





module.exports = router;
