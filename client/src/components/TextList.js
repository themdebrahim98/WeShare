import { Box, Chip, Divider, Grid, IconButton, Stack, Typography } from "@mui/material";
import React, { useRef } from "react";
import { AiOutlineFileText } from "react-icons/ai";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
export function TextList({ text, fromid, text_size }) {
  const textRef = useRef();
  const fileCopy = () => {
    let copyText = textRef.current;
    console.log(copyText.innerHTML, textRef.current);
    navigator.clipboard.writeText(copyText.innerHTML);
    alert("text coppied");
  };

  return (
    
      <Grid container spacing={2}>
        <Grid item xs={10} >
        <Grid container alignItems='center' justifyContent="start">
            <IconButton>
              {" "}
              <TextSnippetIcon  />
            </IconButton>
            <Grid>
            <Typography ref={textRef}>{text}</Typography>
            <Chip color="secondary" label={`from ${fromid} `}/>
              
            </Grid>

          </Grid>
        </Grid>
        <Grid item xs={2} >
          <Grid container alignItems='center' justifyContent="space-between">
            <Typography>{text_size}B</Typography>
            <Divider orientation="vertical" variant="large" flexItem />
            <IconButton>
              {" "}
              <ContentCopyIcon onClick={fileCopy} />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    
    // <div className="text_wrapper">
    //   <div className="texts">
    //     <div className="fileicon">
    //       <i>
    //         {" "}
    //         <AiOutlineFileText />
    //       </i>
    //     </div>
    //     <div className="textfile">
    //       <div className="textbreak">
    //         <p ref={textRef}> {text}</p>
    //       </div>
    //       <p className="size">{fromid}</p>
    //     </div>
    //   </div>
    //   <div className="texts_right_side">
    //     <p className="size">{text_size}B</p>
    //     <p>
    //       <i>
    //         <HiOutlineClipboardCopy onClick={fileCopy} className="filecopy" />
    //       </i>
    //     </p>
    //   </div>
    // </div>
  );
}
