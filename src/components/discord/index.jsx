import React, { useContext, useState, useCallback, useMemo } from "react"
import GlobalContext from "../../contexts/GlobalContext"
import { useEffect } from "react"
import "./discord.sass"
import "./global.less"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faArrowCircleUp, faLongArrowAltUp } from "@fortawesome/free-solid-svg-icons"
import { List, Input, Modal, Button, Select, Tag, Layout, Space, Checkbox, Radio, Menu, Popover, Anchor, Tabs } from "antd"
import SubMenu from "antd/lib/menu/SubMenu"
import { Link, useParams, useLocation, navigate } from "@reach/router"
import SEO from "../seo"
const moment = require("moment")
const { Sider, Content } = Layout

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1]
  }
}

async function generateHash(str) {
  // generate hash!
  const hex = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str))
  return hexString(hex) // convert to hex string.

  /** array buffer to hex string */
  function hexString(buffer) {
    const byteArray = new Uint8Array(buffer)
    const hexCodes = [...byteArray].map(value => {
      const hexCode = value.toString(16)
      const paddedHexCode = hexCode.padStart(2, "0")
      return paddedHexCode
    })
    return hexCodes.join("")
  }
}
function renderChannelMenu(channels) {
  const channelMap = new Map()
  for (const i of channels) {
    const c = channelMap.get(i.meta.category)
    if (c) c.push(i)
    else channelMap.set(i.meta.category, [i])
  }
  const res = Array.from(channelMap.entries())
    .reverse()
    .map(([cat, chan]) => (
      <SubMenu key={cat} title={cat}>
        {chan.map(x => (
          <Menu.Item icon={<b style={{ color: "#666" }}># </b>} key={x.index}>
            {x.meta.name}
          </Menu.Item>
        ))}
      </SubMenu>
    ))
  return res
}
const goTopButton = <Button onClick={() => window.scrollTo(0, 0)} type="link" icon={<FontAwesomeIcon icon={faLongArrowAltUp} />} />
let tick = false;

const DiscordIndex = () => {
  const { discord, students, prefixes } = useContext(GlobalContext)
  const [activeAnchor,setActiveAnchor] = useState(null);

  useEffect(() => {
    function handleScroll() {
      const obj = document.querySelectorAll(".id-hash");
      for (let i = 1; i < obj.length ; i++) {
        if (obj[i].offsetTop > window.scrollY + 10) {
          setActiveAnchor(obj[i-1].id)
          return
        }
      }
      setActiveAnchor(null)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    };
  }, []);
  function getStudentByName(name) {
    return students.value.find(x => x.fullname === name)
  }
  function renderTag(student, isFullname, iconic, at, onClose) {
    if (!student) return <b key="?">?</b>
    return (
      <Popover
        key={student.fullname}
        content={
          <>
            <img width="100" src={student.chara_card} />
            <br />
            PL: {student.player}
            {/* <a href="#">このキャラの会話を絞り込み</a> */}
          </>
        }
        title={<Link to={`/${prefixes.value.students}/${student.fullname}`}>{student.fullname}</Link>}
        trigger="click"
      >
        {iconic ? (
          <Button className={at ? "at-student" : ""} type={student.chara_card ? "text" : "dashed"} icon={<img src={student.chara_card} />}>
            {student.chara_card ? null : isFullname ? student.fullname : student.firstname}
          </Button>
        ) : (
          <Tag className="discord-select-tag" icon={<img src={student.chara_card} />} closable={onClose ? true : false} onClose={onClose}>
            {isFullname ? student.fullname : student.firstname}
          </Tag>
        )}
      </Popover>
    )
  }
  const [discordChannels, setDiscordChannels] = useState([])
  useEffect(() => {
    if (!discord.value.hash) return
    fetch(`https://minagaku.z31.web.core.windows.net/${discord.value.hash}.json`)
      .then(r => r.json())
      .then(rd => {
        for (const r of rd) for (const t of r.talks) for (const m of t.messages) m.timestamp = moment(m.timestamp)
        setDiscordChannels(rd)
      })
  }, discord.value.hash)
  function tagRender(props) {
    const s = students.value[props.value]
    return renderTag(s, false, false, false, props.onClose)
  }

  const loc = (useLocation().pathname + "//").split("/")
  const params = { category: decodeURIComponent(loc[2]), channel: decodeURIComponent(loc[3]) }

  const currentChannel = useMemo(() => discordChannels.find(c => c.meta.category === params.category && c.meta.name === params.channel), [discordChannels, params])
  let content = useMemo(() => renderContent(currentChannel), [students, currentChannel])
  if (!currentChannel)
    content = (
      <>
        みながくDiscordログにようこそ！
        <br />
        詳細は「みながくDiscordのプレイヤーチャンネル」→「#みながく特設Webページチャンネル」を御覧ください。
      </>
    )
  return (
    <>
      <SEO title={`ログ/${params.channel}`} />
      <Layout className="discord">
        {renderSider(discordChannels)}
        <Content>{content}</Content>
      </Layout>
    </>
  )

  function studentByName(name) {
    return students.value.find(x => x.fullname === name)
  }

  function renderSider(channels) {
    const [modalVisible, setModalVisible] = useState(false)
    const showModal = useCallback(() => {
      setModalVisible(true)
    }, [setModalVisible])
    const closeModal = useCallback(() => {
      setModalVisible(false)
    }, [setModalVisible])
    const [filterStudents, setFilterStudents] = useState([])
    const [filterWord, setFilterWord] = useState("")
    const onFilterWord = useCallback(e => setFilterWord(e.target.value), [setFilterWord])
    const [filterAtTalk, setFilterAtTalk] = useState(true)
    const [pass, setPass] = useState({
      raw: discord.value.password,
      hash: false,
    })
    const [selected, setSelected] = useState(null)
    const selectedChannel = selected !== null ? channels[parseInt(selected.key)] : null
    const [menuOpend, setMenuOpend] = useState(["ロールプレイチャンネル"])
    const [activeTabKey, setActiveTabKey] = useState("1")
    useEffect(() => {
      async function genHash() {
        const hash1 = await generateHash(pass.raw + "minagaku-hash-1")
        if (hash1 === "ca701af4918adfba444487ab735c270136cad08d39ff79b26f09de16de0b0c9c") {
          const hash = await generateHash(pass.raw + "minagaku-hash-3")
          discord.set({ ...discord.value, hash: hash, password: pass.raw })
          setPass({ ...pass, hash: true })
        }
      }
      genHash()
    }, [pass.raw])
    const onMenuClick = useCallback(value => {
      setSelected(value)
      setActiveTabKey("3")
    })

    const opts = useMemo(
      () =>
        students.value.map((x, i) => ({
          value: i,
          label: (
            <>
              <div className="discord-option-img">
                <img src={x.chara_card} />
              </div>
              <div className="discord-option-label">
                {x.firstname}
                <small>{x.lastname}</small>
              </div>
            </>
          ),
        })),
      [students]
    )
    const studentFilterFunc = useCallback(
      (val, opt) => {
        const s = students.value[opt.value]
        return s.fullname.includes(val)
      },
      [students.value]
    )
    const channelMenu = useMemo(() => renderChannelMenu(channels), [channels])

    return (
      <Sider zeroWidthTriggerStyle={{ position: "fixed", left: 0, top: "100px" }} defaultCollapsed={true} collapsedWidth="0" breakpoint="md" className="sider" width={300}>
        <div className="sticky top-0 sider-in">
          <div>
            <Space style={{ margin: "5px" }}>
              みながくDC(人柱版)
              <Button onClick={showModal}>{pass.hash ? <FontAwesomeIcon icon={faCheck} /> : "Pass"}</Button>
              <Modal
                title="パスワード"
                visible={modalVisible}
                cancelText={null}
                footer={
                  <Button key="submit" type="primary" onClick={closeModal}>
                    OK
                  </Button>
                }
                onCancel={closeModal}
              >
                <Input
                  placeholder="パスワード"
                  value={pass.raw}
                  onChange={e => setPass({ raw: e.target.value, hash: null })}
                  addonAfter={pass.hash ? <FontAwesomeIcon icon={faCheck} color="green" /> : ""}
                />
              </Modal>
            </Space>
            <div className="m-2">
              <Input.Search placeholder="単語検索" onSearch={setFilterWord} />
              <Select
                className="mt-2"
                placeholder="学生検索"
                filterOption={studentFilterFunc}
                mode="multiple"
                style={{ width: "100%" }}
                onChange={setFilterStudents}
                tagRender={tagRender}
                options={opts}
              ></Select>
              <Checkbox checked={filterAtTalk} onChange={s => setFilterAtTalk(s.target.checked)}>
                @発言だけも検索に含める
              </Checkbox>
              <br />
            </div>

            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} type="card" size="small" tabBarExtraContent={goTopButton}>
              <Tabs.TabPane tab="Channels" key="1">
                <Menu mode="inline" onSelect={onMenuClick} onOpenChange={setMenuOpend} openKeys={menuOpend}>
                  {channelMenu}
                </Menu>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Timeline" key="2">
                {useMemo(() => renderTimeline(discordChannels, filterWord, filterStudents, filterAtTalk), [selectedChannel, filterWord, filterStudents, filterAtTalk, students])}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Talks" key="3">
                <h4>
                  {selectedChannel?.meta.category}/{selectedChannel?.meta.name}
                </h4>
                {useMemo(() => renderTalks(selectedChannel, filterWord, filterStudents, filterAtTalk), [selectedChannel, filterWord, filterStudents, filterAtTalk, students, activeAnchor])}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </Sider>
    )
  }

  function renderContent(channel) {
    console.log("renderContent")
    if (!channel) return null

    return channel.talks.map(x => (
      <div className="talk">
        <div className="id-hash" id={x.messages[0].timestamp.format("MMDDhhmm")} />
        {
          <div className="talk-header">
            <div>
              <Link to={`/discord/${channel.meta.category}/${channel.meta.name}#${x.messages[0].timestamp.format("MMDDhhmm")}`}>
                <time>
                  {x.messages[0].timestamp.format("M/D hh:mm")}～{x.messages.last().timestamp.format("M/D hh:mm")}
                </time>
              </Link>
              ({x.messages.length}件)
            </div>
            <div>{x.studentsWithAt.map(st => renderTag(studentByName(st), true,false,!x.students.includes(st)))}</div>
          </div>
        }
        {x.messages.map(y => (
          <>
            <div className="talk-content-header">
              <Link to={`/${prefixes.value.students}/${studentByName(y.author)?.fullname}`} className="img-container">
                <div className="chara-image" style={{ backgroundImage: `url(${studentByName(y.author)?.chara_card})` }}></div>
              </Link>
              <h4>
                {y.author}　<small>{y.timestamp.format("M/D hh:mm")}</small>
              </h4>
              <div>
                {y.content.split("\n").map(line => {
                  const [normal, at] = line.split(/[@＠]/g, 2)
                  return (
                    <>
                      {normal}
                      {at ? <span className="at-talk">@{at}</span> : ""}
                      <br />
                    </>
                  )
                })}
                {y.attachments.map(a => (
                  <a href={a.url}>
                    <img className="attachment" src={a.url} />
                  </a>
                ))}
                {y.reactions.length > 0 ? (
                  <div className="reactions">
                    {y.reactions.map(r => (
                      <span className="reaction">
                        <img src={r.emoji.imageUrl} />
                        {r.count}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ))}
        {/* {JSON.stringify(x)} */}
      </div>
    ))
  }

  function renderTimeline(discordChannels, filterWord, filterStudents, filterAtTalk) {
    if (filterStudents.length === 0 && filterWord === "") return null
    let reg = null
    try {
      if (filterWord.startsWith("/")) reg = new RegExp(filterWord.substring(1))
    } catch {}
    let list = []
    for (const channel of discordChannels)
      for (const t of channel.talks) {
        if (
          filterStudents.every(s => (filterAtTalk ? t.studentsWithAt.includes(students.value[s].fullname) : t.students.includes(students.value[s].fullname))) &&
          t.messages.some(m => (reg ? reg.test(m.content) : m.content.includes(filterWord)))
        )
          list.push({ ...t, meta: channel.meta })
      }

    list = list.sort((x, y) => x.messages[0].timestamp.diff(y.messages[0].timestamp))
    return (
      <List
        className="thread-list"
        size="small"
        itemLayout="horizontal"
        dataSource={list}
        renderItem={x => (
          <List.Item key={x.messages[0].timestamp.format("MMDDhhmm")}>
            <>
              <Link to={`/discord/${x.meta.category}/${x.meta.name}#${x.messages[0].timestamp.format("MMDDhhmm")}`}>
                {x.meta.category.startsWith("クエスト行動") ? x.meta.category.replace("クエスト行動相談　", "") : ""}
                {x.meta.name}
                <br />
                <time>
                  {x.messages[0].timestamp.format("M/D hh:mm")}～{x.messages.last().timestamp.format("hh:mm")}
                </time>
                ({x.messages.length})
              </Link>
              <div>{x.studentsWithAt.map(st => renderTag(getStudentByName(st), true, true, !x.students.includes(st)))}</div>
            </>
          </List.Item>
        )}
      />
    )
  }
  function renderTalks(channel, filterWord, filterStudents, filterAtTalk) {
    console.log("renderTalks")
    if (!channel) return "Channelsからチャネルを選択してください。"
    let reg = null
    try {
      if (filterWord.startsWith("/")) reg = new RegExp(filterWord.substring(1))
    } catch (e) {}
    let list = []
    if (filterStudents.length !== 0) {
      for (const t of channel.talks)
        if (
          filterStudents.every(s => (filterAtTalk ? t.studentsWithAt.includes(students.value[s].fullname) : t.students.includes(students.value[s].fullname))) &&
          t.messages.some(m => (reg ? reg.test(m.content) : m.content.includes(filterWord)))
        )
          list.push(t)
    } else {
      list = channel.talks
    }

    return (
      <List
        className="thread-list"
        size="small"
        itemLayout="horizontal"
        dataSource={list}
        renderItem={x => (
          <List.Item key={x.messages[0].timestamp.format("MMDDhhmm")}>
              <Link className={ activeAnchor === x.messages[0].timestamp.format("MMDDhhmm") ? "active" : "" } to={`/discord/${channel.meta.category}/${channel.meta.name}#${x.messages[0].timestamp.format("MMDDhhmm")}`}>
                <time>
                  {x.messages[0].timestamp.format("M/D hh:mm")}～{x.messages.last().timestamp.format("hh:mm")}
                </time>
                ({x.messages.length})
              </Link>
              <div>{x.studentsWithAt.map(st => renderTag(getStudentByName(st), true, true, !x.students.includes(st)))}</div>
          </List.Item>
        )}
      />
    )
  }
}

export default DiscordIndex
