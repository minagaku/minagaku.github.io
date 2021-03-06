import { Link } from "gatsby"
import React, { useContext } from "react"
import logo from "../images/logo.svg"
import GlobalContext from "../contexts/GlobalContext"
import Loading from "./loading"

const Header = ({ location }) => {
  const { loading, prefixes } = useContext(GlobalContext)
  return (
    <header className={location.pathname === "/" ? "high" : ""}>
      <Link className="link" to={`/${prefixes.value.students}`}>
        学
      </Link>
      {loading.value ? <Loading showText={false} /> : ""}

      <h1 style={{ margin: 0 }}>
        <Link to="/">
          <img id="logo" alt="Logo" src={logo} />
        </Link>
      </h1>
      <a className="link" href="https://w.atwiki.jp/ragadoon/pages/1276.html">
        <img src="https://w.atwiki.jp/favicon.ico" alt="@wiki" />
      </a>
      <a className="link" href="https://fujimi-trpg-online.jp/game/grancrest.html">
        <img src="https://fujimi-trpg-online.jp/themes/trpg-online/images/favicon.ico" alt="公式" />
      </a>
    </header>
  )
}

Header.defaultProps = {
  siteTitle: "",
}

export default Header
