import React, { useRef } from 'react'
import { FiFilePlus, FiDownload, FiCopy } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { FileList } from './FileList'
import './incommingFiles.css'





export function IncommingFiles({ recievedData, bse64toFileUrl, downloadRef }) {
	return (
		<div>


			{
				recievedData.files ?
					recievedData.files.map((elm, index) =>
						<FileList
						file={elm.file}
						file_name={elm.file_name}
						fromid={elm.fromid}
						recievedData={recievedData}
						bse64toFileUrl={bse64toFileUrl}
						downloadRef={downloadRef}

						
						/>,
					)
					: null
			}

		</div>
	)
}

