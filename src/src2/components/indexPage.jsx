import React, { useContext, useEffect } from 'react';
import { Link } from '@reach/router';
import GlobalContext from '../contexts/GlobalContext';
import SEO from './seo';
import './index.sass';

function findStudent(stp, list, t) {
  const twitterHeader = (
    <>
      <a href={`https://twitter.com/${t.TweetedBy}`} className="a1">
        <img src={t.UserDetails.ProfileImageUrl} className="twitter-profile" alt={t.TweetedBy} />
      </a>
      <a href={`https://twitter.com/${t.TweetedBy}`} className="a2">
        {t.UserDetails.FullName}
        {' '}
        (
        {t.TweetedBy}
        )
      </a>
    </>
  );
  if (t.TweetedBy === 'darkmist_k') {
    return (
      <>
        {twitterHeader}
        <div className="a3">GM&nbsp;</div>
      </>
    );
  }
  const student = list.find((x) => x.twitter.trim() === t.TweetedBy);
  if (!student) return twitterHeader;
  return (
    <>
      {twitterHeader}
      <Link to={`/${stp}/${student.fullname}`} className="a3">
        {student.fullname}
      </Link>
      <Link to={`/${stp}/${student.fullname}`} className="a4">
        <img src={student.chara_card} loading="lazy" className="chara-card" alt="" />
      </Link>
    </>
  );
}

const IndexPage = () => {
  const { students, prefixes, tweets } = useContext(GlobalContext);
  useEffect(() => {
    fetch('https://minagaku.z31.web.core.windows.net/twitter.json')
      .then((r) => r.json())
      .then((rd) => {
        tweets.set(rd);
      });
  }, []);
  return (
    <>
      <SEO title="Home" />
      <div className="home">
        <div className="kuguri-area">
          <div className="kuguri-img" />
          <div className="text">
            <Link to={`/${prefixes.value.students}/クグリ・ストラトス`} className="name">[クグリ・ストラトス]</Link>
            やぁ、喫茶マッターホルンへようこそ！今日はいい食材が入っているぞ。
            <br />
            <br />
            <a href="https://w.atwiki.jp/ragadoon/pages/1276.html">今週の活動方針</a>はもう投稿したかな？
            余裕をもって回答しよう（自戒）！
          </div>
        </div>
        <div>
          <div className="paper-back student-list-link">
            <Link to={`/${prefixes.value.students}`} >学生一覧</Link>
          </div>
        </div>
        <div className="minagaku-tl">
          <div className="tl-title">
            <a href="https://twitter.com/search?q=%23%E3%81%BF%E3%81%AA%E3%81%8C%E3%81%8F&src=typed_query">#みながく</a>
            Timeline 毎時更新
          </div>
          {
            tweets.value.map((t) => (
              <div className="tweet" key={t.TweetId}>
                <div className="tweet-header">
                  {findStudent(prefixes.value.students, students.value, t)}
                </div>
                <div className="tweet-body">
                  <div dangerouslySetInnerHTML={{ __html: t.TweetText.replace('\n', '<br>').replace(/(https:\/\/t\.co\/\w+)/, "<a href='$1'>$1</a>") }} />
                  {t.MediaUrls.map((x) => <a href={x}><img alt="media" src={x} /></a>)}
                </div>
                <a className="time" href={`https://twitter.com/${t.TweetedBy}/status/${t.TweetId}`}><time>{t.CreatedAtIso}</time></a>
              </div>
            ))
          }
        </div>
        <div>
          <b>License</b>
          Icon: https://www.flaticon.com/free-icon/magic-wand_2919743?term=magic%20wand&page=1&position=2
        </div>
      </div>

    </>
  );
};

export default IndexPage;
