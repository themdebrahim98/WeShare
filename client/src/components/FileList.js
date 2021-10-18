
import React from 'react'
import { FiFilePlus, FiDownload, FiCopy } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { HiOutlineClipboardCopy } from 'react-icons/hi';

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

{/* <div className="files" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div>
    <h1>{file_name}{ }</h1>
    <h1>{fromid}</h1>

  </div>
  <a ref={downloadRef} download={file_name} href="#"><FiDownload onClick={() => { bse64toFileUrl(file) }} style={{ fontSize: '25px' }} /></a>


</div> */}