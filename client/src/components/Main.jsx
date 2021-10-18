import React, { useState, useEffect, useRef } from 'react'
import './main.css'
import axios from 'axios'
import { FiFilePlus, FiDownload, FiCopy } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { VscInbox } from 'react-icons/vsc';

import { Base64 } from 'js-base64';
import { IncommingFiles } from './IncommingFiles';
import { IncommingTexts } from './IncommingTexts';
//  import WebSocket from 'ws';



export default function Main() {



  const [fetchId, setFetchId] = useState({ id: '' });
  const [store, setStore] = useState({
    id: '',
    inputText: '',

  });

  const [filestore, setFiletore] = useState('');


  const [recievedData, setRecievedData] = useState({
    text: [],
    files: [],

  });
  let recievedDataRef = { ...recievedData }
  const inputref = useRef();
  const [imgsrc, setimgsrc] = useState("");
  const downloadRef = useRef()
  const wsRef = useRef()

  const btnRef = useRef()

  const WebSocketConnection = () => {
    const ws = new WebSocket('ws://localhost:5000/websocket/');
    wsRef.current = ws;
    ws.onopen = (e) => {
      console.log('websocket server connected..');

    }

    ws.onmessage = (e) => {
      let incommingData = JSON.parse(e.data);

      if (incommingData.type === 'generateId') {
        setFetchId(({ id: +(incommingData.id) }))
      } else if (incommingData.type === 'clientData') {
        console.log(incommingData.data, 'test');
        let newRecievedData = { ...recievedDataRef, text: [...recievedDataRef.text, incommingData.data] };
        setRecievedData(newRecievedData);
        recievedDataRef = newRecievedData;
        showfiledBox(2)
      } else if (incommingData.type === 'inputFileData') {
        let newRecievedData = { ...recievedDataRef, files: [...recievedDataRef.files, incommingData.data] };
        setRecievedData(newRecievedData);
        recievedDataRef = newRecievedData;
        showfiledBox(2)

      }
    }
    ws.onclose = (e) => {
      console.log('websocket server disconnected');
      ws.send(`${ws.id}`)


    }
    ws.onerror = (e) => {
      console.log('websocket error', e)
    }





  }


  useEffect(() => {
    WebSocketConnection();


  }, [])




  const handleSubmit = (e) => {
    e.preventDefault()
    if (store.inputText != '') {

      let storeData = JSON.stringify({

        data: {
          ...store,
          fromid: fetchId.id

        },
        type: 'inputText'
      })

      wsRef.current.send(storeData);
      setStore({ ...store, inputText: '' })
    }


    let fileSizeinByte = filestore.file_size;
    let fileSizeinKb = (fileSizeinByte / 1000);
    console.log(fileSizeinKb, 'fileSizeinKb')

    if (filestore !== '' && fileSizeinKb <= 30000 && store.id !== '') {
      let inputFileData = JSON.stringify({
        data: filestore,
        type: 'inputFileData'
      })

      wsRef.current.send(inputFileData)
      setFiletore('');
      inputref.current.value = ""


    } else if (store.id === '') {
      e.preventDefault()
      alert('plase enter te recepant id')
    }
  }


  const showfiledBox = (n) => {
    const allFiled = document.querySelectorAll('.dataContainer .filed');
    const allLists = document.querySelectorAll('.list');
    for (let i = 0; i < allFiled.length; i++) {
      allFiled[i].style.display = 'none'
    }
    for (let j = 0; j < allLists.length; j++) {
      allLists[j].style.color = 'black'
      allLists[j].style.borderBottom = '';

    }
    allLists[n].style.color = 'rgb(24, 144, 255)';
    allLists[n].style.borderBottom = '3px solid rgb(24, 144, 255)';
    allFiled[n].style.display = 'block'
  }


  const handleChange = (e, name) => {
    let val = e.target.value;
    setStore({
      ...store, [name]: val
    })




  }


  const fileChoose = () => {

    inputref.current.click();

  }

  useEffect(() => {
    if (filestore) {

      setFiletore({ ...filestore, id: store.id })
    }


  }, [store.id])



  const arrayBufferToBase64 = async () => {
    let selected_file = inputref.current.files[0];
    const arraybuffertoInt8 = new Uint8Array(await selected_file.arrayBuffer())
    const base64_sellected_file = Base64.fromUint8Array(arraybuffertoInt8);
    let id = Number(store.id);
    let fromid = Number(fetchId.id)
    setFiletore({
      id: id,
      fromid: fromid,
      file_name: selected_file.name,
      file_size: selected_file.size,
      file: base64_sellected_file,


    })

  }


  const bse64toFileUrl = (base64String) => {
    let base64toUint8Array = Base64.toUint8Array(base64String);
    let blob = new Blob([base64toUint8Array])

    downloadRef.current.href = URL.createObjectURL(blob)
    console.log(URL.createObjectURL(blob, 'url'))
    console.log(downloadRef.current)

  }



  return (
    <>
      {
        console.log(recievedData.text, 'receved')
      }

      <div className="wrapper">
        <div className="container">

          <p>MY ID <span>{fetchId.id}</span></p>


          <div className="lists">
            <div>
              <p className="list" onClick={() => { showfiledBox(0) }}> send Text</p>
            </div>
            <div>
              <p className="list" onClick={() => { showfiledBox(1) }}>send file</p>
            </div>
            <div>
              <p className="list" onClick={() => { showfiledBox(2) }}>Recieved Text</p>
            </div>


          </div>
          <div className="dataContainer">

            <div className="sendText filed ">
              <form action="">
                <textarea value={store.inputText} placeholder="paste or write your text to send" name="inputText" id="" style={{ width: "100%", height: "200px" }} onChange={(e) => handleChange(e, 'inputText')}  rows="200" >
                </textarea>
              </form>
            </div>

            <div className="sendfile filed ">
              <div className="icon">
                <div style={{ display: 'flex', flexDirection: 'column',justifyContent:'center',alignItems:'center' }}>
                  <VscInbox onClick={fileChoose} className="fileIcon" />
                  <p style={{fontSize:'25px'}}>Click this to send the file</p>

                </div>


              </div>

              <input type="file" multiple style={{ display: 'none' }} ref={inputref} onChange={arrayBufferToBase64} />
            </div>

            <div className="recievedText filed ">
              <IncommingTexts recievedData={recievedData} />
              <IncommingFiles
                downloadRef={downloadRef}
                recievedData={recievedData}
                bse64toFileUrl={bse64toFileUrl}
              />


            </div>


          </div>

          <div className="recipientId">
            <form action="">
              <label htmlFor="recipientid"><button>Recipient Id</button> </label>
              <input value={store.id} placeholder="Enter Recipient Id" id="recipientid" className="recipientData" type="text" name="recipientData" onChange={(e) => handleChange(e, 'id')} />
            </form>
          </div>

          <div className="send">
            <button onClick={handleSubmit}>Send</button>
          </div>




        </div>

      </div>

      <footer  >
        <p>Md Ebrahim © 2021</p>
      </footer>





    </>
  )
}





