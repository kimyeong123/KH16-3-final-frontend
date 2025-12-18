import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

/** ====== 유틸 ====== */
function pickAttachmentNo(a, idx) {
  return a?.attachmentNo ?? a?.attachment_no ?? a?.no ?? a?.id ?? idx;
}
function pickAttachmentName(a, idx) {
  return (
    a?.originalName ??
    a?.original_name ??
    a?.attachmentName ??
    a?.attachment_name ??
    a?.filename ??
    a?.name ??
    `file_${idx}`
  );
}

const API = "http://localhost:8080";

// ✅ 이미지 캐시 방지를 위해 URL에 타임스탬프 추가 함수
const ATT_VIEW = (attachmentNo) => `${API}/attachment/${attachmentNo}`;

/**
 * ✅ SecureImage: 인증 헤더 포함 이미지 로딩 컴포넌트
 */
function SecureImage({ url, authHeader, alt, style }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let canceled = false;

    const run = async () => {
      setErr(false);
      setSrc(null);
      if (!url) return;

      try {
        // 1) 토큰 없이 시도
        try {
          const r0 = await axios.get(url, { responseType: "blob" });
          if (canceled) return;
          objectUrl = URL.createObjectURL(r0.data);
          setSrc(objectUrl);
          return;
        } catch {
          // ignore
        }

        // 2) 토큰 포함 시도
        const r1 = await axios.get(url, {
          responseType: "blob",
          headers: authHeader ? { Authorization: authHeader } : undefined,
        });

        if (canceled) return;
        objectUrl = URL.createObjectURL(r1.data);
        setSrc(objectUrl);
      } catch {
        if (canceled) return;
        setErr(true);
      }
    };

    run();

    return () => {
      canceled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, authHeader]);

  if (err) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#999",
          background: "#fafafa",
          ...style,
        }}
      >
        (이미지 로드 실패)
      </div>
    );
  }

  if (!src) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#999",
          background: "#fafafa",
          ...style,
        }}
      >
        로딩...
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} />;
}

