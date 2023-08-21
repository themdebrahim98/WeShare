import React, { useState, useEffect, useRef, Children } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import './main.css'
import { VscInbox } from 'react-icons/vsc';
import BackupIcon from '@mui/icons-material/Backup';
import Link from '@mui/material/Link';
// import { Base64 } from 'js-base64';
import { IncommingFiles } from './IncommingFiles';
import { IncommingTexts } from './IncommingTexts';
// import { ImSpinner9 } from 'react-icons/im';
import CBOR from 'cbor-js'
import Loader from './Loader';
import Logo from './img/logo.png'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import { InputLabel, LinearProgress } from '@mui/material';
import { Input } from '@mui/material';
import Paper from '@mui/material/Paper';
import { InputAdornment } from '@mui/material';
import { Box, Button, Chip, Stack, TextField } from '@mui/material';
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
const StyledContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '16px',
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{
        backgroundColor: '#eee',
        // border:'1px solid #ddd'
        overflowY: 'scroll',
        maxHeight: '25rem'

      }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
const StyledLink = styled(Link)({
  textDecoration: 'none', // Remove underline
  margin: '0 10px', // Add margin between the links
});
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default function Main() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = React.useState(0);
  const tabChange = (event, newValue) => {
    setValue(newValue);
  };
  let ishttps;
  let hostname;
  if (window.location.protocol === 'https:') {
    ishttps = 'wss:'
    hostname = window.location.hostname;
  } else if (window.location.protocol === 'http:') {
    ishttps = 'ws:';
    hostname = window.location.host;
  }

  // console.log(window.location, "location")

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
  const [fromid, setFromid] = useState(null);
  const [currentTab, setCurrentTab] = useState('')
  const [pingIntervalId, setPingIntervalId] = useState(null);



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

      if (localStorage.getItem('myID')) {
        let id =  +(JSON.parse(localStorage.getItem("myID"))) 
        setFetchId(({ id: id}));
        ws.send(
          CBOR.encode({
            type:"haveID",
            data:{id:id}
          })
        )
      } else {
        ws.send(
          CBOR.encode({
            type:"generateId",
          })
        )
      }



      // setInterval(() => {
      //  ws.send(pingmessage);
      //  }, 5000);


    }

    ws.onmessage = (e) => {

      let incommingData = CBOR.decode(e.data);


      if (incommingData.type === 'generateId') {
        setFetchId(({ id: +(incommingData.id) }));
        localStorage.setItem('myID', incommingData.id);
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
        // showfiledBox(2)
      } else if (incommingData.type === 'inputFileData') {
        let newRecievedData = { ...recievedDataRef, files: [...recievedDataRef.files, incommingData.data] };

        setRecievedData(newRecievedData);
        recievedDataRef = newRecievedData;
        // showfiledBox(2);
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
    const allLists = document.querySelectorAll('.list');
    window.document.title = "WeShare"
    // allLists[0].click();


  }, [])




  const handleSubmit = async (e) => {

    e.preventDefault()
    let fileSizeinByte = filestore.file_size;
    let fileSizeinKb = (fileSizeinByte / 1000);
    if (value === 0) {
      console.log(store)

      if (store.inputText !== '') {
        console.log('call')
        if (store.id !== '') {

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
          setStore({ ...store, inputText: '' });
        } else {
          e.preventDefault()
          alert('Please Enter Recipient ID!')
        }

      } else if (store.inputText === '') {
        console.log("not call")
        alert('Please Enter Text!')
      }
    }


    if (value === 1) {

      if (filestore !== '' && fileSizeinKb <= 30000) {
        if (store.id !== '') {

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
          alert('Please Enter Recipient ID')
        }
      } else {
        alert('Please Sellect File!')
      }

    }


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
    <Box sx={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }} >
      {/* Navbar */}
      <Grid container justifyContent='center' maxWidth={1000} spacing={5} display='flex'>

        <Grid item xs={12} className='navbar' justifyContent='space-between' display='flex' mt={5} >
          <Box className="logo" display='flex' justifyContent='space-between' alignItems='center' flexDirection='row' >
            <Box sx={{ fontSize: '5px' }}>
              <img src={Logo} alt="logo" width='20px' height='20px' />
            </Box>
            <Typography style={{ fontSize: isMobile ? '10px' : '40px' }} >WeShare</Typography>
          </Box>
          <Box
            className="aboutInfo"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            sx={{ '& > *': { mx: 2, textDecoration: 'none' } }} // Remove underline and add margin between the links
          >
            <StyledLink href="#">Home</StyledLink>
            <StyledLink href="https://github.com/mdebrahim98">About</StyledLink>
            <StyledLink href="">Feedback</StyledLink>
          </Box>

        </Grid>
        <Grid item xs={12} className='wrapper'>
          <Grid container>
            <Grid item xs={12} className="container">

              {
                isloading ? <><label htmlFor="">Comming...</label><LinearProgress color="secondary" /> </> : null


              }


              <Typography color='primary' fontSize={25}>MY ID <Box component='span' fontWeight={900} color='purple'>{fetchId.id}</Box></Typography>


              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={value} onChange={tabChange} aria-label="basic tabs example" centered>
                    <Tab label="Send Text" {...a11yProps(0)} />
                    <Tab label="Send File" {...a11yProps(1)} />
                    <Tab label="Recieved Data" {...a11yProps(2)} />
                  </Tabs>
                </Box>

                <CustomTabPanel value={value} index={0}>
                  <Box className="sendText filed ">

                    <TextField sx={{ border: 'none' }} rows={10} multiline value={store.inputText} placeholder="paste or write your text to send" name="inputText" id="" style={{ width: "100%", height: "240px" }} onChange={(e) => handleChange(e, 'inputText')}>

                    </TextField>
                    {/* <form action="">
											<textarea  >
											</textarea>
										</form> */}
                  </Box>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <Box >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', flexDirection: 'column' }} >
                        <Box sx={{ fontSize: '48px' }}>
                          <BackupIcon onClick={fileChoose} className="fileIcon" sx={{ cursor: 'pointer' }} />
                        </Box>
                        <Typography variant='text' >Click this to send the file</Typography>
                      </Box>
                    </Box>
                    <Typography style={{ fontSize: '18px', textAlign: 'center' }}>{filestore.file_name}</Typography>
                    <input type="file" multiple style={{ display: 'none' }} ref={inputref} onChange={arrayBufferToBase64} />
                  </Box>

                </CustomTabPanel>

                <CustomTabPanel value={value} index={2}>
                  <Box className=""  >

                    {
                      recievedData.text.length <= 0 && recievedData.files.length <= 0
                        ? <Typography sx={{ textAlign: 'center', justifyContent: 'center', display: 'flex', minHeight: '200px' }}>No Receieved Data</Typography>
                        :
                        <>
                          <label>Text</label>
                          <IncommingTexts recievedData={recievedData} />
                          <hr />
                          <label>File</label>

                          <IncommingFiles
                            downloadRef={downloadRef}
                            recievedData={recievedData}
                            bse64toFileUrl={bse64toFileUrl}
                          />

                        </>
                    }

                  </Box>
                </CustomTabPanel>
              </Box>


              <StyledContainer>
                <TextField
                  label=" Recipient ID"
                  variant="outlined"
                  value={store.id} placeholder=" Recipient Id" id="recipientid" className="recipientData" type="text" name="recipientData" onChange={(e) => handleChange(e, 'id')}
                  fullWidth
                />
                <Box >
                  <Button size='large' sx={{ width: '6rem', height: '3rem' }} variant='contained' onClick={handleSubmit}>
                    {issend ?
                      "send"
                      :
                      <>

                        <span>Sending..</span>

                      </>
                    }

                  </Button>

                </Box>

                <div>{null}</div>
              </StyledContainer>
              <Box display='flex' justifyContent='space-between' alignItems='center' flexDirection='row' >
                <Box component='form' action="">
                </Box>

              </Box>



            </Grid>
            <Grid item xs={12}>
              <footer>
                <p>Md Ebrahim © 2021</p>
              </footer>
            </Grid>
          </Grid>
        </Grid>



      </Grid>






    </Box>
  )
}





