import React, { useState, useEffect, useRef, Children } from 'react'
import './main.css'
import { VscInbox } from 'react-icons/vsc';

import { Base64 } from 'js-base64';
import { IncommingFiles } from './IncommingFiles';
import { IncommingTexts } from './IncommingTexts';
import { ImSpinner9 } from 'react-icons/im';
import CBOR from 'cbor-js'
import Loader from './Loader';




export default function Main() {


	let ishttps;
	let hostname;
	if (window.location.protocol === 'https:') {
		ishttps = 'wss:'
		hostname = window.location.hostname;
	} else if (window.location.protocol === 'http:') {
		ishttps = 'ws:';
		hostname = window.location.host;
	}


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
	const downloadRef = useRef()
	const wsRef = useRef()
	const [issend, setIssend] = useState(true);
	const [isloading, setIsloading] = useState(false);
	const [fromid, setFromid] = useState(null)



	const WebSocketConnection = () => {
		let url = `${ishttps}//${hostname}/websocket/`
		let url2 = `ws://localhost:5000/websocket/`


		let ws = new WebSocket(url);
		ws.binaryType = 'arraybuffer'
		wsRef.current = ws;
		ws.onopen = (e) => {
			console.log('websocket server connected..');
			let pingmessage = CBOR.encode({
				type: 'ping',
				message: 'ping'
			});


			setInterval(() => {

				ws.send(pingmessage);
			}, 5000);

		}

		ws.onmessage = (e) => {

			let incommingData = CBOR.decode(e.data);
			console.log(incommingData.message)


			if (incommingData.type === 'generateId') {
				setFetchId(({ id: +(incommingData.id) }))
			} else if (incommingData.type === 'clientData') {
				console.log(incommingData, 'test');
				let newRecievedData = { ...recievedDataRef, text: [...recievedDataRef.text, incommingData.data] };
				setRecievedData(newRecievedData);
				recievedDataRef = newRecievedData;
				setIsloading(false)
				// recieved status send to client
				ws.send(CBOR.encode({
					data: {
						toclientid: incommingData.data.fromid,
						status: true
					},
					type: 'isrecieved',


				}));
				showfiledBox(2)
			} else if (incommingData.type === 'inputFileData') {
				let newRecievedData = { ...recievedDataRef, files: [...recievedDataRef.files, incommingData.data] };

				setRecievedData(newRecievedData);
				recievedDataRef = newRecievedData;
				showfiledBox(2);
				setIsloading(false)

				ws.send(CBOR.encode({
					data: {
						toclientid: incommingData.data.fromid,
						status: true
					},
					type: 'isrecieved',


				}));


			} else if (incommingData.type === 'isrecieved') {
				setIssend(incommingData.data.status);


			} else if (incommingData.type === 'noclient') {
				alert('this id not avalable');
				setIssend(true)

			} else if (incommingData.type === 'loading') {
				setIsloading(true);
				setFromid(incommingData.toid);
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




	const handleSubmit = async (e) => {
		e.preventDefault()
		let fileSizeinByte = filestore.file_size;
		let fileSizeinKb = (fileSizeinByte / 1000);

		if (store.inputText !== '' && store.id !== '') {
			let blob = new Blob([store.inputText]);

			let loadingStatusSend = CBOR.encode({

				data: {
					id: store.id,
					fromid: fetchId.id,
				},
				type: 'loadingStatusSend'
			});
			let storeData = CBOR.encode({
				data: {
					...store,
					fromid: fetchId.id,
					text_size: blob.size

				},
				type: 'inputText'
			});
			await wsRef.current.send(loadingStatusSend)
			await wsRef.current.send(storeData);
			setIssend(false)
			setStore({ ...store, inputText: '' })
		} else if (filestore !== '' && fileSizeinKb <= 30000 && store.id !== '') {

			let loadingStatusSend = CBOR.encode({

				data: {
					id: filestore.id,
					fromid: filestore.fromid,
				},
				type: 'loadingStatusSend'
			});

			let inputFileData = CBOR.encode({
				data: filestore,
				type: 'inputFileData'
			});



			await wsRef.current.send(loadingStatusSend);
			await wsRef.current.send(inputFileData)
			setFiletore('');
			inputref.current.value = ""
			setIssend(false)



		} else {
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
		allLists[n].style.transition = 'color .2s ease-in'
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
		let id = Number(store.id);
		let fromid = Number(fetchId.id)
		setFiletore({
			id: id,
			fromid: fromid,
			file_name: selected_file.name,
			file_size: selected_file.size,
			file: arraybuffertoInt8,


		})

	}


	const bse64toFileUrl = (base64String) => {
		alert("download start..")
		let blob = new Blob([base64String])

		downloadRef.current.href = URL.createObjectURL(blob)
		downloadRef.current.onload = function () {
			URL.revokeObjectURL(downloadRef.current.href);
		}


	}



	return (
		<>


			<div className="wrapper">
				<div className="container">
					{
						isloading ? <Loader fromid={fromid} /> : null
					}


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
								<textarea value={store.inputText} placeholder="paste or write your text to send" name="inputText" id="" style={{ width: "100%", height: "240px" }} onChange={(e) => handleChange(e, 'inputText')} rows="240" >
								</textarea>
							</form>
						</div>

						<div className="sendfile filed ">
							<div className="icon">
								<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
									<VscInbox onClick={fileChoose} className="fileIcon" />
									<p style={{ fontSize: '25px' }}>Click this to send the file</p>

								</div>

							</div>
							<p style={{ fontSize: '18px' }}>{filestore.file_name}</p>


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
						<button onClick={handleSubmit}>

							{issend ?

								"send"
								:
								<>

									<div class="spin"></div>
									<span className="sending ">sending..</span>

								</>
							}

						</button>
						{/* {issend ? console.log('send') : console.log('sending')} */}
					</div>




				</div>

			</div>

			<footer  >
				<p>Md Ebrahim © 2021</p>
			</footer>





		</>
	)
}





