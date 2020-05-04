import React from "react"

import Mahoujin from "../images/mahoujin.inline.svg"
import mj from "../images/mahoujin.svg"


const Loading = () => (
  <>
    <Mahoujin />
    <div class="loading">
      {/* <div class="load-mahou" /> */}
      <img src={mj} />
      <div>Loading...</div>
    </div>
  </>
)

export default Loading
