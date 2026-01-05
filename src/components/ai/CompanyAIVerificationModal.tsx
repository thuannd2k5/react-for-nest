import { Modal, Spin, Tag, Divider } from 'antd';
import { CompanyAIVerification } from '@/types/ai';

interface Props {
    open: boolean;
    loading: boolean;
    data?: CompanyAIVerification | null;
    onClose: () => void;
}

const verdictColorMap: Record<string, string> = {
    legitimate: 'green',
    suspicious: 'orange',
    likely_fake: 'red',
};

const verdictLabelMap: Record<string, string> = {
    legitimate: 'Đáng tin cậy',
    suspicious: 'Đáng ngờ',
    likely_fake: 'Rủi ro cao',
};

const CompanyAIVerificationModal = ({
    open,
    loading,
    data,
    onClose,
}: Props) => {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="AI đánh giá độ tin cậy công ty"
            destroyOnClose
        >
            {loading && <Spin />}

            {!loading && data && (
                <>
                    <Tag color={verdictColorMap[data.verdict]}>
                        {verdictLabelMap[data.verdict]}
                    </Tag>

                    <p style={{ marginTop: 10 }}>
                        <b>Độ tin cậy:</b>
                        {typeof data.confidence === 'number'
                            ? Math.min(data.confidence, 95)
                            : 'Không xác định'}%
                    </p>

                    <Divider />

                    <b>Lý do đánh giá:</b>
                    <ul>
                        {data.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>

                    {data.red_flags.length > 0 && (
                        <>
                            <Divider />
                            <b>Dấu hiệu rủi ro:</b>
                            <ul>
                                {data.red_flags.map((r, i) => (
                                    <li key={i}>⚠ {r}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {data.recommendations.length > 0 && (
                        <>
                            <Divider />
                            <b>Khuyến nghị:</b>
                            <ul>
                                {data.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    <Divider />
                    <small style={{ color: '#888' }}>
                        * Kết quả do AI phân tích, chỉ mang tính tham khảo.
                    </small>
                </>
            )}
        </Modal>
    );
};

export default CompanyAIVerificationModal;
