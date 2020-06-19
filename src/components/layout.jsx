import React from "react"

import Header from "./header"

const Layout = ({ location, children }) => (
  <div>
    <Header location={location} />
    <main>{children}</main>
    <footer />
  </div>
)

export default Layout
