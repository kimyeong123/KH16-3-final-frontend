import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

export default function AuctionDetail() {
  const navigate = useNavigate();
  const { productNo } = useParams();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // ✅ [추가] 토큰 유지 및 복구 (Hydration) 시작
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if ((!accessToken || String(accessToken).trim().length === 0) && saved && saved.trim().length > 0) {
      setAccessToken(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (accessToken && String(accessToken).trim().length > 0) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  }, [accessToken]);
  // ✅ [추가] 끝

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [previewMap, setPreviewMap] = useState({});
  const [selectedNo, setSelectedNo] = useState(null);

  const authHeader = useMemo(() => {
    if (!accessToken) return null;
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  const ATT_VIEW = (attachmentNo) => `http://localhost:8080/attachment/${attachmentNo}`;

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/${productNo}`, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      setProduct(resp.data || null);

      const attResp = await axios.get(`http://localhost:8080/product/${productNo}/attachments`, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      const renewed2 = attResp.headers["access-token"] || attResp.headers["Access-Token"];
      if (renewed2) setAccessToken(renewed2);

      setAttachments(attResp.data || []);
    } catch (err) {
      console.error("경매 상세 로딩 실패", err.response || err);
      // alert("경매 상세를 불러오지 못했습니다"); // 에러 메시지가 거슬리면 주석 처리
      setProduct(null);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    const revokeList = [];

    const run = async () => {
      setPreviewMap({});
      if (!attachments || attachments.length === 0) return;

      const next = {};
      for (const a of attachments) {
        const no = a.attachmentNo ?? a.attachment_no;
        if (!no) continue;

        try {
          const r = await axios.get(ATT_VIEW(no), {
            responseType: "blob",
            headers: authHeader ? { Authorization: authHeader } : undefined,
          });
          const blobUrl = URL.createObjectURL(r.data);
          revokeList.push(blobUrl);
          next[no] = blobUrl;
        } catch (e) {
          console.error("첨부 미리보기 실패:", no, e.response || e);
        }
      }

      if (!alive) return;
      setPreviewMap(next);

      if (!selectedNo) {
        const first = attachments.map(x => x.attachmentNo ?? x.attachment_no).find(n => n && next[n]);
        if (first) setSelectedNo(first);
      }
    };

    run();

    return () => {
      alive = false;
      revokeList.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line
  }, [attachments, authHeader]);

  // ✅ [수정] 토큰 복구가 완료된(hydrated) 후에만 데이터를 불러옴
  useEffect(() => {
    if (!hydrated) return; 
    if (productNo) load();
    // eslint-disable-next-line
  }, [hydrated, productNo]);

  // ✅ 로딩 전 상태 처리
  if (!hydrated) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>페이지 준비중...</div>;
  if (loading) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>로딩중...</div>;
  if (!product) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>상품이 없습니다.</div>;

  const name = product.name ?? "";
  const desc = product.description ?? "";

  const selectedSrc = selectedNo ? previewMap[selectedNo] : null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 30px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 10px", textAlign: "left" }}>
        {name}
      </div>
      <div style={{ height: 1, background: "#e9e9e9", marginBottom: 16 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "520px 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 14 }}>
          <div
            style={{
              width: "100%",
              height: 420,
              borderRadius: 10,
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "1px solid #f0f0f0",
            }}
          >
            {selectedSrc ? (
              <img
                src={selectedSrc}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ color: "#999" }}>(첨부 이미지 없음)</div>
            )}
          </div>

          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto", paddingBottom: 6 }}>
              {attachments.map((a, idx) => {
                const no = a.attachmentNo ?? a.attachment_no ?? idx;
                const src = previewMap[no];

                return (
                  <button
                    key={no}
                    type="button"
                    onClick={() => src && setSelectedNo(no)}
                    style={{
                      border: no === selectedNo ? "2px solid #222" : "1px solid #ddd",
                      borderRadius: 10,
                      padding: 0,
                      width: 78,
                      height: 78,
                      background: "white",
                      cursor: src ? "pointer" : "default",
                      flex: "0 0 auto",
                    }}
                    title={a.originalName ?? a.original_name ?? "file"}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt="thumb"
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                        -
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ minHeight: 420 }} />
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>설명</div>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            background: "white",
            padding: 16,
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {desc || "(설명 없음)"}
        </div>

        <div style={{ fontSize: 16, fontWeight: 900, margin: "18px 0 10px" }}>첨부</div>

        {attachments.length === 0 ? (
          <div style={{ color: "#888" }}>첨부 없음</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {attachments.map((a, idx) => {
              const no = a.attachmentNo ?? a.attachment_no ?? idx;
              const filename = a.originalName ?? a.original_name ?? a.filename ?? "file";
              const src = previewMap[no];

              return (
                <div key={no} style={{ border: "1px solid #eee", borderRadius: 12, background: "white", padding: 10 }}>
                  {src ? (
                    <img
                      src={src}
                      alt={filename}
                      style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedNo(no);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ) : (
                    <div style={{ height: 140, borderRadius: 10, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                      (미리보기 없음)
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 12, color: "#666", wordBreak: "break-all" }}>{filename}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={{ padding: "10px 14px" }} onClick={() => navigate("/product/auction/list")}>
            목록으로
          </button>
          <button style={{ padding: "10px 14px" }} onClick={() => navigate(-1)}>
            뒤로
          </button>
        </div>
      </div>
    </div>
  );
}