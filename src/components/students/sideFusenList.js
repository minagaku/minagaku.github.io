import React, { useState } from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faSortAlphaDown } from '@fortawesome/free-solid-svg-icons'




const SideFusenList = ({ students, current, prefix }) => {
    const [sort,setSort] = useState("alpha")
    function onSortAlphaDown() {
        setSort("alpha")
    }
    function onHome() {
        setSort("family")
    }
    return <div class="side-fusens">
        <button onClick={onSortAlphaDown}><FontAwesomeIcon icon={faSortAlphaDown} /></button>
        <button onClick={onHome}>↓<FontAwesomeIcon icon={faHome} /></button>
        {
            students.sort((x, y) => (sort === "family" ? x.lastname : x.fullname).localeCompare(y.fullname, 'ja')).map(st =>
                <div class={"side-fusen " + (st.fullname === current ? "current" : "")}>
                    <div className="fusen-chara-card">{st.chara_card ? <img loading="lazy" src={st.chara_card} /> : ""} </div>
                    <Link to={`${prefix}/${st.fullname}`}>
                        <b>{st.firstname}</b>・{st.lastname}
                        {/* <span class="age">{st.age}歳</span> */}
                        {/* <span class="sex">{st.sex}</span> */}
                    </Link>
                </div>
            )
        }
    </div>
}

export default SideFusenList
