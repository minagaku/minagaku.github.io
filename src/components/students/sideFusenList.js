import React from "react"
import { Link } from "gatsby"

const SideFusenList = ({students,current,prefix}) => {
    return <div class="side-fusens">
    {
        students.map(st => 
            <div class={ "side-fusen " + (st.fullname === current ? "current" : "") }>
                <div className="fusen-chara-card">{ st.chara_card ? <img src={st.chara_card} /> : "" } </div>
                <Link to={`${prefix}/${st.fullname}`}>
                    {st.fullname}
                    {/* <span class="age">{st.age}歳</span> */}
                    {/* <span class="sex">{st.sex}</span> */}
                </Link>
            </div>
        )
    }
    </div>
}

export default SideFusenList
