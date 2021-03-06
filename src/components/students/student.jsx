import React, { useContext } from "react"
import { Link } from "@reach/router"
import GlobalContext from "../../contexts/GlobalContext"
import SEO from "../seo"
import "./students.sass"
import Fusen from "./fusen"
import Loading from "../loading"
import SideFusenList from "./sideFusenList"
import Wand from "../../images/magic.svg"

function renderFigcaption(cap) {
  if (!cap || cap === "") return ""
  const m = cap.match(/https?:\/\/[\w!?+-_~=;.,*&@#$%()'[]]+/)
  const c = cap.replace(/https?:\/\/[\w!?+-_~=;.,*&@#$%()'[]]+/, "")

  if (m) {
    return (
      <>
        <a href={m[0]}>出典</a> {c}
      </>
    )
  }
  return `出典:${c}`
}
const StudentPage = ({ name }) => {
  const { students, prefixes } = useContext(GlobalContext)
  if (students.value.length === 0) {
    return (
      <article className="student-detail">
        <div className="student-info2">
          <Loading />
        </div>
      </article>
    )
  }
  const st = students.value.find(x => x.fullname === name)
  if (!st) {
    return (
      <div>
        学生
        {name} が見つかりません
      </div>
    )
  }
  return (
    <>
      <SEO title={name} />
      <div className="students student-detail">
        <SideFusenList students={students.value} current={name} prefix={prefixes.value.students} />
        <article className="student-info">
          <div className="student-info2">
            <h2 style={st.fullname.length >= 15 ? { marginTop: "1em" } : undefined}>
              <Link to={`/${prefixes.value.students}/${st.fullname}`}>{st.fullname}</Link>
              <span className="age">
                {st.age}歳 {st.sex}
              </span>
            </h2>
            <div className="fusen-wrapper">
              <Fusen student={st} />
            </div>
            <div className={st.chara_card ? "mini-grid" : "mini-table"}>
              {st.chara_card ? (
                <figure className="chara-card">
                  <img alt="立ち絵" src={st.chara_card} />
                  <figcaption>{renderFigcaption(st.chara_card_by)} </figcaption>
                </figure>
              ) : (
                ""
              )}
              <table className="a2">
                <tr>
                  <th>出自</th>
                  <td>{st.from}</td>
                </tr>
                <tr>
                  <th>経験1</th>
                  <td>{st.exp1}</td>
                </tr>
                <tr>
                  <th>経験2</th>
                  <td>{st.exp2}</td>
                </tr>
              </table>
              <table className="a3">
                <tr>
                  <th>信念/禁忌</th>
                  <td>{st.taboo}</td>
                </tr>
                <tr>
                  <th>信念/目的</th>
                  <td>{st.purpose}</td>
                </tr>
                <tr>
                  <th>信念/趣味嗜好</th>
                  <td>{st.hobby}</td>
                </tr>
              </table>
            </div>
            <h3>外見的特徴</h3>
            <div className="box">{st.app}</div>
            <h3>詳細設定</h3>
            <div className="box">{st.life}</div>
            <h3>一人称</h3>
            <div className="box">{st.first_person}</div>
            <h3>二人称</h3>
            <div className="box">{st.second_person}</div>
            <h3>敬称</h3>
            <div className="box">{st.honorific}</div>
            <h3>口調</h3>
            <div className="box">{st.expression}</div>
            <h3>台詞例</h3>
            <div className="box">{st.expression_sample}</div>
            <h3>能力値/魔法</h3>
            <div className="box">
              <table>
                <tr>
                  <th>筋力</th>
                  <th>反射</th>
                  <th>感覚</th>
                  <th>知力</th>
                  <th>精神</th>
                  <th>共感</th>
                </tr>
                <tr>
                  <td>{st.status_str}</td>
                  <td>{st.status_agi}</td>
                  <td>{st.status_feel}</td>
                  <td>{st.status_int}</td>
                  <td>{st.status_mnd}</td>
                  <td>{st.status_emp}</td>
                </tr>
              </table>
              <div class="magic">
                {st.magic1 && (
                  <>
                    <img src={Wand} />
                    {st.magic1}
                  </>
                )}
                {st.magic2 && (
                  <>
                    <img src={Wand} />
                    {st.magic2}
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  )
}

export default StudentPage
