import React from "react"
import { graphql } from "gatsby"

import { GlobalProvider } from "../contexts/GlobalContext"
import App from "../components/app"

const Index = ({ data, location }) => (
  <GlobalProvider>
    <App data={data} location={location} />
  </GlobalProvider>
)
export default Index

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        prefixes {
          students
        }
      }
    }
  }
`
