import React, { useRef } from 'react'
import { AiOutlineFileText } from 'react-icons/ai';
import { HiOutlineClipboardCopy } from 'react-icons/hi';

export function TextList({ text, fromid, text_size }) {

  const textRef = useRef()

  const fileCopy = () => {
    let copyText = textRef.current;
    console.log(copyText.innerHTML, textRef.current)
    navigator.clipboard.writeText(copyText.innerHTML);
    alert('text coppied')


  }


  return (
    <div className="text_wrapper" >
      <div className="texts" >
        <div className="fileicon">
          <i>	< AiOutlineFileText /></i>
        </div>
        <div className="textfile">
          <div className='textbreak'><p ref={textRef} >	{text}</p></div>
          <p className="size">{fromid}</p>

        </div>


      </div>
      <div className="texts_right_side">
        <p className="size">{text_size}B</p>
        <p><i><HiOutlineClipboardCopy onClick={fileCopy} className="filecopy" /></i></p>
      </div>



    </div>
  )
}
