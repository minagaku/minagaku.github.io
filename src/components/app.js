import React, { useContext, useEffect } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import GlobalContext from "../contexts/GlobalContext";
import StudentsIndex from "../components/students";
import { Router } from "@reach/router";
import "./global.sass"
import StudentPage from "./students/student";
import IndexPage from "./indexPage";

const App = ({ data, location }) =>
{
    const { loading, students, prefixes } = useContext(GlobalContext);
    if (prefixes.value.students !== data.site.siteMetadata.prefixes.students) prefixes.set(data.prefixes);
    useEffect(() => {
        loading.set(true)
        fetch(`https://script.google.com/macros/s/AKfycby2ZIx5H7J96SFGuLzLoU0ePgqgcq6ILYFowa6rQ70nmhVLR7MU/exec`)
            .then(r => r.json())
            .then(rd => {
                students.set(rd.sort((x, y) => x.fullname.localeCompare(y.fullname, 'ja')));
                loading.set(false)
            })
    }, []);

    return <Layout location={location}>
        <Router>
            <StudentPage path={`${prefixes.value.students}/:name`} />
            <StudentsIndex path={`${prefixes.value.students}/`} />
            <IndexPage path="/" />
        </Router>
    </Layout>
}
export default App
