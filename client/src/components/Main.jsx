import React, { useState, useEffect, useRef, Children } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import "./main.css";
import { VscInbox } from "react-icons/vsc";
import BackupIcon from "@mui/icons-material/Backup";
import Link from "@mui/material/Link";
import { Modal } from "@mui/material";
// import { Base64 } from 'js-base64';
import { IncommingFiles } from "./IncommingFiles";
import { IncommingTexts } from "./IncommingTexts";
// import { ImSpinner9 } from 'react-icons/im';
import CBOR from "cbor-js";
import Loader from "./Loader";
import Logo from "./img/logo.png";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import { InputLabel, LinearProgress } from "@mui/material";
import { Input } from "@mui/material";
import Paper from "@mui/material/Paper";
import { InputAdornment } from "@mui/material";
import { Box, Button, Chip, Stack, TextField } from "@mui/material";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
const StyledContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  padding: "16px",
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
        backgroundColor: "#b3e5fc",
        overflowY: index != 0 ? "scroll" : "none",
        height: "15rem",
        alignItems: "center",
        position: "relative",
        border: "1px solid #4fc3f7",
      }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  margin: "0 10px",
  fontSize: { xs: "5px", sm: "5px" },
}));
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export default function Main() {
  const [isConnectionLost, setisConnectionLost] = useState(false);
  const [iserror, setiserror] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = React.useState(0);
  const tabChange = (event, newValue) => {
    setValue(newValue);
  };
  let ishttps;
  let hostname;
  if (window.location.protocol === "https:") {
    ishttps = "wss:";
    hostname = window.location.hostname;
  } else if (window.location.protocol === "http:") {
    ishttps = "ws:";
    hostname = window.location.host;
  }

  // console.log(window.location, "location")

  const [fetchId, setFetchId] = useState({ id: "" });
  const [store, setStore] = useState({
    id: "",
    inputText: "",
  });

  const [filestore, setFiletore] = useState("");

  const [recievedData, setRecievedData] = useState({
    text: [],
    files: [],
  });
  let recievedDataRef = { ...recievedData };
  const inputref = useRef();
  const downloadRef = useRef();
  const wsRef = useRef();
  const [isloading, setisloading] = useState(false);
  const [iscomming, setiscomming] = useState(false);
  const [fromid, setFromid] = useState(null);
  const [currentTab, setCurrentTab] = useState("");
  const [pingIntervalId, setPingIntervalId] = useState(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const WebSocketConnection = () => {
    let url = `${ishttps}//${hostname}/websocket/`;
    let url2 = `ws://localhost:5000/websocket/`;

    let ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = (e) => {
      console.log("websocket server connected..");
      let pingmessage = CBOR.encode({
        type: "ping",
        message: "ping",
      });

      if (localStorage.getItem("myID")) {
        let id = +JSON.parse(localStorage.getItem("myID"));
        setFetchId({ id: id });
        ws.send(
          CBOR.encode({
            type: "haveID",
            data: { id: id },
          })
        );
      } else {
        ws.send(
          CBOR.encode({
            type: "generateId",
          })
        );
      }

      // setInterval(() => {
      //  ws.send(pingmessage);
      //  }, 5000);
    };

    ws.onmessage = (e) => {
      let incommingData = CBOR.decode(e.data);
      if (incommingData.type == "error") {
        setiserror(true);
        console.log(incommingData.message);
      } else if (incommingData.type == "disconnected") {
        alert(`Client  Disconnected`);
        console.log("clientDisconnected");
        setisloading(false);
      }
      if (incommingData.type === "generateId") {
        setFetchId({ id: +incommingData.id });
        localStorage.setItem("myID", incommingData.id);
      } else if (incommingData.type === "inputTextData") {
        console.log(incommingData, "test");
        let newRecievedData = {
          ...recievedDataRef,
          text: [...recievedDataRef.text, incommingData.data],
        };
        setRecievedData(newRecievedData);
        recievedDataRef = newRecievedData;
        setiscomming(false);
        // recieved status send to client
        ws.send(
          CBOR.encode({
            data: {
              toclientid: incommingData.data.fromid,
              status: true,
            },
            type: "isrecieved",
          })
        );
        // showfiledBox(2)
      } else if (incommingData.type === "inputFileData") {
        let newRecievedData = {
          ...recievedDataRef,
          files: [...recievedDataRef.files, incommingData.data],
        };

        setRecievedData(newRecievedData);
        recievedDataRef = newRecievedData;
        // showfiledBox(2);
        setiscomming(false);
        try {
          ws.send(
            CBOR.encode({
              data: {
                toclientid: incommingData.data.fromid,
                status: true,
              },
              type: "isrecieved",
              message: "Recieved succsessfully",
            })
          );
        } catch (error) {
          // ws.send(
          //   CBOR.encode({
          //     type: "error",
          //     message:'Not recieved by other client'
          //   })
          // );
        }
      } else if (incommingData.type === "isrecieved") {
        setisloading(false);
        alert("Sent successfully");
        console.log("Sent successfully");
      } else if (incommingData.type === "noclient") {
        alert("this id not avalable");
        setisloading(false);
      } else if (incommingData.type === "commingStatus") {
        setiscomming(true);
        setFromid(incommingData.fromid);
        console.log(incommingData, "data");
        // ws.send(
        //   CBOR.encode({
        //     type: "disconnected",
        //     senderId: +fetchId.id,
        //     recieverId: incommingData.fromid,
        //   })
        // );
        window.addEventListener("beforeunload", () => {
          ws.send(
            CBOR.encode({
              type: "disconnected",
              senderId: +fetchId,
              recieverId: incommingData.fromid,
            })
          );
          ws.close(); // Close the socket after sending the disconnect message
        });
      }
    };

    ws.onclose = (e) => {
      console.log("websocket server disconnected");
      setisConnectionLost(true);
      setOpen(true);
    };
    ws.onerror = (e) => {
      console.log("websocket error", e);
    };
  };

  useEffect(() => {
    WebSocketConnection();
    const allLists = document.querySelectorAll(".list");
    window.document.title = "WeShare";
    // allLists[0].click();
  }, []);

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    let fileSizeinByte = filestore.file_size;
    let fileSizeinKb = fileSizeinByte / 1000;
    if (value === 0) {
      console.log(store);

      if (store.inputText !== "" && value == 0) {
        console.log("call");
        if (store.id !== "") {
          setisloading(true);
          let blob = new Blob([store.inputText]);

          let loadingStatusSend = CBOR.encode({
            data: {
              id: store.id,
              fromid: fetchId.id,
            },
            type: "commingStatus",
            status: true,
          });
          let storeData = CBOR.encode({
            data: {
              ...store,
              fromid: fetchId.id,
              text_size: blob.size,
            },
            type: "inputTextData",
          });
          try {
            await wsRef.current.send(loadingStatusSend);
            try {
              await wsRef.current.send(storeData);
            } catch (error) {
              alert("while sending input text status(error)");
              setisloading(false);
              console.log("while sending input text status(error)");
            }
          } catch (error) {
            alert("while sending loading status(error)");
            setisloading(false);
            console.log("while sending loading status(error)");
          }
          setStore({ ...store, inputText: "" });
        } else {
          e.preventDefault();
          alert("Please Enter Recipient ID!");
        }
      } else if (store.inputText === "") {
        console.log("not call");
        alert("Please Enter Text!");
      }
    }

    if (value === 1) {
      if (filestore !== "") {
       
        if (store.id !== "") {
          setisloading(true);
          let loadingStatusSend = CBOR.encode({
            data: {
              id: filestore.id,
              fromid: filestore.fromid,
            },
            type: "commingStatus",
            status: true,
          });

          let inputFileData = CBOR.encode({
            data: filestore,
            type: "inputFileData",
          });

          try {
            await wsRef.current.send(loadingStatusSend);
            try {
              await wsRef.current.send(inputFileData);
            } catch (error) {
              alert("while sending input file status(error)");
              setisloading(false);
              console.log("while sending input file status(error)");
            }
          } catch (error) {
            alert("while sending loading status(error)");
            setisloading(false);
            console.log("while sending loading status(error)");
          }
          setFiletore("");
          inputref.current.value = "";
        } else {
          alert("Please Enter Recipient ID");
        }
      } else {
        alert("Please Sellect File!");
      }
    }
  };

  const handleChange = (e, name) => {
    let val = e.target.value;
    setStore({
      ...store,
      [name]: val,
    });
  };

  const fileChoose = () => {
    inputref.current.click();
  };

  useEffect(() => {
    if (filestore) {
      setFiletore({ ...filestore, id: store.id });
    }
  }, [store.id]);

  const arrayBufferToBase64 = async () => {
    let selected_file = inputref.current.files[0];
    const arraybuffertoInt8 = new Uint8Array(await selected_file.arrayBuffer());
    let id = Number(store.id);
    let fromid = Number(fetchId.id);
    setFiletore({
      id: id,
      fromid: fromid,
      file_name: selected_file.name,
      file_size: selected_file.size,
      file: arraybuffertoInt8,
    });
  };

  const bse64toFileUrl = (base64String) => {
    alert("download start..");
    let blob = new Blob([base64String]);

    downloadRef.current.href = URL.createObjectURL(blob);
    downloadRef.current.onload = function () {
      URL.revokeObjectURL(downloadRef.current.href);
    };
  };

  let reconnect = () => {
    WebSocketConnection();
    setOpen(false);
    alert("Connection Restored");
  };
  return (
    <Box
      sx={{
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        mx: "2rem",
      }}
    >
      {/* Navbar */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ top: { xs: "-25%" }, maxWidth: "400px", m: "0 auto" }}
      >
        <Box sx={style} color="inherit">
          <Typography mb={2} id="modal-modal-title" variant="h6" component="h2">
            Connection Lost, Please Reconnect!
          </Typography>

          <Button variant="contained" onClick={reconnect}>
            Reconnect
          </Button>
        </Box>
      </Modal>
      <Grid
        container
        justifyContent="center"
        maxWidth={700}
        spacing={5}
        display="flex"
      >
        <Grid
          item
          xs={12}
          className="navbar"
          justifyContent="space-between"
          display="flex"
          mt={5}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection="row"
          >
            <Box sx={{ fontSize: { xs: "6px", sm: "16px" } }}>
              <img src={Logo} alt="logo" width="30px" height="30px" />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "12px", sm: "16px" },
                ml: 1,
                fontWeight: "800",
              }}
            >
              WeShare
            </Typography>
          </Box>
          <Box
            className="aboutInfo"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            sx={{
              "& .stylelink": {
                mx: 2,
                textDecoration: "none",
                fontSize: { xs: "12px", sm: "16px" },
                color: "inherit",
              },
            }} // Remove underline and add margin between the links
          >
            <StyledLink className="stylelink" href="#">
              Home
            </StyledLink>
            <StyledLink
              className="stylelink"
              href="https://github.com/mdebrahim98"
            >
              About
            </StyledLink>
            <StyledLink className="stylelink" href="">
              Feedback
            </StyledLink>
          </Box>
        </Grid>
        <Grid item xs={12} className="wrapper">
          <Grid container>
            <Grid
              item
              xs={12}
              className="container"
              sx={{
                "& > *": {
                  fontSize: { xs: "12px", sm: "16px" },
                },
              }}
            >
              {iscomming ? (
                <>
                  <label htmlFor="">Comming...</label>
                  <LinearProgress color="secondary" />{" "}
                </>
              ) : null}

              <Typography
                color="primary"
                fontSize={25}
                display="inline-block"
                p={2}
                fontWeight={800}
              >
                MY ID{" "}
                <Box component="span" fontWeight={900} color="purple">
                  {fetchId.id}
                </Box>
              </Typography>

              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={tabChange}
                    aria-label="basic tabs example"
                    centered
                    sx={{
                      "& .tab": {
                        fontSize: { xs: "12px", sm: "16px" },
                      },
                    }}
                  >
                    <Tab className="tab" label="Send Text" {...a11yProps(0)} />
                    <Tab className="tab" label="Send File" {...a11yProps(1)} />
                    <Tab
                      className="tab"
                      label="Recieved Data"
                      {...a11yProps(2)}
                    />
                  </Tabs>
                </Box>

                <CustomTabPanel value={value} index={0}>
                  <Box className="sendText filed ">
                    <TextField
                      sx={{ border: "none", outline: "none", p: "0" }}
                      rows={7}
                      multiline
                      value={store.inputText}
                      placeholder="Paste or write your text to send..."
                      name="inputText"
                      id=""
                      style={{ width: "100%", height: "240px" }}
                      onChange={(e) => handleChange(e, "inputText")}
                    ></TextField>
                    {/* <form action="">
											<textarea  >
											</textarea>
										</form> */}
                  </Box>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Box sx={{ fontSize: "48px" }}>
                          <BackupIcon
                            onClick={fileChoose}
                            className="fileIcon"
                            sx={{ cursor: "pointer", fontSize: "5rem" }}
                          />
                        </Box>
                        <Typography variant="text">
                          Click this to send the file
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      style={{ fontSize: "18px", textAlign: "center" }}
                    >
                      {filestore.file_name}
                    </Typography>
                    <input
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      ref={inputref}
                      onChange={arrayBufferToBase64}
                    />
                  </Box>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={2}>
                  <Box>
                    {recievedData.text.length <= 0 &&
                    recievedData.files.length <= 0 ? (
                      <Box sx={{ textAlign: "center", mt: "3rem" }}>
                        <Typography
                          fontWeight="700"
                          textTransform="capitalize"
                          p={2}
                        >
                          No receieved Data
                        </Typography>
                      </Box>
                    ) : (
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
                    )}
                  </Box>
                </CustomTabPanel>
              </Box>

              <StyledContainer>
                <TextField
                  label=" Recipient ID"
                  variant="outlined"
                  value={store.id}
                  placeholder=" Recipient Id"
                  id="recipientid"
                  className="recipientData"
                  type="text"
                  name="recipientData"
                  onChange={(e) => handleChange(e, "id")}
                  fullWidth
                />
                <Box>
                  <Button
                    size="large"
                    sx={{ width: "6rem", height: "3rem" }}
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isloading}
                  >
                    {isloading && !iserror  ? "Sending..." : "Send"}
                  </Button>
                </Box>

                <div>{null}</div>
              </StyledContainer>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexDirection="row"
              >
                <Box component="form" action=""></Box>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center", mt: "4rem" }}>
              <footer>
                <p color="inherit">Md Ebrahim © {new Date().getFullYear()}</p>
              </footer>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
