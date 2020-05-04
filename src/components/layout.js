import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import Header from "./header";

const Layout = ({ location, title, children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <footer>
      </footer>
    </div>
  )
}

export default Layout
