import React from "react"

import Mahoujin from "../images/mahoujin.inline.svg"
import mj from "../images/mahoujin.svg"


const Loading = ({ showText }) => (
  <>
    {/* <Mahoujin />  */}
    <div class="loading">
      <img src={mj} />
      {showText ? <div>Loading...</div> : ""}
    </div>
  </>
)

export default Loading
