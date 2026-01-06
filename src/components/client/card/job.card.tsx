import { callFetchJob } from '@/config/api';
import { callAnalyzeJobAI } from '@/config/ai.api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { JobAIVerification } from '@/types/ai';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import JobAIVerificationModal from '@/components/ai/JobAIVerificationModal';

dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
    query?: string;
}

const JobCard = ({ showPagination = false, query = '' }: IProps) => {
    /* ===== LIST JOB ===== */
    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);

    /* ===== AI ===== */
    const [checkingJobId, setCheckingJobId] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<JobAIVerification | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchJob();
    }, [current, query]);


    const fetchJob = async () => {
        setIsLoading(true);
        const searchQuery = query ? `&${query}` : '';

        const res = await callFetchJob(
            `current=${current}&pageSize=${pageSize}${searchQuery}`
        );

        if (res?.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`);
    };

    const handleCheckJobAI = async (jobId: string) => {
        setCheckingJobId(jobId);
        setAiLoading(true);
        setAiResult(null);

        try {
            const res = await callAnalyzeJobAI(jobId);
            const aiAnalysis = res?.data?.ai_analysis;
            if (aiAnalysis) setAiResult(aiAnalysis);
        } finally {
            setAiLoading(false);
        }
    };

    const handleCloseModal = () => {
        setCheckingJobId(null);
        setAiResult(null);
        setAiLoading(false);
    };

    return (
        <div className={styles['card-job-section']}>
            <div className={styles['job-content']}>
                <Spin spinning={isLoading}>
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles['dflex-mobile'] : styles['dflex-pc']}>
                                <span className={styles['title']}>Công Việc Mới Nhất</span>
                                {!showPagination && <Link to="job">Xem tất cả</Link>}
                            </div>
                        </Col>

                        {displayJob?.map((item) => (
                            <Col span={24} md={12} key={item._id}>
                                <Card hoverable onClick={() => handleViewDetailJob(item)}>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item._id) {
                                                handleCheckJobAI(item._id);
                                            }
                                        }}
                                        title="AI kiểm tra tin tuyển dụng"
                                        style={{ float: 'right', cursor: 'pointer' }}
                                    >
                                        🤖
                                    </div>

                                    <div className={styles['card-job-content']}>
                                        <img
                                            alt={item.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item.company?.logo}`}
                                            style={{ width: "60px", height: "60px" }}
                                        />

                                        <div>
                                            <div className={styles['job-title']}>{item.name}</div>
                                            <div>
                                                <EnvironmentOutlined /> {getLocationName(item.location)}
                                            </div>
                                            <div>
                                                <ThunderboltOutlined style={{ color: 'orange' }} />{' '}
                                                {(item.salary + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}

                        {!displayJob?.length && !isLoading && (
                            <Col span={24}>
                                <Empty description="Không có dữ liệu" />
                            </Col>
                        )}
                    </Row>

                    {showPagination && (
                        <Pagination
                            style={{ marginTop: 20, textAlign: 'center' }}
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            onChange={(p) => setCurrent(p)}
                        />
                    )}
                </Spin>
            </div>

            {/* ===== AI MODAL ===== */}
            <JobAIVerificationModal
                open={!!checkingJobId}
                loading={aiLoading}
                data={aiResult}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default JobCard;
