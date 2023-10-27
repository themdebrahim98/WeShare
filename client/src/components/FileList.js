import React, { useRef } from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { FiDownload } from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";
import "./fileList.css";
export function FileList({ file_name, file, file_Size, fromid }) {
  const downloadRef = useRef();

  const bse64toFileUrl = (base64String) => {
    alert("download start..");
    let blob = new Blob([base64String]);
    downloadRef.current.href = URL.createObjectURL(blob);
    downloadRef.current.onload = function () {
      URL.revokeObjectURL(downloadRef.current.href);
    };
  };
  const bytes_to_kb = () => {
    // let file_Size_in_bytes = file_Size;
    if (file_Size < 1000) {
      file_Size = `${file_Size}b`;
    } else if (file_Size < 1000000 && file_Size >= 1000) {
      file_Size = `${Math.round((file_Size / 1000) * 100) / 100} kb `;
    } else {
      file_Size = `${Math.round((file_Size / 1000000) * 100) / 100} mb `;
    }
  };
  bytes_to_kb();
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Grid container alignItems="center" justifyContent="start">
          <IconButton>
            {" "}
            <AiOutlineFileText />
          </IconButton>
          <Grid>
          <Typography>{file_name}</Typography>
            <Chip label={`from ${fromid}`} color="secondary"/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography>{file_Size}B</Typography>
          <Divider orientation="vertical" variant="large" flexItem />
          <IconButton onClick={() => {
                  bse64toFileUrl(file);
                }}>
            <Link ref={downloadRef} download={file_name} href="#">
              <FiDownload
                className="download"
                
              />
            </Link>
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
    // <div className="file_wrapper" >
    //   <div className="files">
    //     <div className="fileicon">
    //       <i>
    //         {" "}
    //         <AiOutlineFileText />
    //       </i>
    //     </div>

    //     <div className="file">
    //       <p > {`${file_name}`}</p>
    //       {/* <p className="size">	{` ${new Date().toLocaleString()}`}</p> */}
    //       <p className="size">{fromid}</p>
    //     </div>
    //   </div>

    //   <div className="file_right_side">
    //     <p className="size">{file_Size}</p>
    //     <a ref={downloadRef} download={file_name} href="#">
    //       <FiDownload
    //         className="download"
    //         onClick={() => {
    //           bse64toFileUrl(file);
    //         }}
    //       />
    //     </a>
    //   </div>
    // </div>
  );
}
