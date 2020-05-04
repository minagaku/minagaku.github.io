import React from "react"
import twitter from "../../images/twitter.svg";

const ragaTable =
{
  "ラガドーン会員(今年度名簿登録予定者)": "Ragadoon\nmember",
  "元会員": "Ragadoon\nformer member",
  "新規入会希望": "Ragadoon\nnew member",
  "非会員": "Ragadoon\nnon-member",
}



const Fusen = ({student}) => <div class="fusen">
            <div class="pl">PL</div>
            <div class="player-name">{student.player}</div>
            <div class="membership">{ragaTable[student.raga]}</div>
            {student.twitter ? <a href={`https://twitter.com/${student.twitter}`}><img src={twitter} /></a> : ""}
          </div>

export default Fusen

