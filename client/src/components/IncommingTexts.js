import React, { useRef } from "react";

import { TextList } from "./TextList";
import "./incommingTexts.css";

export function IncommingTexts({ recievedData }) {

  return (
    <>
      {recievedData.text
        ? recievedData.text.map((elm, index) => (
            <TextList
            key={index}
              text_size={elm.text_size}
              text={elm.text}
              fromid={elm.clientAid}
            />
          ))
        : null}
    </>
  );
}
