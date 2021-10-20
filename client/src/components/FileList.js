
import React from 'react'
import {  FiDownload } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';

export function FileList({ file_name, file, fromid, recievedData, bse64toFileUrl, downloadRef }) {
  return (


    <div className="file_wrapper">

      <div className="files">
        <div className="fileicon">
          <i>	< AiOutlineFileText /></i>
        </div>

        <div className="file">
          <p >	{file_name}</p>
          <p className="size">{fromid}</p>
        </div>

      </div>


      <div className="file_right_side">

        <a ref={downloadRef} download={file_name} href="#"><FiDownload onClick={() => { bse64toFileUrl(file) }} style={{ fontSize: '25px',color:'rgb(24, 144, 255)' }} /></a>


      </div>


    </div >


  )
}

