import React, { useContext } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import GlobalContext from "../contexts/GlobalContext";
import StudentIndex from "../components/students";
import { Router } from "@reach/router";
import "./global.sass"

const App = ({ data, location }) =>
{
    const { prefixes } = useContext(GlobalContext);
    if (prefixes.value.students !== data.site.siteMetadata.prefixes.students) prefixes.set(data.prefixes);
    return <Layout>
        <Router>
            <StudentIndex path={`${prefixes.value.students}/`} />
            <StudentIndex path={`${prefixes.value.students}/:name`} />
        </Router>
    </Layout>
}
export default App
