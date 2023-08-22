import React from "react";
import { FiDownload } from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";

export function FileList({
  file_name,
  file,
  file_Size,
  fromid,
  recievedData,
  bse64toFileUrl,
  downloadRef,
}) {
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
    <div className="file_wrapper">
      <div className="files">
        <div className="fileicon">
          <i>
            {" "}
            <AiOutlineFileText />
          </i>
        </div>

        <div className="file">
          <p> {`${file_name}`}</p>
          {/* <p className="size">	{` ${new Date().toLocaleString()}`}</p> */}
          <p className="size">{fromid}</p>
        </div>
      </div>

      <div className="file_right_side">
        <p className="size">{file_Size}</p>
        <a ref={downloadRef} download={file_name} href="#">
          <FiDownload
            className="download"
            onClick={() => {
              bse64toFileUrl(file);
            }}
          />
        </a>
      </div>
    </div>
  );
}
