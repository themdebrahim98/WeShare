
const map = require('./data')




function setDataToMap(incommingData) {
    let {id,inputText:inputdata} = incommingData;
    id = +id


    // map.set(incommingData.id, { text: [incommingData.inputText] })


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

}

function setFiletoMap(incommingFile){
    let { file_name, file_size, file, id } = incommingFile;
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


}

module.exports = {
    setDataToMap:setDataToMap,
    setFiletoMap:setFiletoMap
    

}