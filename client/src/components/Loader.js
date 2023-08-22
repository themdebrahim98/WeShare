import React from "react";
import "./Loader.css";

export default function Loader({ fromid }) {
  return (
    <div className="loader_wraper">
      <div className="loader">
        <div class="loading_spin"></div>
        <span>Loading...</span>
      </div>
      <p>from {fromid}</p>
    </div>
  );
}
