import React, { useState, useEffect, useRef } from 'react'
import './main.css'
import axios from 'axios'




export default function Main() {


  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(false);
  const [fetchId, setFetchId] = useState({});
  const [store, setStore] = useState({
    id: "",
    inputText: ""
  });

  const [recievedData, setRecievedData] = useState([]);
  let recievedDataRef = [...recievedData]


  const generateId = async () => {

    const res = await axios.get('http://localhost:5000/api/generateId');

    setFetchId(res.data);

  }

  useEffect(() => {
    generateId()


  }, [])






  useEffect(() => {
    let setTimoutId;


    setTimoutId = setTimeout(async function fn() {

      const res = await axios.get(`http://localhost:5000/api/checkData/${fetchId.id}`);

      let newRecievedData = [...recievedDataRef, ...res.data.recieveData];
      setRecievedData(newRecievedData);
      recievedDataRef = newRecievedData;

      let length = res.data.recieveData.length;

      if (length > 0) {
        setShow1(false);
        setShow2(true);


      }


      setTimoutId = setTimeout(fn, 1000);


    }, 1000);

    return () => {
      clearTimeout(setTimoutId);

    }


  }, [fetchId]);

















  const isShow1 = () => {

    if (show1) {
      setShow2(false);


    } else {
      setShow1(true);
      setShow2(false)
    }


  }

  const isShow2 = () => {
    if (show2) {
      setShow1(false);
    } else {
      setShow2(true);
      setShow1(false)
    }
  }


  const handleChange = (e, name) => {
    let val = e.target.value;
    setStore({
      ...store, [name]: val
    })

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, inputText: inputdata } = store;
    // let inputdata = inputText;
    console.log(store, "store");
    const res = await axios.post('http://localhost:5000/api/sendData', {
      id,
      inputdata
    });
    console.log(res);



  }

  return (
    <>
      <div className="wrapper">
        <div className="container">

          <p>MY ID <span>{fetchId.id}</span></p>


          <div className="lists">
            <div className={show1 ? `list show` : `list`}>
              <p onClick={isShow1}> send Text</p>
            </div>
            <div className={show2 ? `list show ` : `list `}>
              <p onClick={isShow2}>Recieved Text</p>
            </div>

          </div>
          <div className="dataContainer">

            {

              show1 ?

                <div className="sendText">
                  <form action="">

                    <textarea value={store.inputText} name="inputText" id="" style={{ width: "100%", height: "150px" }} onChange={(e) => handleChange(e, 'inputText')}  >

                    </textarea>
                  </form>


                </div>

                : null


            }
            {
              show2 ? <div className="recievedText  ">


                {
                  recievedData.map((data,index) => {
                    return(
                      <h1 key={index}>{data}</h1>
                    )
                  })
                }

              </div>
                :
                null
            }



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






    </>
  )
}
