import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { accessTokenState, loginNoState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { swalInfo, swalError, swalConfirm } from "../../utils/swal";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  ListGroup,
} from "react-bootstrap";

import { FaGavel, FaBolt, FaArrowLeft } from "react-icons/fa";

// 유틸
const normalizeBidAmount = (value, currentPrice, instantPrice) => {
  let v = Number(value);
  if (isNaN(v)) return currentPrice;
  v = Math.floor(v / 10) * 10;
  v = Math.max(v, currentPrice);
  if (instantPrice) v = Math.min(v, instantPrice);
  return v;
};

const formatRemainingTime = (endTime) => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { text: "경매 종료", expired: true };

  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  let text = "";
  if (d > 0) text += `${d}일 `;
  if (h > 0 || d > 0) text += `${h}시간 `;
  if (m > 0 || h > 0 || d > 0) text += `${m}분 `;
  text += `${s}초`;

  return { text: text.trim(), expired: false };
};

// confirm

const confirmBid = (amount) =>
  swalConfirm(
    "입찰 Point 확인",
    `${amount.toLocaleString()} Point로 입찰하시겠습니까?\n입찰 후에는 취소할 수 없습니다.`
  );

const confirmInstantBuy = (price) =>
  swalConfirm(
    "즉시구매 확인",
    `${price.toLocaleString()} Point에 즉시 낙찰됩니다.\n즉시구매를 진행하시겠습니까?`
  );

