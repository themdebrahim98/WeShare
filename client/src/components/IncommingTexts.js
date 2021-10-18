import React,{useRef} from 'react'
import { AiOutlineFileText } from 'react-icons/ai';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import {TextList} from './TextList'
import './incommingTexts.css'


export function IncommingTexts({ recievedData }) {
    const textFileRef = useRef();

    


    return (
        < >
            {
                recievedData.text ? recievedData.text.map((elm, index) =>

                    < TextList
                        text={elm.text}
                        fromid={elm.fromid}
                    />
                )

                    : null

            }
        </>


    )
}