export default function ProductEdit() {
  const { productNo } = useParams();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  // ✅ 토큰 유지 및 복구 (Hydration)
  const TOKEN_KEY = "ACCESS_TOKEN";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if ((!accessToken || String(accessToken).trim().length === 0) && saved && saved.trim().length > 0) {
      setAccessToken(saved);
    }
    setHydrated(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (accessToken && String(accessToken).trim().length > 0) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  }, [accessToken]);

  const authHeader = useMemo(() => {
    const t = accessToken || "";
    if (!t) return "";
    return t.startsWith("Bearer ") ? t : "Bearer " + t;
  }, [accessToken]);

  useEffect(() => {
    if (authHeader) axios.defaults.headers.common["Authorization"] = authHeader;
    else delete axios.defaults.headers.common["Authorization"];
  }, [authHeader]);

  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);

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

  const [attachments, setAttachments] = useState([]);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState([]); 

  useEffect(() => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const applyRenewedToken = (resp) => {
    const renewed = resp?.headers?.["access-token"] || resp?.headers?.["Access-Token"];
    if (renewed && renewed !== accessToken) setAccessToken(renewed);
  };

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ====== [중요] 첨부 목록 새로고침 (캐시 방지용 타임스탬프 추가) ====== */
  const refreshAttachments = async () => {
    try {
      // url 뒤에 ?t=시간을 붙여서 브라우저가 새 요청으로 인식하게 함
      const resp = await axios.get(`${API}/product/${productNo}/attachments?t=${Date.now()}`, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      applyRenewedToken(resp);
      setAttachments(resp.data || []);
    } catch (err) {
      console.error("첨부 목록 조회 실패", err.response || err);
      setAttachments([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API}/product/${productNo}`, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      applyRenewedToken(resp);

      const p = resp.data || {};
      setForm({
        name: p.name ?? "",
        categoryCode: String(p.categoryCode ?? p.category_code ?? ""),
        description: p.description ?? "",
        startPrice: String(p.startPrice ?? p.start_price ?? ""),
        instantPrice: String(p.instantPrice ?? p.instant_price ?? ""),
        startTime: String(p.startTime ?? p.start_time ?? "").slice(0, 16),
        endTime: String(p.endTime ?? p.end_time ?? "").slice(0, 16),
        status: p.status ?? "",
      });

      // 캐시 문제 방지를 위해 별도로 불러옴
      await refreshAttachments();
    } catch (err) {
      console.error("수정 화면 로딩 실패", err.response || err);
      alert("상품 정보를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    if (productNo) load();
    // eslint-disable-next-line
  }, [hydrated, productNo]);

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

  /** ====== 내부용: 파일 업로드 함수 ====== */
  const doUpload = async (method, fileList) => {
    const fd = new FormData();
    fileList.forEach((f) => fd.append("files", f));

    const resp = await axios({
      method,
      url: `${API}/product/${productNo}/attachments`,
      data: fd,
      headers: authHeader 
        ? { Authorization: authHeader, "Content-Type": "multipart/form-data" }
        : { "Content-Type": "multipart/form-data" },
    });
    return resp;
  };

  /** ====== 사진 추가 (버튼 클릭용) ====== */
  const uploadAppend = async () => {
    if (!authHeader) return alert("로그인이 필요합니다");
    if (files.length === 0) return alert("업로드할 사진을 먼저 선택하세요");

    setFileLoading(true);
    try {
      const resp = await doUpload("post", files);
      applyRenewedToken(resp);
      await refreshAttachments();
      clearSelectedFiles();
      alert("사진이 추가되었습니다");
    } catch (err) {
      console.error("추가 실패", err);
      alert("사진 업로드 실패");
    } finally {
      setFileLoading(false);
    }
  };

  /** ====== 사진 교체 (버튼 클릭용) ====== */
  const uploadReplace = async () => {
    if (!authHeader) return alert("로그인이 필요합니다");
    if (files.length === 0) return alert("교체할 사진을 먼저 선택하세요");
    if (!confirm("기존 사진을 모두 지우고 새 사진으로 교체할까요?")) return;

    setFileLoading(true);
    try {
      const resp = await doUpload("put", files);
      applyRenewedToken(resp);
      await refreshAttachments();
      clearSelectedFiles();
      alert("사진이 교체되었습니다");
    } catch (err) {
      console.error("교체 실패", err);
      alert("사진 교체 실패");
    } finally {
      setFileLoading(false);
    }
  };

  /** ====== 사진 삭제 ====== */
  const deleteExisting = async (attachmentNo) => {
    if (!authHeader) return alert("로그인이 필요합니다");
    if (!confirm("이 사진을 삭제할까요?")) return;

    setFileLoading(true);
    try {
      const resp = await axios.delete(`${API}/product/${productNo}/attachments/${attachmentNo}`, {
        headers: { Authorization: authHeader },
      });
      applyRenewedToken(resp);
      await refreshAttachments();
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제 실패");
    } finally {
      setFileLoading(false);
    }
  };

  /** ====== [최종 저장] 텍스트 수정 + 선택된 파일 자동 업로드 ====== */
  const submit = async (e) => {
    e.preventDefault();
    if (!authHeader) return alert("로그인이 필요합니다");

    setFileLoading(true); // 로딩 시작

    try {
      // 1️⃣ 만약 선택해둔 파일이 있다면, 사용자가 '추가' 버튼을 안 눌렀어도 자동으로 업로드 처리
      if (files.length > 0) {
        await doUpload("post", files); // 추가 모드로 업로드
      }

      // 2️⃣ 텍스트 정보 수정
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

      const resp = await axios.put(`${API}/product/${productNo}`, body, {
        headers: { Authorization: authHeader },
      });
      applyRenewedToken(resp);

      alert("수정 저장 완료");
      // 상세 페이지로 이동
      navigate(`/product/detail/${productNo}`);
    } catch (err) {
      console.error("수정 저장 실패", err.response || err);
      alert(`수정 저장 실패`);
    } finally {
      setFileLoading(false);
    }
  };

  if (!hydrated) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>페이지 준비중...</div>;
  if (loading) return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 14 }}>상품 수정</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 입력 필드들 */}
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

        <h3 style={{ textAlign: "center", margin: 0 }}>첨부 이미지</h3>

        {/* 기존 이미지 리스트 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          {attachments.length === 0 && !fileLoading && <div style={{ color: "#777", fontSize: 13 }}>기존 첨부가 없습니다</div>}
          {fileLoading && <div style={{ color: "#999", fontSize: 13 }}>처리 중...</div>}

          {attachments.map((a, idx) => {
            const no = pickAttachmentNo(a, idx);
            const nm = pickAttachmentName(a, idx);
            const url = ATT_VIEW(no);

            return (
              <div key={`att_${no}`} style={{ width: 160, border: "1px solid #ddd", borderRadius: 8, padding: 8, background: "#fff", opacity: fileLoading ? 0.5 : 1 }}>
                <div style={{ width: "100%", height: 110, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                  <SecureImage url={url} authHeader={authHeader} alt={nm} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#333", wordBreak: "break-all" }}>{nm}</div>
                <button type="button" onClick={() => deleteExisting(no)} disabled={fileLoading} style={{ marginTop: 8, padding: "6px 10px", width: "100%", cursor: fileLoading ? "not-allowed" : "pointer" }}>
                  삭제
                </button>
              </div>
            );
          })}
        </div>

        {/* 파일 선택 영역 */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={changeFiles} disabled={fileLoading} />
            <div style={{ fontSize: 12, color: "#777" }}>선택된 파일: {files.length}개</div>

            <button type="button" onClick={clearSelectedFiles} disabled={files.length === 0 || fileLoading} style={{ padding: "8px 12px" }}>
              선택 초기화
            </button>

            {/* 개별 업로드 버튼 (원하면 사용, 아니면 맨 아래 수정저장만 눌러도 됨) */}
            <button type="button" onClick={uploadAppend} disabled={files.length === 0 || fileLoading} style={{ padding: "8px 12px", color: "blue" }}>
              선택한 사진 바로 추가
            </button>
            <button type="button" onClick={uploadReplace} disabled={files.length === 0 || fileLoading} style={{ padding: "8px 12px", color: "red" }}>
              기존 사진 모두 교체
            </button>
          </div>

          {/* 미리보기 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            {previews.map((p, idx) => (
              <div key={`${p.file.name}_${idx}`} style={{ width: 160, border: "1px solid #ddd", borderRadius: 8, padding: 8, background: "#fff" }}>
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
          {/* ✅ 이 버튼을 누르면 텍스트 수정 + 선택된 파일 업로드까지 한 번에 함 */}
          <button type="submit" disabled={fileLoading} style={{ padding: "12px 20px", fontWeight: "bold", background: "#333", color: "white", border: "none", borderRadius: 6, cursor: fileLoading ? "wait" : "pointer" }}>
            {fileLoading ? "처리중..." : "수정 저장 (파일 포함)"}
          </button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "12px 20px", background: "#eee", border: "none", borderRadius: 6 }}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}