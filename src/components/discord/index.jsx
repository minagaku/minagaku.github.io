import React, { useContext, useState } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import { useEffect } from 'react';
import "./discord.sass"
import "./global.less"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { List, Input, Modal, Button, Select, Tag, Layout, Space, Checkbox, Radio, Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
const moment = require('moment');
const { Sider, Content } = Layout;

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
    const { discord, students } = useContext(GlobalContext);
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
        if(!s) return <b style={{ color:"red" }}>Invalid!{props.value}</b>
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
                        学生:
                        <Select placeholder="学生検索" filterOption={filter} mode="multiple" style={{ width: "100%" }} tagRender={tagRender} options={opts}> </Select>
                        <Checkbox>@発言だけも検索に含める</Checkbox><br />
                        チャンネル:
                        <Select placeholder="学生検索" filterOption={filter} mode="multiple" style={{ width: "100%" }} tagRender={tagRender} options={opts}> </Select>
                        <Radio.Group defaultValue="channel" buttonStyle="solid">
                            <Radio.Button value="channel">チャンネル</Radio.Button>
                            <Radio.Button value="timeline">時間</Radio.Button>
                        </Radio.Group>
                    </div>
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
                </Sider>
                <Sider width={250}>
                    {
                        renderSubTimeLine(selected?.key, channelMap, discord.value.id2pc)
                    }

                </Sider>
                <Content>
                </Content>
            </Layout>
        </>
    );

    function renderSubTimeLine(key, map, id2pc) {
        if (!key) return "Select!"
        const [cat, chan] = key.split("/")
        const list = map.get(cat);
        const channel = list.find(x => x.channel.id === chan)

        const final = []

        let current = []
        let cMap = new Map();
        channel.messages.forEach(m => {
            m.timestamp2 = moment(Date.parse(m.timestamp));
            if (current.length === 0) {
                current.push(m);
                return;
            }
            const last = current[current.length - 1]
            if (m.timestamp2.diff(last.timestamp2, "hours", true) > 2) {
                final.push({ messages: current, students: Array.from(cMap.keys()).map(x => id2pc[x]) });
                current = [];
                cMap = new Map();
            }
            current.push(m);
            cMap.set(m.author.id);
        });

        if (current.length !== 0) final.push({ messages: current, students: Array.from(cMap.keys()).map(x => id2pc[x]) });

        return <List size="small" itemLayout="horizontal" dataSource={final} renderItem={x => <List.Item>
                <div>
                    <time>
                        {x.messages[0].timestamp2.format("M月D日hh:mm")} ～ {x.messages[x.messages.length - 1].timestamp2.format("M月D日 hh:mm")}
                    </time>
                ({x.messages.length})
                <div>
                        {x.students.map(st => tagRender({ value: students.value.findIndex(x => x.fullname === st) }))}
                    </div>
                </div>
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
                    {x.students.map(st => tagRender({ value: students.value.findIndex( x=> x.fullname === st) }))}
                </div>
            </Menu.Item>
        )
        } </Menu>
    }
};



export default DiscordIndex;
