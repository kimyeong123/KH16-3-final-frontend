// src/components/product/ProductEdit.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductEdit() {
  const navigate = useNavigate();
  const { productNo } = useParams();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const [loading, setLoading] = useState(true);

  // 원본(비교용)
  const [origin, setOrigin] = useState(null);

  // 수정 폼
  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: "",
    endTime: "",
  });

  // 카테고리 2단
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");

  const authHeader = accessToken?.startsWith("Bearer ")
    ? accessToken
    : "Bearer " + (accessToken || "");

  const toLocalInput = (v) => {
    if (!v) return "";
    const s = String(v).replace(" ", "T");
    return s.length >= 16 ? s.slice(0, 16) : s;
  };

  const toServerTime = (v) => {
    if (!v) return null;
    return v.length === 16 ? v + ":00" : v;
  };

  // ✅ 카테고리 대분류(공개)
  useEffect(() => {
    axios
      .get("http://localhost:8080/category/top")
      .then((resp) => setParents(resp.data || []))
      .catch((err) => {
        console.error("대분류 로딩 실패", err.response || err);
        alert("카테고리(대분류) 목록을 불러오지 못했습니다.");
      });
  }, []);

  // ✅ parentCode 바뀌면 children(공개)
  useEffect(() => {
    if (!parentCode) {
      setChildren([]);
      setChildCode("");
      return;
    }

    axios
      .get(`http://localhost:8080/category/${parentCode}/children`)
      .then((resp) => setChildren(resp.data || []))
      .catch((err) => {
        console.error("소분류 로딩 실패", err.response || err);
        alert("카테고리(소분류) 목록을 불러오지 못했습니다.");
      });
  }, [parentCode]);

  // childCode -> form.categoryCode
  useEffect(() => {
    setForm((prev) => ({ ...prev, categoryCode: childCode ? String(childCode) : prev.categoryCode }));
  }, [childCode]);

  // ✅ 상품 상세 로딩
  // - 토큰이 있을 때만 Authorization 붙임
  // - accessToken 의존성 포함(로그인 직후 토큰 갱신 반영)
  useEffect(() => {
    if (!productNo) return;

    setLoading(true);

    axios
      .get(`http://localhost:8080/product/${productNo}`, {
        headers: accessToken ? { Authorization: authHeader } : undefined,
      })
      .then((resp) => {
        const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
        if (renewed) setAccessToken(renewed);

        const data = resp.data || {};
        setOrigin(data);

        // origin이 카멜/스네이크 섞여도 폼은 안정적으로
        setForm({
          name: data.name ?? "",
          categoryCode: String(data.categoryCode ?? data.category_code ?? ""),
          description: data.description ?? "",
          startPrice: String(data.startPrice ?? data.start_price ?? ""),
          instantPrice: data.instantPrice == null ? "" : String(data.instantPrice ?? data.instant_price),
          startTime: toLocalInput(data.startTime ?? data.start_time),
          endTime: toLocalInput(data.endTime ?? data.end_time),
        });

        // 소분류는 일단 현재값만 표시(부모코드 추정은 백엔드 없으면 불가)
        setChildCode(String(data.categoryCode ?? data.category_code ?? ""));
      })
      .catch((err) => {
        console.error("상품 상세 로딩 실패", err.response || err);
        const status = err.response?.status;
        if (status === 401) alert("로그인이 필요합니다(토큰 만료).");
        else alert("상품 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [productNo, accessToken]); // ✅ 중요

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 변경된 값만 보내기(카멜/스네이크 둘 다 비교)
  const buildPatchBody = () => {
    if (!origin) return null;

    const o = {
      name: origin.name ?? "",
      categoryCode: origin.categoryCode ?? origin.category_code ?? null,
      description: origin.description ?? "",
      startPrice: origin.startPrice ?? origin.start_price ?? null,
      instantPrice: origin.instantPrice ?? origin.instant_price ?? null,
      startTime: origin.startTime ?? origin.start_time ?? null,
      endTime: origin.endTime ?? origin.end_time ?? null,
    };

    const payload = {};

    const nextName = form.name.trim();
    if (o.name !== nextName) payload.name = nextName;

    // categoryCode: 비어있으면 "변경 안 함" 처리(= 안 보냄)
    if (form.categoryCode !== "") {
      const nextCategory = Number(form.categoryCode);
      if (Number(o.categoryCode) !== nextCategory) payload.categoryCode = nextCategory;
    }

    const nextDesc = form.description ?? "";
    if (o.description !== nextDesc) payload.description = nextDesc;

    if (form.startPrice !== "") {
      const nextStartPrice = Number(form.startPrice);
      if (Number(o.startPrice) !== nextStartPrice) payload.startPrice = nextStartPrice;
    }

    // instantPrice: 비우면 "변경 안 함"(= updateUnit 구조상 null로 지우는 것도 불가)
    if (form.instantPrice !== "") {
      const nextInstantPrice = Number(form.instantPrice);
      if (Number(o.instantPrice) !== nextInstantPrice) payload.instantPrice = nextInstantPrice;
    }

    const nextStartTime = toServerTime(form.startTime);
    const oStart = o.startTime ? String(o.startTime).replace(" ", "T").slice(0, 19) : null;
    const nStart = nextStartTime ? String(nextStartTime).slice(0, 19) : null;
    if (nStart && oStart !== nStart) payload.startTime = nextStartTime;

    const nextEndTime = toServerTime(form.endTime);
    const oEnd = o.endTime ? String(o.endTime).replace(" ", "T").slice(0, 19) : null;
    const nEnd = nextEndTime ? String(nextEndTime).slice(0, 19) : null;
    if (nEnd && oEnd !== nEnd) payload.endTime = nextEndTime;

    return payload;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!accessToken || accessToken.trim().length === 0) {
      alert("로그인이 필요합니다");
      return;
    }

    const patchBody = buildPatchBody();
    if (!patchBody || Object.keys(patchBody).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    try {
      const resp = await axios.patch(
        `http://localhost:8080/product/${productNo}`,
        patchBody,
        { headers: { Authorization: authHeader } }
      );

      const renewed = resp.headers["access-token"] || resp.headers["Access-Token"];
      if (renewed) setAccessToken(renewed);

      alert("수정 완료");
      navigate(`/product/detail/${productNo}`);
    } catch (err) {
      console.error("수정 실패", err.response || err);
      const status = err.response?.status;
      if (status === 401) alert("토큰 만료/로그인 필요: 다시 로그인 해주세요");
      else alert("상품 수정 실패");
    }
  };

  if (loading) {
    return <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>로딩중...</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 18 }}>상품 수정</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>물품제목</div>
          <input
            name="name"
            value={form.name}
            onChange={changeForm}
            placeholder="물품제목"
            style={{ flex: 1, padding: 10 }}
          />
        </div>

        {/* 카테고리 2단 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 120, paddingTop: 10 }}>카테고리</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
              현재 categoryCode: {form.categoryCode || "(없음)"} (바꾸려면 아래에서 선택)
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <select
                size={7}
                value={parentCode}
                onChange={(e) => {
                  setParentCode(e.target.value);
                  setChildCode("");
                }}
                style={{ flex: 1, padding: 10, height: 210 }}
              >
                <option value="">- 선택하세요 -</option>
                {parents.map((p) => (
                  <option key={p.categoryCode} value={p.categoryCode}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                size={7}
                value={childCode}
                onChange={(e) => setChildCode(e.target.value)}
                style={{ flex: 1, padding: 10, height: 210 }}
                disabled={!parentCode}
              >
                <option value="">- 선택하세요 -</option>
                {children.map((c) => (
                  <option key={c.categoryCode} value={c.categoryCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
          <div style={{ fontSize: 12, color: "#888" }}>비워두면 즉시구매 없음(= 변경 안함)</div>
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

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="submit" style={{ padding: "10px 14px" }}>
            수정 저장
          </button>
          <button type="button" style={{ padding: "10px 14px" }} onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
