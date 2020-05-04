import React, { useContext } from "react"
import GlobalContext from "../../contexts/GlobalContext";
import SEO from "../seo";
import { Link } from "@reach/router";
import "./students.sass";
import Fusen from "./fusen";

const StudentIndex = () => {
  const { students, prefixes } = useContext(GlobalContext);
  return <>
    <SEO title="Home" />
    <div class="students student-list">
      <div class="container">
        {/* {users.length === 0 ? <Loading /> : users.map(st => <article class="student-info student-info-index" style={{ backgroundImage: `url(${oldPaper})` }}> */}
        <div>
          {students.value.map(st => <article>
            <div class="student-box">
              <h2>
                <Link to={`/${prefixes.value.students}/${st.fullname}`}>
                  {st.fullname}
                  <span class="age">{st.age}歳　{st.sex}</span>
                </Link>
              </h2>
              <img class="chara-card" src={st.chara_card} />
              <div class="fusen-wrapper"><Fusen student={st} /></div></div>
          </article>)}
        </div>
      </div>
    </div>
  </>
}

export default StudentIndex
