import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, ButtonGroup } from "react-bootstrap";

export default function ProductMyList() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 현재 탭 판별 (중첩 라우팅 기준)
  const isPurchase = pathname.includes("/product/mylist/purchase");
  const isSales = pathname.includes("/product/mylist/sales");

  return (
    <Container style={{ maxWidth: 1200 }} className="py-4">
      {/* 헤더 */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">내역 관리</h3>
        <div className="text-muted">구매/입찰 및 판매 내역을 확인하세요.</div>
      </div>

      {/* 탭 영역 (Flatly 톤) */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="d-flex justify-content-center">
          <ButtonGroup>
            <Button
              variant={isPurchase ? "primary" : "outline-primary"}
              onClick={() => navigate("purchase")}
            >
              내 구매/입찰 내역
            </Button>
            <Button
              variant={isSales ? "primary" : "outline-primary"}
              onClick={() => navigate("sales")}
            >
              내 판매 내역
            </Button>
          </ButtonGroup>
        </Card.Body>
      </Card>

      {/* 자식 라우트 렌더링 */}
      <Outlet />
    </Container>
  );
}
