import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import ChatAIBox from './chat.box';

const ClientChatPage = () => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]} justify="center">
                <Col span={24} md={16}>
                    <ChatAIBox />
                </Col>
            </Row>
        </div>
    );
};

export default ClientChatPage;
