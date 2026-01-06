import SearchClient from '@/components/client/search.client';
import { Col, Divider, Row } from 'antd';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';
import { useSearchParams } from 'react-router-dom';

const ClientJobPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();

    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <SearchClient />
                </Col>

                <Divider />

                <Col span={24}>
                    <JobCard
                        showPagination
                        query={query}   // ✅ DÒNG QUAN TRỌNG
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ClientJobPage;
