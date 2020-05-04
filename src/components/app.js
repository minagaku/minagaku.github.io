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
import StudentPage from "./students/student";

const App = ({ data, location }) =>
{
    const { prefixes } = useContext(GlobalContext);
    if (prefixes.value.students !== data.site.siteMetadata.prefixes.students) prefixes.set(data.prefixes);
    return <Layout>
        <Router>
            <StudentPage path={`${prefixes.value.students}/:name`} />
            <StudentIndex path={`${prefixes.value.students}/`} />
        </Router>
    </Layout>
}
export default App
