import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productNo } = useParams();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  //  [추가] 토큰 유지 및 복구 (Hydration) 시작
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);

  // 1. 마운트 시 로컬스토리지에서 토큰 복구
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (
      (!accessToken || String(accessToken).trim().length === 0) &&
      saved &&
      saved.trim().length > 0
    ) {
      setAccessToken(saved);
    }
    setHydrated(true);
  }, []);

  // 2. 토큰 변경 시 로컬스토리지 저장
  useEffect(() => {
    if (accessToken && String(accessToken).trim().length > 0) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  }, [accessToken]);
  //  [추가] 끝

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // attachmentNo -> blob URL(미리보기)
  const [previewMap, setPreviewMap] = useState({});

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ")
      ? accessToken
      : "Bearer " + accessToken;
  }, [accessToken]);

  const ATT_VIEW = (attachmentNo) =>
    `http://localhost:8080/attachment/${attachmentNo}`;

  const load = async () => {
    setLoading(true);
    try {
      // 1) 상품
      const resp = await axios.get(
        `http://localhost:8080/product/${productNo}`,
        {
          headers: accessToken ? { Authorization: authHeader } : undefined,
        }
      );

      const renewed =
        resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      const data = resp.data;
      setProduct(data || null);

      // 2) 첨부 목록
      if (Array.isArray(data?.attachments)) {
        setAttachments(data.attachments);
      } else {
        const attResp = await axios.get(
          `http://localhost:8080/product/${productNo}/attachments`,
          {
            headers: accessToken ? { Authorization: authHeader } : undefined,
          }
        );

        const renewed2 =
          attResp.headers["access-token"] || attResp.headers["Access-Token"];
        if (renewed2) setAccessToken(renewed2);

        setAttachments(attResp.data || []);
      }
    } catch (err) {
      console.error("상세 로딩 실패", err.response || err);
      const status = err.response?.status;
      if (status === 401) alert("로그인이 필요합니다(토큰 만료 가능)");
      else alert("상품 상세를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 첨부 목록이 바뀌면: attachmentNo로 blob 받아서 미리보기 URL 생성
  useEffect(() => {
    let alive = true;
    const revokeList = [];

    const run = async () => {
      // 초기화
      setPreviewMap({});

      if (!attachments || attachments.length === 0) return;

      const next = {};

      for (const a of attachments) {
        const no = a.attachmentNo ?? a.attachment_no;
        if (!no) continue;

        try {
          const r = await axios.get(ATT_VIEW(no), {
            responseType: "blob",
            // 다운로드 API가 보호돼있으면 Authorization 필요
            headers: accessToken ? { Authorization: authHeader } : undefined,
          });

          const blobUrl = URL.createObjectURL(r.data);
          revokeList.push(blobUrl);
          next[no] = blobUrl;
        } catch (e) {
          console.error("첨부 미리보기 로딩 실패", no, e.response || e);
        }
      }

      if (alive) setPreviewMap(next);
    };

    run();

    return () => {
      alive = false;
      revokeList.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [attachments, accessToken, authHeader]);

  //  [수정] 토큰 복구가 완료된(hydrated) 후에 load 실행
  useEffect(() => {
    if (!hydrated) return;
    if (productNo) load();
    // eslint-disable-next-line
  }, [hydrated, productNo]);

  const remove = async () => {
    if (!accessToken || accessToken.trim().length === 0) {
      alert("로그인이 필요합니다");
      return;
    }
    if (!confirm("정말 삭제할까요?")) return;

    try {
      const resp = await axios.delete(
        `http://localhost:8080/product/${productNo}`,
        {
          headers: { Authorization: authHeader },
        }
      );

      const renewed =
        resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      alert("삭제 완료");
      navigate("/product/list");
    } catch (err) {
      console.error("삭제 실패", err.response || err);
      const status = err.response?.status;
      if (status === 401) alert("토큰 만료/로그인 필요");
      else alert("삭제 실패");
    }
  };

  const openPreview = (attachmentNo) => {
    const url = previewMap[attachmentNo];
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!hydrated) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>페이지 준비중...</div>;
  if (loading) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>로딩중...</div>;
  if (!product) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>상품이 없습니다.</div>;

  const p = product;
  const name = p.name ?? "";
  const desc = p.description ?? "";
  const startPrice = p.startPrice ?? p.start_price;
  const instantPrice = p.instantPrice ?? p.instant_price;
  const status = p.status ?? "";
  const startTime = p.startTime ?? p.start_time;
  const endTime = p.endTime ?? p.end_time;
  const categoryCode = p.categoryCode ?? p.category_code;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <h2 style={{ margin: 0 }}>상품 상세</h2>
        <button onClick={load} style={{ padding: "8px 12px" }}>
          새로고침
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          background: "white",
        }}
      >
        <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
          #{productNo} · {status}
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
          {name}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            rowGap: 8,
            columnGap: 10,
          }}
        >
          <div style={{ color: "#666" }}>카테고리 코드</div>
          <div>{categoryCode ?? "-"}</div>

          <div style={{ color: "#666" }}>시작가</div>
          <div>
            <b>{Number(startPrice || 0).toLocaleString()}</b>
          </div>

          <div style={{ color: "#666" }}>즉시구매가</div>
          <div>
            {instantPrice ? (
              <b>{Number(instantPrice).toLocaleString()}</b>
            ) : (
              "없음"
            )}
          </div>

          <div style={{ color: "#666" }}>시작시간</div>
          <div>{String(startTime ?? "-")}</div>

          <div style={{ color: "#666" }}>마감시간</div>
          <div>{String(endTime ?? "-")}</div>
        </div>

        <hr
          style={{
            margin: "14px 0",
            border: "none",
            borderTop: "1px solid #eee",
          }}
        />

        <div style={{ color: "#666", marginBottom: 6 }}>설명</div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {desc || "(설명 없음)"}
        </div>

        <hr
          style={{
            margin: "14px 0",
            border: "none",
            borderTop: "1px solid #eee",
          }}
        />

        <div style={{ color: "#666", marginBottom: 10 }}>첨부 이미지</div>

        {attachments.length === 0 ? (
          <div style={{ color: "#888" }}>첨부 없음</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {attachments.map((a, idx) => {
              const no = a.attachmentNo ?? a.attachment_no ?? idx;
              const filename =
                a.attachmentName ?? a.attachment_name ?? a.filename ?? "file";
              const src = previewMap[no];

              return (
                <div
                  key={no}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={filename}
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => openPreview(no)}
                    />
                  ) : (
                    <div
                      style={{
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      (미리보기 없음)
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginTop: 8,
                      wordBreak: "break-all",
                    }}
                  >
                    {filename}
                  </div>

                  {src && (
                    <button
                      type="button"
                      onClick={() => openPreview(no)}
                      style={{
                        marginTop: 8,
                        width: "100%",
                        padding: "8px 10px",
                      }}
                    >
                      원본 보기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            style={{ padding: "10px 14px" }}
            onClick={() => navigate(`/product/edit/${productNo}`)}
          >
            수정
          </button>
          <button style={{ padding: "10px 14px" }} onClick={remove}>
            삭제
          </button>
          <button style={{ padding: "10px 14px" }} onClick={() => navigate(-1)}>
            뒤로
          </button>
        </div>
      </div>
    </div>
  );
}
