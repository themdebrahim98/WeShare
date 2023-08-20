import React,{useRef} from 'react'

import {TextList} from './TextList'
import './incommingTexts.css'


export function IncommingTexts({ recievedData }) {
console.log(recievedData, "income")
    


    return (
        < >
            {
                recievedData.text ? recievedData.text.map((elm, index) =>

                    < TextList
                        text_size ={elm.text_size}
                        text={elm.text}
                        fromid={elm.fromid}
                    />
                )

                    : null

            }
        </>


    )
}