// 컴포넌트
export default function AuctionDetail() {
  const { productNo } = useParams();
  const navigate = useNavigate();

  const [accessToken] = useAtom(accessTokenState);
  const myMemberNo = Number(useAtomValue(loginNoState) || 0);

  // 상태
  const [product, setProduct] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingInstantBuy, setProcessingInstantBuy] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // 파생 상태
  const hasInstantBuy = !!product?.instantPrice;

  const instantButtonText = expired
    ? "경매 종료"
    : processingInstantBuy
    ? "즉시구매 반영중"
    : "즉시구매하기";

  const instantDisabled =
    expired ||
    processingInstantBuy ||
    (hasInstantBuy && currentPrice >= Number(product.instantPrice));

  const authHeader = useMemo(() => {
    if (!accessToken) return null;
    return accessToken.startsWith("Bearer ")
      ? accessToken
      : `Bearer ${accessToken}`;
  }, [accessToken]);

  // 상품 로딩
  useEffect(() => {
    if (!productNo) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:8080/product/${productNo}`,
          { headers: authHeader ? { Authorization: authHeader } : undefined }
        );

        setProduct(data);

        const price = data.currentPrice ?? data.startPrice ?? 0;
        setCurrentPrice(price);
        setBidAmount(String(price));

        // 처음 로딩 시 남은시간도 즉시 세팅
        if (data?.endTime) {
          const { text, expired } = formatRemainingTime(data.endTime);
          setRemaining(expired ? "경매 종료" : text);
          setExpired(expired);
          if (expired) setBidAmount("");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productNo, authHeader]);

  // 이미지 url 세팅
  useEffect(() => {
    if (!productNo) return;

    axios
      .get(`http://localhost:8080/product/${productNo}/image`)
      .then((res) => {
        // attachment 없으면 기본 이미지
        if (!res.data || res.data.length === 0) {
          setImageUrl("/no-image.png");
          return;
        }

        setImageUrl(`http://localhost:8080/attachment/${res.data}`);
      })
      .catch(() => setImageUrl("/no-image.png"));
  }, [productNo]);

  // 남은시간
  // 1 expired가 true면 타이머 effect 자체가 다시 돌지 않게 의존성에 expired 추가
  // 2 expired true일 때 remaining을 무조건 "경매 종료"로 고정
  useEffect(() => {
    if (!product?.endTime) return;

    // 이미 종료된 경우(즉시구매/시간종료/STOMP end 포함)면 "경매 종료" 고정 + 타이머 중단
    if (expired) {
      setRemaining("경매 종료");
      return;
    }

    const tick = () => {
      const { text, expired: timeExpired } = formatRemainingTime(
        product.endTime
      );

      if (timeExpired) {
        setExpired(true);
        setRemaining("경매 종료");
        setBidAmount("");
      } else {
        setRemaining(text);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [product?.endTime, expired]);

  // STOMP

  useEffect(() => {
    if (!productNo) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      // 입찰 갱신
      client.subscribe(`/topic/products/${productNo}/bid`, (msg) => {
        if (!msg?.body) return;
        const body = JSON.parse(msg.body);

        console.log("📨 bid message:", body);
        console.log("myMemberNo:", myMemberNo);

        setCurrentPrice(body.currentPrice);

        // 내 입력값이 현재가보다 작으면 끌어올림
        setBidAmount((prev) => {
          const n = Number(prev);
          if (isNaN(n) || n < body.currentPrice)
            return String(body.currentPrice);
          return prev;
        });

        // 남이 갱신하면 토스트
        if (Number(body.bidderNo) !== myMemberNo) {
          toast.info(
            `최고가가 ${Number(
              body.currentPrice
            ).toLocaleString()} Point로 갱신되었습니다`,
            { autoClose: 1500 }
          );
        }
      });

      // 경매 종료
      client.subscribe(`/topic/products/${productNo}/end`, (msg) => {
        if (!msg?.body) return;
        const body = JSON.parse(msg.body);

        setExpired(true);
        setRemaining("경매 종료");
        setBidAmount("");
        setProcessingInstantBuy(false);

        if (body.finalPrice) setCurrentPrice(body.finalPrice);

        Number(body.buyerNo) === myMemberNo
          ? toast.success("낙찰에 성공하였습니다", { autoClose: false })
          : toast.error("경매가 종료되었습니다", { autoClose: false });
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [productNo, myMemberNo]);

  // 액션

  const resolveBidAmount = (forcedAmount) =>
    typeof forcedAmount === "number"
      ? forcedAmount
      : normalizeBidAmount(bidAmount, currentPrice, product?.instantPrice);

  const placeBid = async (forcedAmount, skipConfirm = false) => {
    if (!accessToken) {
      await swalInfo("로그인이 필요합니다", "입찰하려면 로그인해주세요");
      return;
    }

    const amount = resolveBidAmount(forcedAmount);

    // 클릭 시에도 보정값을 입력창에 반영 (UX)
    setBidAmount(String(amount));

    if (!skipConfirm) {
      const ok = await confirmBid(amount);
      if (!ok) return;
    }

    try {
      await axios.post(
        `http://localhost:8080/products/${productNo}/bid/`,
        { amount },
        { headers: { Authorization: authHeader } }
      );
      toast.success("입찰에 성공하였습니다", { autoClose: 1200 });
    } catch {
      await swalError("입찰 실패", "잠시 후 다시 시도해주세요");
      // 즉시구매 반영중 켜놓고 실패하면 다시 풀어줌
      setProcessingInstantBuy(false);
    }
  };

  const placeInstantBuy = async () => {
    const ok = await confirmInstantBuy(product.instantPrice);
    if (!ok) return;

    setProcessingInstantBuy(true);
    await placeBid(product.instantPrice, true);
  };

  // 렌더

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5 min-vh-100">
      <div className="mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-2 text-primary small fw-semibold mb-1">
          <FaGavel />
          <span>AUCTION ITEM</span>
        </div>
        <h2 className="fw-bold mb-0 mt-3">{product.name}</h2>
      </div>
      <Row className="gy-4">
        {/* 이미지 영역 */}
        <Col md={7}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-center p-3">
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                }}
              >
                <img
                  src={imageUrl || "/no-image.png"}
                  alt="상품"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 경매 패널 */}
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {/* 남은시간 */}
              <div className="mb-4">
                {!expired && (
                  <div className="text-muted small mb-1">남은시간</div>
                )}
                <div className={`fw-bold fs-5 ${expired ? "text-danger" : ""}`}>
                  {remaining}
                </div>
              </div>

              <hr className="my-3" />

              {/* 현재 입찰가 */}
              <div className="mb-4">
                <div className="text-muted small mb-1">
                  {expired ? "낙찰가" : "현재 입찰가"}
                </div>
                <div
                  className={`fs-3 fw-bold ${
                    expired ? "text-red" : "text-blue"
                  }`}
                >
                  {currentPrice.toLocaleString()}
                  <span className="ms-1 text-muted fs-6">Point</span>
                </div>
              </div>

              <hr className="my-3" />

              {/* 가격 정보 */}
              <div className="mb-4">
                <div className="mb-2">
                  <div className="text-muted small">시작가</div>
                  <div className="fw-semibold fs-6">
                    {product.startPrice.toLocaleString()}
                    <span className="ms-1 text-muted small">Point</span>
                  </div>
                </div>

                {hasInstantBuy && (
                  <div>
                    <div className="text-muted small">즉시구매가</div>
                    <div className="fw-semibold fs-6">
                      {product.instantPrice.toLocaleString()}
                      <span className="ms-1 text-muted small">Point</span>
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-3" />

              {/* 희망 입찰가 */}
              <div className="mb-2">
                <div className="text-muted small mb-1">희망 입찰가</div>
                <InputGroup size="lg">
                  <Form.Control
                    value={bidAmount}
                    disabled={expired || instantDisabled}
                    placeholder={
                      expired
                        ? "경매가 종료되었습니다"
                        : `현재가(${currentPrice.toLocaleString()} Point)보다 높은 금액`
                    }
                    onChange={(e) =>
                      setBidAmount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onBlur={() => {
                      if (expired) return;

                      const fixed = normalizeBidAmount(
                        bidAmount,
                        currentPrice,
                        product?.instantPrice
                      );

                      setBidAmount(String(fixed));
                    }}
                  />
                </InputGroup>
              </div>

              {/* 입찰 버튼 */}
              <Button
                size="lg"
                className="w-100 mt-3 mb-2 d-flex align-items-center justify-content-center gap-2"
                disabled={expired}
                onClick={() => placeBid()}
              >
                <FaGavel size={16} style={{ marginBottom: "1px" }} />
                <span>{expired ? "경매 종료" : "입찰하기"}</span>
              </Button>

              {/* 즉시구매 버튼 */}
              {hasInstantBuy ? (
                <Button
                  size="lg"
                  variant={instantDisabled ? "secondary" : "danger"}
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={instantDisabled}
                  onClick={placeInstantBuy}
                >
                  <FaBolt size={16} style={{ marginBottom: "1px" }} />
                  <span>{instantButtonText}</span>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled
                >
                  <FaBolt size={16} style={{ marginBottom: "1px" }} />
                  <span>즉시구매 불가</span>
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 뒤로가기 */}
      <div className="mb-2">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="d-inline-flex align-items-center gap-2 text-decoration-none fw-semibold px-0 mt-3"
          style={{
            color: "#495057",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0d6efd")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#495057")}
        >
          <FaArrowLeft />
          <span>목록으로</span>
        </Button>
      </div>
    </Container>
  );
}
