import { Link } from "gatsby"
import PropTypes from "prop-types"
import React, { useContext } from "react"
import logo from "../images/logo.svg"
import GlobalContext from "../contexts/GlobalContext"

const Header = ({ siteTitle }) => {
  const {prefixes} = useContext(GlobalContext);
  return <header>
    <Link className="link" to={`/${prefixes.value.students}`}>
      学
    </Link>

    <h1 style={{ margin: 0 }}>
      <Link to="/">
        <img id="logo" alt="Logo" src={logo} />
      </Link>
    </h1>
    <a className="link" href="https://w.atwiki.jp/ragadoon/pages/1276.html"><img src="https://w.atwiki.jp/favicon.ico" /></a>
    <a className="link" href="https://fujimi-trpg-online.jp/game/grancrest.html"><img src="https://fujimi-trpg-online.jp/themes/trpg-online/images/favicon.ico" /></a>
  </header>
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
