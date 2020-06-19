import React from "react"

import mj from "../images/mahoujin.svg"

const Loading = ({ showText }) => (
  <>
    {/* <Mahoujin />  */}
    <div className="loading">
      <img src={mj} alt="" />
      {showText ? <div>Loading...</div> : ""}
    </div>
  </>
)

export default Loading
