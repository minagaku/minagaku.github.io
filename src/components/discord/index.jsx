import React, { useContext, useState } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import { useEffect } from 'react';
import "./discord.sass"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Input, Modal, Button, Select, Tag, Layout, Space, Checkbox } from 'antd';
import Sider from 'antd/lib/layout/Sider';

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
        fetch('https://minagaku.z31.web.core.windows.net/twitter.json')
            .then((r) => r.json())
            .then((rd) => {
                discord.set(rd);
            });
    }, []);
    const [pass, setPass] = useState({
        raw: discord.value.password,
        hash: null
    });
    useEffect(() => {
        async function genHash() {
            const hash1 = await generateHash(pass.raw + "minagaku-hash-1");
            console.log(hash1);
            if (hash1 === "ca701af4918adfba444487ab735c270136cad08d39ff79b26f09de16de0b0c9c") {
                const hash = await generateHash(pass.raw + "minagaku-hash-3");
                setPass({ ...pass, hash: hash })
            }
        }
        genHash()
    }, [pass.raw])
    function tagRender(props) {
        const s = students.value[props.value];
        return <Tag className="discord-select-tag" icon={<img src={s.chara_card} />} closable={props.closable} onClose={props.onClose}>
            {s.firstname}
        </Tag>
    }

    function filter(val,opt)
    {
        const s = students.value[ opt.value];
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
    return (
        <>
            <Layout class="discord">
                <Sider style={{ minHeight: '100vh' }}>
                    <Space style={{margin: "5px"}}>
                        みながくDiscord
                        <Button onClick={() => setModalVisible(true)}>{ pass.hash ? <FontAwesomeIcon icon={faCheck} /> : "Pass"}</Button>
                        <Modal title="パスワード" visible={modalVisible} cancelText={null} footer={<Button key="submit" type="primary" onClick={() => setModalVisible(false)}> OK </Button>} onCancel={() => setModalVisible(false)}>
                            <Input placeholder="パスワード" value={pass.raw} onChange={e => setPass({ raw: e.target.value, hash: null })} addonAfter={pass.hash ? <FontAwesomeIcon icon={faCheck} color="green" /> : ""} />
                        </Modal>
                    </Space>
                    <div className="m-2">
                        <Select placeholder="学生検索" filterOption={filter} mode="multiple" style={{ width: "100%" }} tagRender={tagRender} options={opts}> </Select>
                        <Checkbox>@のみを含める</Checkbox>
                    </div>
                </Sider>
            </Layout>
        </>
    );
};

export default DiscordIndex;
