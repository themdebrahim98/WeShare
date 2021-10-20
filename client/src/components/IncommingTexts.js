import React,{useRef} from 'react'

import {TextList} from './TextList'
import './incommingTexts.css'


export function IncommingTexts({ recievedData }) {

    


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
