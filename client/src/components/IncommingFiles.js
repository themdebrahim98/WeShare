import React from 'react'
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
						file_Size={elm.file_size}
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

