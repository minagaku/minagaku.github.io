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
  console.log("renderChannelMenu")
  const channelMap = new Map()
  for (const i of channels) {
    const c = channelMap.get(i.meta.category)
    if (c) c.push(i)
    else channelMap.set(i.meta.category, [i])
  }
  const res = Array.from(channelMap.entries()).map(([cat, chan]) => (
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

const DiscordIndex = () => {
  const { discord, students, prefixes } = useContext(GlobalContext)
  function getStudentByName(name) {
    return students.value.find(x => x.fullname === name)
  }
  function renderTag(student, isFullname, iconic, at) {
    if (!student) return <b>?</b>
    return (
      <Popover
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
          <Tag className="discord-select-tag" icon={<img src={student.chara_card} />}>
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
    return renderTag(s, false)
  }

  const params = useParams()
  const loc = useLocation()

  const currentChannel = useMemo( () => discordChannels.find(c => c.meta.category === params.category && c.meta.name === params.channel), [discordChannels,params]);
  const content = useMemo( () => renderContent(currentChannel),[students,currentChannel]);
  return (
    <>
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
      <Sider zeroWidthTriggerStyle={{ position: "fixed", left: 0, top: "100px" }} defaultCollapsed={true} collapsedWidth="0" breakpoint="lg" className="sider" width={250}>
        <div className="sticky top-0">
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
              <Input placeholder="単語検索" value={filterWord} onChange={setFilterWord} />
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
                <Menu mode="inline" onSelect={onMenuClick} onOpenChange={setMenuOpend} openKeys={menuOpend} inlineCollapsed={false}>
                  {channelMenu}
                </Menu>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Timeline" key="2">
                Comming Soon.
              </Tabs.TabPane>
              <Tabs.TabPane tab="Talks" key="3">
                <h4>
                  {selectedChannel?.meta.category}/{selectedChannel?.meta.name}
                </h4>
                {useMemo(() => renderTalks(selectedChannel, filterWord, filterStudents, filterAtTalk), [selectedChannel, filterWord, filterStudents, filterAtTalk, students])}
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
            <div>{x.students.map(st => renderTag(studentByName(st), true))}</div>
          </div>
        }
        {x.messages.map(y => (
          <>
            <div className="talk-content-header">
              <div className="img-container">
                <div className="chara-image" style={{ backgroundImage: `url(${studentByName(y.author)?.chara_card})` }}></div>
              </div>
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

  function renderTalks(channel, filterWord, filterStudents, filterAtTalk) {
    console.log("renderTalk!");
    if (!channel) return "Channelsからチャネルを選択してください。"
    const reg = filterWord.startsWith("/") ? new RegExp(filterWord.substr(1)) : null
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
      <Anchor affix={false}>
        <List
          className="thread-list"
          size="small"
          itemLayout="horizontal"
          dataSource={list}
          renderItem={x => (
            <List.Item key={x.messages[0].timestamp.format("MMDDhhmm")}>
              <>
                <Link to={`/discord/${channel.meta.category}/${channel.meta.name}#${x.messages[0].timestamp.format("MMDDhhmm")}`}>
                  <Anchor.Link href={`/discord/${channel.meta.category}/${channel.meta.name}#${x.messages[0].timestamp.format("MMDDhhmm")}`} />
                  <time>
                    {x.messages[0].timestamp.format("M/D hh:mm")}～{x.messages.last().timestamp.format("hh:mm")}
                  </time>
                  ({x.messages.length})
                </Link>
                <div>{x.students.map(st => renderTag(getStudentByName(st), true, true, !x.students.includes(st)))}</div>
              </>
            </List.Item>
          )}
        />
      </Anchor>
    )
  }
}

export default DiscordIndex
