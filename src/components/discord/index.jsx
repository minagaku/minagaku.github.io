import React, { useContext, useState } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import { useEffect } from 'react';
import "./discord.sass"
import "./global.less"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { List, Input, Modal, Button, Select, Tag, Layout, Space, Checkbox, Radio, Menu, Popover, Anchor, Tabs } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link, useParams, useLocation, navigate } from '@reach/router';
const moment = require('moment');
const { Sider, Content } = Layout;

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    }
}

async function generateHash(str) {
    // generate hash!
    const hex = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return hexString(hex); // convert to hex string.

    /** array buffer to hex string */
    function hexString(buffer) {
        const byteArray = new Uint8Array(buffer);
        const hexCodes = [...byteArray].map(value => {
            const hexCode = value.toString(16);
            const paddedHexCode = hexCode.padStart(2, '0');
            return paddedHexCode;
        });
        return hexCodes.join('');
    }
}

const DiscordIndex = () => {
    const { discord, students, prefixes } = useContext(GlobalContext);
    useEffect(() => {
        // fetch('./merged.json')
        //     .then((r) => r.json())
        //     .then((rd) => {
        //         discord.set(rd);
        //     });
        discord.set({ messages: require("./merged.json"), id2pc: require("./id2pc.json") })
    }, []);
    const [pass, setPass] = useState({
        raw: discord.value.password,
        hash: null
    });
    useEffect(() => {
        async function genHash() {
            const hash1 = await generateHash(pass.raw + "minagaku-hash-1");
            if (hash1 === "ca701af4918adfba444487ab735c270136cad08d39ff79b26f09de16de0b0c9c") {
                const hash = await generateHash(pass.raw + "minagaku-hash-3");
                setPass({ ...pass, hash: hash })
            }
        }
        genHash()
    }, [pass.raw])
    function tagRender(props) {
        const s = students.value[props.value];
        if (!s) return <b style={{ color: "red" }}>Invalid!{props.value}</b>
        return <Tag className="discord-select-tag" icon={<img src={s.chara_card} />} closable={props.closable} onClose={props.onClose}>
            {s.firstname}
        </Tag>
    }
    function filter(val, opt) {
        const s = students.value[opt.value];
        return s.fullname.includes(val);
    }

    const opts = students.value.map((x, i) => ({
        value: i,
        label: <>
            <div className="discord-option-img"><img src={x.chara_card} /></div>
            <div className="discord-option-label">{x.firstname}<small>{x.lastname}</small></div>
        </>,
    }))

    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState(null);

    const channelMap = new Map();
    discord.value.messages.forEach(i => {
        const c = channelMap.get(i.channel.category);
        if (c) c.push(i); else channelMap.set(i.channel.category, [i])
    });

    const params = useParams()
    const loc = useLocation()
    const [selectedCat, selectedChannelId] = selected ? selected.key.split("/") : [null, null]
    const channelList = selected ? channelMap.get(selectedCat) : []
    const selectedChannel = selected ? channelList.find(x => x.channel.id === selectedChannelId) : null
    console.log(selectedChannel, channelList);

    return (
        <>
            <Layout className="discord">
                <Sider style={{ minHeight: '100vh' }} width={250}>
                    <Space style={{ margin: "5px" }}>
                        みながくDiscord
                        <Button onClick={() => setModalVisible(true)}>{pass.hash ? <FontAwesomeIcon icon={faCheck} /> : "Pass"}</Button>
                        <Modal title="パスワード" visible={modalVisible} cancelText={null} footer={<Button key="submit" type="primary" onClick={() => setModalVisible(false)}> OK </Button>} onCancel={() => setModalVisible(false)}>
                            <Input placeholder="パスワード" value={pass.raw} onChange={e => setPass({ raw: e.target.value, hash: null })} addonAfter={pass.hash ? <FontAwesomeIcon icon={faCheck} color="green" /> : ""} />
                        </Modal>
                    </Space>
                    <div className="m-2">
                        <Input placeholder="単語検索" />
                        <Select className="mt-2" placeholder="学生検索" filterOption={filter} mode="multiple" style={{ width: "100%" }} tagRender={tagRender} options={opts}> </Select>
                        <Checkbox>@発言だけも検索に含める</Checkbox><br />
                        {/* <Radio.Group defaultValue="channel" buttonStyle="solid">
                            <Radio.Button value="channel">チャンネル</Radio.Button>
                            <Radio.Button value="timeline">時間</Radio.Button>
                        </Radio.Group> */}
                    </div>

                    <Anchor>
                        <Tabs defaultActiveKey="1" type="card" size="small" moreIcon={null}>
                            <Tabs.TabPane tab="チャンネル" key="1">
                                <Menu mode="inline" onSelect={(val) => { setSelected(val) }}>
                                    {
                                        Array.from(channelMap.entries()).map(([cat, chan]) =>
                                            <SubMenu key={cat} title={cat}>
                                                {
                                                    chan.map(x =>
                                                        <Menu.Item key={x.channel.category + "/" + x.channel.id}>
                                                            {x.channel.name}
                                                        </Menu.Item>
                                                    )
                                                }
                                            </SubMenu>
                                        )
                                    }
                                </Menu>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="タイムライン" key="2">
                                Content of Tab Pane 2
                        </Tabs.TabPane>
                            <Tabs.TabPane tab="トーク" key="3">
                                {selectedChannel?.name}
                                {renderSubTimeLine(selectedChannel, channelList, discord.value.id2pc)}
                            </Tabs.TabPane>
                        </Tabs>
                    </Anchor>

                </Sider>
                <Content>
                    {
                        renderContent(params.category, params.channel, loc.hash, channelMap, discord.value)
                    }
                </Content>
            </Layout>
        </>
    );

    function iconTagRender(value) {
        const s = students.value[value];
        if (!s) return <b style={{ color: "red" }}>Invalid!{value}</b>
        return <Popover
            content={<><img width="100" src={s.chara_card} /><br />PL: {s.player}</>}
            title={<Link to={`/${prefixes.value.students}/${s.fullname}`}>{s.fullname}</Link>}
            trigger="click">
            <Button type={s.chara_card ? "text" : "dashed"} icon={<img src={s.chara_card} />}>
                {s.chara_card ? null : s.firstname}
            </Button>
        </Popover>;
    }

    function contentTagRender(s) {
        if (!s) return <b style={{ color: "red" }}>Invalid!{props.value}</b>
        return <Popover
            content={<><img width="100" src={s.chara_card} /><br />PL: {s.player}</>}
            title={<Link to={`/${prefixes.value.students}/${s.fullname}`}>{s.fullname}</Link>}
            trigger="hover">
            <Tag className="discord-select-tag" icon={<img src={s.chara_card} />} >
                <Link to={`/${prefixes.value.students}/${s.firstname}`}>{s.fullname}</Link>
            </Tag>
        </Popover>
    }


    function studentByName(name) {
        return students.value.find(x => x.fullname === name);
    }



    function renderContent(category, chan, hash, map, discord) {
        if (!category || !chan || map.size === 0) return;
        const channelList = map.get(category);
        const channel = channelList.find(x => x.channel.name === chan)

        const threads = getThread(channel, discord.id2pc)
        return threads.map(x => <div className="talk">
            <div className="id-hash" id={x.messages[0][0].timestamp2.format("MMDDhhmm")} />
            {
                <div className="talk-header">
                    <div>
                        <Link to={`/discord/${channel.channel.category}/${channel.channel.name}#${x.messages[0][0].timestamp2.format("MMDDhhmm")}`}>
                            <time>
                                {x.messages[0][0].timestamp2.format("M/D hh:mm")}～{x.messages.last().last().timestamp2.format("M/D hh:mm")}
                            </time>
                        </Link>
                        ({x.messages.length}件)
                    </div>
                    <div>
                        {x.students.map(st => contentTagRender(studentByName(st)))}
                    </div>
                </div>
            }
            {x.messages.map(y => <>
                <div className="talk-content-header">
                    <div className="img-container">
                        <div className="chara-image" style={{ backgroundImage: `url(${studentByName(y[0].author.pcname).chara_card})` }}></div>
                    </div>
                    <h4>{y[0].author.pcname}　<small>{y[0].timestamp2.format("M/D hh:mm")}</small></h4>
                    <div>
                        {
                            y.map(z => <div>{
                                z.content.split("\n").map(line => {
                                    const [normal, at] = line.split(/[@＠]/g, 2)
                                    return <>{normal}{at ? <span className="at-talk">@{at}</span> : ""}<br /></>
                                })
                            }
                                {z.attachments.map(a => <a href={a.url}><img className="attachment" src={a.url} /></a>}
                                {z.reactions.length > 0 ?
                                    <div className="reactions">
                                        {
                                            z.reactions.map(r => <span className="reaction"><img src={r.emoji.imageUrl} />{r.count}</span>)
                                        }
                                    </div>
                                    : null
                                }

                            </div>)
                        }
                    </div>
                </div>
            </>)}
            {/* {JSON.stringify(x)} */}
        </div>)

    }

    function getThread(channel, id2pc) {
        let current = []
        let cMap = new Map();
        let final = [];
        channel.messages.forEach(m => {
            m.timestamp2 = moment(Date.parse(m.timestamp));
            m.author.pcname = id2pc[m.author.id] ?? m.author.name;
            if (current.length === 0) {
                current.push([m]);
                return;
            }
            const lastTalk = current[current.length - 1]
            const last = lastTalk[lastTalk.length - 1]
            if (m.timestamp2.diff(last.timestamp2, "hours", true) > 2) {
                final.push({ messages: current, students: Array.from(cMap.keys()).map(x => id2pc[x]) });
                current = [];
                cMap = new Map();
            }
            if (m.timestamp2.diff(last.timestamp2, "minutes", true) <= 5 && m.author.pcname === last.author.pcname) {
                lastTalk.push(m);
            } else {
                current.push([m]);
            }
            cMap.set(m.author.id);
        });

        if (current.length !== 0) final.push({ messages: current, students: Array.from(cMap.keys()).map(x => id2pc[x]) });
        return final
    }

    function renderSubTimeLine(channel, list, id2pc) {
        if (!channel || !list) return "Select!"


        let current = []
        let cMap = new Map();
        const final = getThread(channel, id2pc)

        return <List className="thread-list" size="small" itemLayout="horizontal" dataSource={final} renderItem={x => <List.Item>
            <>
                <Link to={`/discord/${channel.channel.category}/${channel.channel.name}#${x.messages[0][0].timestamp2.format("MMDDhhmm")}`}>
                    <>
                        <Anchor.Link href={`/discord/${channel.channel.category}/${channel.channel.name}#${x.messages[0][0].timestamp2.format("MMDDhhmm")}`} />
                        <time>
                            {x.messages[0][0].timestamp2.format("M/D hh:mm")}～{x.messages.last().last().timestamp2.format("hh:mm")}
                        </time>
                            ({x.messages.length})
                            </>
                </Link>
                <div>
                    {x.students.map(st => iconTagRender(students.value.findIndex(x => x.fullname === st)))}
                </div>
            </>
        </List.Item>
        } />

        return <Menu mode="inline">{
            final.map(x =>
                <Menu.Item key={x.messages[0].timestamp2.format("MM-DDhh:mm:ss")}>
                    <div>
                        <time>
                            {x.messages[0].timestamp2.format("M月D日hh:mm")} ～ {x.messages[x.messages.length - 1].timestamp2.format("M月D日 hh:mm")}
                        </time>
                    ({x.messages.length})
                    {x.students.map(st => tagRender({ value: students.value.findIndex(x => x.fullname === st) }))}
                    </div>
                </Menu.Item>
            )
        } </Menu>
    }
};



export default DiscordIndex;
