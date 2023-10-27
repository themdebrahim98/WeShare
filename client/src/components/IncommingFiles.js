import React from "react";
import { FileList } from "./FileList";
import "./incommingFiles.css";

export function IncommingFiles({ recievedData }) {
  return (
    <div>
      {recievedData.files
        ? recievedData.files.map((elm, index) => (
            <FileList
            key={index}
              file={elm.file}
              file_name={elm.file_name}
              file_Size={elm.file_size}
              fromid={elm.clientAid}
              recievedData={recievedData}
            
            />
          ))
        : null}
    </div>
  );
}
