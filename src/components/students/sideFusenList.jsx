import React, { useState } from 'react';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSortAlphaDown } from '@fortawesome/free-solid-svg-icons';


const SideFusenList = ({ students, current, prefix }) => {
  const [sort, setSort] = useState('alpha');
  function onSortAlphaDown() {
    setSort('alpha');
  }
  function onHome() {
    setSort('family');
  }
  return (
    <div className="side-fusens">
      <button type="button" aria-label="sort alpha down" onClick={onSortAlphaDown}><FontAwesomeIcon icon={faSortAlphaDown} /></button>
      <button type="button" onClick={onHome}>
        ↓
        <FontAwesomeIcon icon={faHome} />
      </button>
      {
            students.sort((x, y) => (sort === 'family' ? x.lastname + x.firstname : x.fullname).localeCompare((sort === 'family' ? y.lastname + y.firstname : y.fullname), 'ja')).map((st) => (
              <div className={`side-fusen ${st.fullname === current ? 'current' : ''}`}>
                <div className="fusen-chara-card">
                  {st.chara_card ? <img alt="立ち絵" loading="lazy" src={st.chara_card} /> : ''}
                  {' '}
                </div>
                <Link to={`${prefix}/${st.fullname}`}>
                  <b>{st.firstname}</b>
                  ・
                  {st.lastname}
                  {/* <span class="age">{st.age}歳</span> */}
                  {/* <span class="sex">{st.sex}</span> */}
                </Link>
              </div>
            ))
        }
    </div>
  );
};

export default SideFusenList;
