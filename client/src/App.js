
import Main from './components/Main'
import React, { useState } from 'react'
import './App.css'

function App() {

  const [pageLoading, setPageLoading] = useState(true);
  setTimeout(() => {
    setPageLoading(false);


  }, 2000);

  return (
    <div className="App">
      {
        pageLoading 
        ? 
        <>
        <div className="wrapper">
          <div className="pageLoader">
            
          </div>

        </div>
        </>
         : <Main />

      }

    </div>
  );
}

export default App;
