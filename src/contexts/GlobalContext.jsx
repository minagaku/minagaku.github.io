import React, { useState } from 'react';

const defaultState = {
  users: [],
  discord: {},
  loading: false,
  prefixes: {
    students: 'students',
  },
};

function tryGetStudents() {
  const u = typeof window !== 'undefined' && window.localStorage.getItem('users');
  if (!u) return [];
  try {
    return JSON.parse(u);
  } catch (_) {
    return [];
  }
}
function tryGetDiscord() {
  const u = typeof window !== 'undefined' && window.localStorage.getItem('discord');
  if (!u) return {}
  try {
    return JSON.parse(u);
  } catch (_) {
    return 
  }
}

const GlobalContext = React.createContext(defaultState);
const GlobalProvider = (props) => {
  const [students, setStudentsState] = useState(tryGetStudents());
  const [loading, setLoading] = useState(false);
  const [prefixes, setPrefixes] = useState(defaultState.prefixes);
  const [tweets, setTweets] = useState([]);
  const [discord, setDiscord2] = useState({});
  const { children } = props;
  const setStudents = (newUsers) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('users', JSON.stringify(newUsers));
    setStudentsState(newUsers);
  };
  const setDiscord = (newValue) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('discord', JSON.stringify(newValue));
    setDiscord2(newValue);
  }
  const store = {
    students: { value: students, set: setStudents },
    loading: { value: loading, set: setLoading },
    prefixes: { value: prefixes, set: setPrefixes },
    tweets: { value: tweets, set: setTweets },
    discord: { value: discord, set: setDiscord}
  };
  return (
    <GlobalContext.Provider value={store}>
      {children}
    </GlobalContext.Provider>
  );
};
export default GlobalContext;
export { GlobalProvider };
