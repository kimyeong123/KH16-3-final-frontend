import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductAdd() {
  const navigate = useNavigate();
  
  // [핵심] Jotai에서 토큰 가져오기 (수동 복구 로직 삭제됨)
  const [accessToken] = useAtom(accessTokenState);

  // [핵심] 토큰이 변경될 때마다 Authorization 헤더 자동 생성
  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  // === 입력 폼 상태 ===
  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: "",
    endTime: "",
  });

  // === 파일 관련 상태 ===
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  // 파일 변경 시 미리보기 URL 생성 및 해제
  useEffect(() => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  // === 카테고리 상태 ===
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");

  // 대분류 불러오기
  useEffect(() => {
    axios
      .get("http://localhost:8080/category/top")
      .then((resp) => setParents(resp.data || []))
      .catch((err) => {
        console.error("대분류 로딩 실패", err);
      });
  }, []);

  // 대분류 선택 시 소분류 불러오기
  useEffect(() => {
    if (!parentCode) {
      setChildren([]);
      setChildCode("");
      setForm((prev) => ({ ...prev, categoryCode: "" }));
      return;
    }

    axios
      .get(`http://localhost:8080/category/${parentCode}/children`)
      .then((resp) => setChildren(resp.data || []))
      .catch((err) => {
        console.error("소분류 로딩 실패", err);
      });
  }, [parentCode]);

  // 소분류 선택 시 폼 상태 업데이트
  useEffect(() => {
    setForm((prev) => ({ ...prev, categoryCode: childCode ? String(childCode) : "" }));
  }, [childCode]);

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const changeFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => {
      const merged = [...prev, ...list];
      const uniq = [];
      const seen = new Set();
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

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();

    // 1. 유효성 검사
    if (!accessToken) {
      alert("로그인이 필요합니다");
      // 로그인 페이지로 이동시키는 게 더 친절함
      navigate("/member/login"); 
      return;
    }
    if (!form.name.trim()) return alert("물품 제목을 입력하세요");
    if (!form.categoryCode) return alert("카테고리(소분류)를 선택하세요");
    if (!form.startPrice) return alert("시작가격을 입력하세요");
    if (!form.startTime) return alert("시작시간을 입력하세요");
    if (!form.endTime) return alert("마감시간을 입력하세요");
    if (!files || files.length === 0) {
      alert("첨부파일을 최소 1개 이상 선택해야 상품 등록이 가능합니다.");
      return;
    }

    // 2. 전송 데이터 준비
    const body = {
      name: form.name,
      categoryCode: Number(form.categoryCode),
      description: form.description,
      startPrice: Number(form.startPrice),
      finalPrice: null,
      instantPrice: form.instantPrice ? Number(form.instantPrice) : null,
      startTime: form.startTime + ":00", // 초 단위 추가
      endTime: form.endTime + ":00",
      status: "REGISTRATION",
      buyerNo: null,
    };

    try {
      // 3. 상품 등록 API 호출
      // BoardEdit와 마찬가지로 Authorization 헤더만 잘 넣어주면 됩니다.
      const createResp = await axios.post("http://localhost:8080/product/", body, {
        headers: { Authorization: authHeader },
      });

      const productNo =
        createResp.data?.productNo ??
        createResp.data?.product_no ??
        createResp.data?.productId ??
        null;

      if (!productNo) {
        alert("상품 등록은 되었으나 번호를 반환받지 못해 사진 업로드를 실패했습니다.");
        return;
      }

      // 4. 첨부파일 업로드 API 호출
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      await axios.post(
        `http://localhost:8080/product/${productNo}/attachments`,
        fd,
        { headers: { Authorization: authHeader } }
      );

      // 5. 완료 페이지 이동
      navigate("/product/done", {
        state: { message: "상품과 첨부가 정상적으로 등록되었습니다.", productNo },
      });

    } catch (err) {
      console.error("등록 실패", err.response || err);
      const status = err.response?.status;

      if (status === 401) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/member/login");
      } else {
        alert("상품 등록 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 18 }}>온라인 물품등록</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>물품제목</div>
          <input
            name="name"
            value={form.name}
            onChange={changeForm}
            placeholder="물품제목을 입력해 주세요."
            style={{ flex: 1, padding: 10 }}
          />
        </div>

        {/* 카테고리 2단 선택 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 120, paddingTop: 10 }}>카테고리</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <select
                size={7}
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value)}
                style={{ flex: 1, padding: 10, height: 210 }}
              >
                <option value="">- 대분류 선택 -</option>
                {parents.map((p) => (
                  <option key={p.categoryCode} value={p.categoryCode}>{p.name}</option>
                ))}
              </select>

              <select
                size={7}
                value={childCode}
                onChange={(e) => setChildCode(e.target.value)}
                style={{ flex: 1, padding: 10, height: 210 }}
                disabled={!parentCode}
              >
                <option value="">- 소분류 선택 -</option>
                {children.map((c) => (
                  <option key={c.categoryCode} value={c.categoryCode}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 가격 및 시간 정보 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>시작가</div>
          <input
            name="startPrice"
            value={form.startPrice}
            onChange={changeForm}
            placeholder="시작가"
            type="number"
            style={{ width: 220, padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>즉시구매가</div>
          <input
            name="instantPrice"
            value={form.instantPrice}
            onChange={changeForm}
            placeholder="(선택) 즉시구매가"
            type="number"
            style={{ width: 220, padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>시작시간</div>
          <input
            name="startTime"
            type="datetime-local"
            value={form.startTime}
            onChange={changeForm}
            style={{ width: 260, padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>마감시간</div>
          <input
            name="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={changeForm}
            style={{ width: 260, padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 120, paddingTop: 10 }}>설명</div>
          <textarea
            name="description"
            value={form.description}
            onChange={changeForm}
            placeholder="설명"
            style={{ flex: 1, padding: 10, minHeight: 120 }}
          />
        </div>

        {/* 첨부 이미지 섹션 */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #eee" }}>
          <h3 style={{ marginBottom: 10 }}>첨부 이미지</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={changeFiles}
            />
            <div style={{ fontSize: 12, color: "#777" }}>선택된 파일: {files.length}개</div>

            <button type="button" onClick={clearFiles} disabled={files.length === 0} style={{ padding: "8px 12px" }}>
              선택 초기화
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            {previews.length === 0 && (
              <div style={{ color: "#777", fontSize: 13 }}>선택된 첨부가 없습니다</div>
            )}

            {previews.map((p, idx) => (
              <div
                key={`${p.file.name}_${idx}`}
                style={{ width: 160, border: "1px solid #ddd", borderRadius: 8, padding: 8, background: "#fff" }}
              >
                <div style={{ width: "100%", height: 110, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                  <img
                    src={p.url}
                    alt={p.file.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#333", wordBreak: "break-all" }}>
                  {p.file.name}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  style={{ marginTop: 8, padding: "6px 10px", width: "100%" }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" style={{ padding: "10px 14px", marginTop: 8 }}>
          상품 등록
        </button>
      </form>
    </div>
  );
}