import React, { useState, useEffect, useRef } from 'react'
import './main.css'
import axios from 'axios'
import { FiFilePlus, FiDownload, FiCopy } from 'react-icons/fi';
import { Base64 } from 'js-base64';



export default function Main() {



	const [fetchId, setFetchId] = useState({});
	const [store, setStore] = useState({
		id: undefined,
		inputText: '',

	});

	const [filestore, setFiletore] = useState('');


	const [recievedData, setRecievedData] = useState({});
	let recievedDataRef = { ...recievedData }
	const inputref = useRef();
	const [imgsrc, setimgsrc] = useState("");
	const downloadRef = useRef()




	const generateId = async () => {

		// const res = await axios.get(`${window.location.protocol}//${window.location.host}/api/generateId`);
		const res = await axios.get(`http://localhost:5000/api/generateId`);

		setFetchId(res.data);

	}

	useEffect(() => {
		document.title = "Chats_App"
		generateId()


	}, []);


	useEffect(() => {
		let setTimoutId;


		setTimoutId = setTimeout(async function fn() {

			// const res = await axios.get(`${window.location.protocol}//${window.location.host}/api/checkData/${fetchId.id}`);
			const res = await axios.get(`http://localhost:5000/api/checkData/${fetchId.id}`);


			let newRecievedData = { ...recievedDataRef, ...res.data.recieveData };
			setRecievedData(newRecievedData);
			recievedDataRef = newRecievedData;

			// let length = res.data.recieveData.length;

			setTimoutId = setTimeout(fn, 5000);


		}, 5000);

		return () => {
			clearTimeout(setTimoutId);

		}


	}, [fetchId]);


	const showfiledBox = (n) => {


		const allFiled = document.querySelectorAll('.dataContainer .filed');

		for (let i = 0; i < allFiled.length; i++) {
			allFiled[i].style.display = 'none'
		}

		allFiled[n].style.display = 'block'
	}


	const handleChange = (e, name) => {
		let val = e.target.value;
		setStore({
			...store, [name]: val
		})




	}



	const handleSubmit = async (e) => {
		e.preventDefault();
		let { id, inputText: inputdata } = store;

		// let inputdata = inputText;
		if (store.inputText !== null && store.inputText != '') {

			const res = await axios.post(`http://localhost:5000/api/sendData`, {
				id,
				inputdata
			});
			console.log(res.data)
			setStore({ ...store, inputText: '' })
		}

		if (filestore !== '') {

			const res2 = await axios.post('http://localhost:5000/api/uploadfile', filestore);
			setFiletore('');
			inputref.current.value = ""

			console.log(res2.data);
		}



	}


	const fileChoose = () => {

		inputref.onChange()
	}

	useEffect(() => {
		if(filestore){

			setFiletore({ ...filestore, id: store.id })
		}

	}, [store.id])



	const arrayBufferToBase64 = async () => {
		let selected_file = inputref.current.files[0];
		const arraybuffertoInt8 = new Uint8Array(await selected_file.arrayBuffer())
		const base64_sellected_file = Base64.fromUint8Array(arraybuffertoInt8);
		let id = Number(store.id);
		setFiletore({
			id: id,
			file_name: selected_file.name,
			file_size: selected_file.size,
			file: base64_sellected_file,


		})

	}


	const bse64toFileUrl = (base64String,) => {
		let base64toUint8Array = Base64.toUint8Array(base64String);
		let blob = new Blob([base64toUint8Array])

		downloadRef.current.href = URL.createObjectURL(blob)
		console.log(URL.createObjectURL(blob, 'url'))
		console.log(downloadRef.current)

	}



	return (
		<>
			{
				console.log(recievedData)
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
								<textarea value={store.inputText} name="inputText" id="" style={{ width: "100%", height: "150px" }} onChange={(e) => handleChange(e, 'inputText')}  >
								</textarea>
							</form>
						</div>

						<div className="sendfile filed ">
							<div className="icon">
								<FiFilePlus onClick={fileChoose} className="fileIcon" />
								<input type="file" multiple ref={inputref} onChange={arrayBufferToBase64} />


							</div>

						</div>

						<div className="recievedText filed ">

							<h1 style={{ color: "blue" }}>All Text</h1>


							{

								recievedData.text ? recievedData.text.map((elm, index) =>
									<>

										<div key={index} className="texts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<h1 >{elm}</h1>
											<FiCopy style={{ fontSize: '25px', cursor: 'pointer' }} />


										</div>

									</>

								)

									: null


							}
							<h1 style={{ color: "blue" }}>All files</h1>
							{
								recievedData.files ? recievedData.files.map((elm, index) =>


									<>

										<div key={index} className="files" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

											<h1>
												{elm.file_name}{elm.file_size}

											</h1>
											<a ref={downloadRef} download={elm.file_name} href="#"><FiDownload onClick={() => { bse64toFileUrl(elm.file) }} style={{ fontSize: '25px' }} /></a>


										</div>



									</>

								)

									: null
							}

						</div>


					</div>

					<div className="recipientId">
						<form action="">
							<label htmlFor=""><button>Recipient Id</button> </label>
							<input value={store.id} className="recipientData" type="text" name="recipientData" onChange={(e) => handleChange(e, 'id')} />
						</form>
					</div>

					<div className="send">
						<button onClick={handleSubmit}>Send</button>
					</div>




				</div>



			</div>
			<footer  >
				{

				}
				<p>Md Ebrahim © 2021</p>

			</footer>





		</>
	)
}



