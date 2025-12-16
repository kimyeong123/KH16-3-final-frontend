// src/components/product/ProductEdit.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

/** ===== 이미지 URL 후보 자동 생성 + 실패 시 다음 후보로 자동 교체 ===== */
function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("/")) return `http://localhost:8080${u}`;
  return u;
}

function pickAttachmentNo(a, idx) {
  return (
    a?.attachmentNo ??
    a?.attachment_no ??
    a?.no ??
    a?.id ??
    idx
  );
}

function pickAttachmentName(a, idx) {
  return (
    a?.attachmentName ??
    a?.attachment_name ??
    a?.filename ??
    a?.name ??
    `file_${idx}`
  );
}

function buildUrlCandidates({ productNo, attachmentNo, rawUrl }) {
  const base = "http://localhost:8080";
  const list = [];

  const fixed = normalizeUrl(rawUrl);
  if (fixed) list.push(fixed);

  // ✅ 프로젝트마다 흔한 다운로드/미리보기 경로 후보들
  if (attachmentNo != null) {
    list.push(`${base}/attachment/download/${attachmentNo}`);
    list.push(`${base}/attachment/${attachmentNo}`);
    list.push(`${base}/attachment/file/${attachmentNo}`);
    list.push(`${base}/product/${productNo}/attachments/${attachmentNo}`);
    list.push(`${base}/product/${productNo}/attachments/download/${attachmentNo}`);
  }

  return Array.from(new Set(list)).filter(Boolean);
}

function SmartImage({ candidates, alt }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[idx];

  if (!src) {
    return (
      <div
        style={{
          height: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 12,
        }}
      >
        (미리보기 URL 없음)
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setIdx((p) => p + 1)}
    />
  );
}

