import React, { useContext } from 'react';
import { Link } from '@reach/router';
import GlobalContext from '../../contexts/GlobalContext';
import SEO from '../seo';
import './students.sass';
import Fusen from './fusen';

const StudentIndex = () => {
  const { students, prefixes } = useContext(GlobalContext);
  return (
    <>
      <SEO title="Home" />
      <div className="students student-list">
        <div className="container">
          <div>
            {students.value.map((st) => (
              <article>
                <div className="student-box">
                  <h2>
                    <Link to={`/${prefixes.value.students}/${st.fullname}`}>
                      {st.fullname}
                      <span className="age">
                        {st.age}
                        歳
                        {st.sex}
                      </span>
                    </Link>
                  </h2>
                  {st.chara_card && <img className="chara-card" alt="立ち絵" src={st.chara_card} />  }
                  <div className="fusen-wrapper"><Fusen student={st} /></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentIndex;