export default function ProductEdit() {
  const { productNo } = useParams();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const authHeader = useMemo(() => {
    const t = accessToken || "";
    if (!t) return "";
    return t.startsWith("Bearer ") ? t : "Bearer " + t;
  }, [accessToken]);

  const [loading, setLoading] = useState(true);

  // ✅ 상품 폼(기존 Edit에 맞춰서 필드만 맞추면 됨)
  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: "",
    endTime: "",
    status: "",
  });

  // ✅ 서버에 이미 존재하는 첨부 목록
  const [attachments, setAttachments] = useState([]);

  // ✅ 새로 선택한 파일 목록(서버 첨부랑 분리)
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // ✅ 선택 파일 미리보기
  const [previews, setPreviews] = useState([]); // [{file, url}]
  useEffect(() => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ====== 기존 데이터 로드 ====== */
  const refreshAttachments = async () => {
    try {
      const resp = await axios.get(
        `http://localhost:8080/product/${productNo}/attachments`,
        accessToken ? { headers: { Authorization: authHeader } } : undefined
      );

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed && renewed !== accessToken) setAccessToken(renewed);

      setAttachments(resp.data || []);
    } catch (err) {
      // 첨부 API 없거나 실패하면 그냥 빈 배열
      setAttachments([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/product/${productNo}`, {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed && renewed !== accessToken) setAccessToken(renewed);

      const p = resp.data || {};
      setForm({
        name: p.name ?? "",
        categoryCode: String(p.categoryCode ?? p.category_code ?? ""),
        description: p.description ?? "",
        startPrice: String(p.startPrice ?? p.start_price ?? ""),
        instantPrice: String(p.instantPrice ?? p.instant_price ?? ""),
        startTime: String(p.startTime ?? p.start_time ?? "").slice(0, 16), // datetime-local용
        endTime: String(p.endTime ?? p.end_time ?? "").slice(0, 16),
        status: p.status ?? "",
      });

      // attachments가 detail에 포함되면 그걸로
      if (Array.isArray(p.attachments)) setAttachments(p.attachments);
      else await refreshAttachments();
    } catch (err) {
      console.error("수정 화면 로딩 실패", err.response || err);
      alert("상품 정보를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productNo) load();
    // eslint-disable-next-line
  }, [productNo]);

  /** ====== 파일 선택 (누적 + 중복 제거) ====== */
  const changeFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => {
      const merged = [...prev, ...list];
      const seen = new Set();
      const uniq = [];
      for (const f of merged) {
        const key = `${f.name}_${f.size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(f);
      }
      return uniq;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearSelectedFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** ====== ✅ 사용자용 버튼: "선택한 사진 업로드" (추가 업로드) ====== */
  const uploadAppend = async () => {
    if (!accessToken) return alert("로그인이 필요합니다");
    if (files.length === 0) return alert("업로드할 사진을 먼저 선택하세요");

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const resp = await axios.post(
        `http://localhost:8080/product/${productNo}/attachments`,
        fd,
        { headers: { Authorization: authHeader } }
      );

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed && renewed !== accessToken) setAccessToken(renewed);

      await refreshAttachments();     // ✅ 업로드 후 즉시 다시 조회 → 총 3개 보이게 됨
      clearSelectedFiles();
      alert("사진이 추가되었습니다");
    } catch (err) {
      console.error("추가 업로드 실패", err.response || err);
      alert("사진 업로드 실패(서버 첨부 API 확인 필요)");
    }
  };

  /** ====== ✅ 사용자용 버튼: "기존 사진 모두 교체" ====== */
  const uploadReplace = async () => {
    if (!accessToken) return alert("로그인이 필요합니다");
    if (files.length === 0) return alert("교체할 사진을 먼저 선택하세요");
    if (!confirm("기존 사진을 모두 지우고 새 사진으로 교체할까요?")) return;

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      // ✅ 서버에 PUT이 있으면 이게 가장 깔끔
      const resp = await axios.put(
        `http://localhost:8080/product/${productNo}/attachments`,
        fd,
        { headers: { Authorization: authHeader } }
      );

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed && renewed !== accessToken) setAccessToken(renewed);

      await refreshAttachments();
      clearSelectedFiles();
      alert("사진이 교체되었습니다");
    } catch (err) {
      console.error("교체 실패", err.response || err);
      alert("사진 교체 실패(서버 PUT API 없으면 백엔드 구현 필요)");
    }
  };

  /** ====== 기존 첨부 삭제(엔드포인트는 프로젝트마다 달라서 2개 후보로 시도) ====== */
  const deleteExisting = async (attachmentNo) => {
    if (!accessToken) return alert("로그인이 필요합니다");
    if (!confirm("이 사진을 삭제할까요?")) return;

    try {
      // 1차 후보
      await axios.delete(
        `http://localhost:8080/product/${productNo}/attachments/${attachmentNo}`,
        { headers: { Authorization: authHeader } }
      );
    } catch (e1) {
      try {
        // 2차 후보
        await axios.delete(
          `http://localhost:8080/attachment/${attachmentNo}`,
          { headers: { Authorization: authHeader } }
        );
      } catch (e2) {
        console.error("첨부 삭제 실패", e2.response || e2);
        alert("삭제 실패(서버 첨부 삭제 API 확인 필요)");
        return;
      }
    }

    await refreshAttachments();
  };

  /** ====== 상품 정보 저장(첨부 업로드랑 별개) ====== */
  const submit = async (e) => {
    e.preventDefault();
    if (!accessToken) return alert("로그인이 필요합니다");

    const body = {
      productNo: Number(productNo),
      name: form.name,
      categoryCode: form.categoryCode ? Number(form.categoryCode) : null,
      description: form.description,
      startPrice: form.startPrice ? Number(form.startPrice) : null,
      instantPrice: form.instantPrice ? Number(form.instantPrice) : null,
      startTime: form.startTime ? form.startTime + ":00" : null,
      endTime: form.endTime ? form.endTime + ":00" : null,
      status: form.status || null,
    };

    try {
      const resp = await axios.put(`http://localhost:8080/product/${productNo}`, body, {
        headers: { Authorization: authHeader },
      });

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed && renewed !== accessToken) setAccessToken(renewed);

      alert("수정 저장 완료");
      navigate(`/product/detail/${productNo}`);
    } catch (err) {
      console.error("수정 저장 실패", err.response || err);
      alert("수정 저장 실패");
    }
  };

  if (loading) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 14 }}>상품 수정</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>상품명</div>
          <input name="name" value={form.name} onChange={changeForm} style={{ flex: 1, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>카테고리</div>
          <input name="categoryCode" value={form.categoryCode} onChange={changeForm} style={{ width: 220, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>시작가</div>
          <input name="startPrice" type="number" value={form.startPrice} onChange={changeForm} style={{ width: 220, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>즉시구매가</div>
          <input name="instantPrice" type="number" value={form.instantPrice} onChange={changeForm} style={{ width: 220, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>시작시간</div>
          <input name="startTime" type="datetime-local" value={form.startTime} onChange={changeForm} style={{ width: 260, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 120 }}>마감시간</div>
          <input name="endTime" type="datetime-local" value={form.endTime} onChange={changeForm} style={{ width: 260, padding: 10 }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 120, paddingTop: 8 }}>설명</div>
          <textarea name="description" value={form.description} onChange={changeForm} style={{ flex: 1, padding: 10, minHeight: 120 }} />
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />

        {/* =========================
           ✅ 첨부 이미지 섹션 (서버 기존 + 새 선택)
        ========================== */}
        <h3 style={{ textAlign: "center", margin: 0 }}>첨부 이미지</h3>

        {/* 기존 첨부 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          {attachments.length === 0 && (
            <div style={{ color: "#777", fontSize: 13 }}>기존 첨부가 없습니다</div>
          )}

          {attachments.map((a, idx) => {
            const no = pickAttachmentNo(a, idx);
            const nm = pickAttachmentName(a, idx);
            const rawUrl =
              a?.url ?? a?.downloadUrl ?? a?.download_url ?? a?.attachmentUrl ?? a?.attachment_url ?? null;
            const candidates = buildUrlCandidates({ productNo, attachmentNo: no, rawUrl });

            return (
              <div
                key={`att_${no}`}
                style={{
                  width: 160,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 8,
                  background: "#fff",
                }}
              >
                <div style={{ width: "100%", height: 110, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                  <SmartImage candidates={candidates} alt={nm} />
                </div>

                <div style={{ fontSize: 12, marginTop: 6, color: "#333", wordBreak: "break-all" }}>
                  {nm}
                </div>

                <button
                  type="button"
                  onClick={() => deleteExisting(no)}
                  style={{ marginTop: 8, padding: "6px 10px", width: "100%" }}
                >
                  삭제
                </button>
              </div>
            );
          })}
        </div>

        {/* 새로 선택한 파일 */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={changeFiles} />
            <div style={{ fontSize: 12, color: "#777" }}>선택된 파일: {files.length}개</div>

            <button type="button" onClick={clearSelectedFiles} disabled={files.length === 0} style={{ padding: "8px 12px" }}>
              선택 초기화
            </button>

            {/* ✅ 사용자용 버튼(POST/PUT 문구 숨김) */}
            <button type="button" onClick={uploadAppend} disabled={files.length === 0} style={{ padding: "8px 12px" }}>
              선택한 사진 추가
            </button>
            <button type="button" onClick={uploadReplace} disabled={files.length === 0} style={{ padding: "8px 12px" }}>
              기존 사진 모두 교체
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            {previews.length === 0 && <div style={{ color: "#777", fontSize: 13 }}>추가할 사진을 선택하면 여기에 미리보기가 뜹니다</div>}

            {previews.map((p, idx) => (
              <div
                key={`${p.file.name}_${p.file.size}_${idx}`}
                style={{ width: 160, border: "1px solid #ddd", borderRadius: 8, padding: 8, background: "#fff" }}
              >
                <div style={{ width: "100%", height: 110, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                  <img src={p.url} alt={p.file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#333", wordBreak: "break-all" }}>{p.file.name}</div>
                <button type="button" onClick={() => removeSelectedFile(idx)} style={{ marginTop: 8, padding: "6px 10px", width: "100%" }}>
                  선택 제거
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="submit" style={{ padding: "10px 14px" }}>수정 저장</button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "10px 14px" }}>취소</button>
        </div>
      </form>
    </div>
  );
}
