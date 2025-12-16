// src/components/product/ProductAdd.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductAdd() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const [form, setForm] = useState({
    name: "",
    categoryCode: "", // 소분류 category_code
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: "",
    endTime: "",
  });

  const [files, setFiles] = useState([]);

  // ===== 카테고리(2단) 상태 =====
  const [parents, setParents] = useState([]);   // 대분류
  const [children, setChildren] = useState([]); // 소분류
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");

  // ✅ 네가 쓰던 토큰 헤더 방식 그대로
  const authHeader = accessToken.startsWith("Bearer ")
    ? accessToken
    : "Bearer " + accessToken;

  // ===== 카테고리 API =====
  // ✅ 카테고리는 "공개"로 쓰는게 맞음 → Authorization 헤더 아예 안 보냄(토큰 영향 차단)
  useEffect(() => {
    axios
      .get("http://localhost:8080/category/top")
      .then((resp) => setParents(resp.data || []))
      .catch((err) => {
        console.error("대분류 로딩 실패", err.response || err);
        alert("카테고리(대분류) 목록을 불러오지 못했습니다.");
      });
  }, []);

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
        console.error("소분류 로딩 실패", err.response || err);
        alert("카테고리(소분류) 목록을 불러오지 못했습니다.");
      });
  }, [parentCode]);

  // 소분류 선택 → form.categoryCode 반영
  useEffect(() => {
    setForm((prev) => ({ ...prev, categoryCode: childCode ? String(childCode) : "" }));
  }, [childCode]);

  // ===== 폼 공통 =====
  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const changeFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const submit = async (e) => {
    e.preventDefault();

    // ✅ 네 기존 체크 그대로
    if (!accessToken || accessToken.trim().length === 0) {
      alert("로그인이 필요합니다");
      return;
    }
    if (!form.categoryCode) {
      alert("카테고리(소분류)를 선택하세요");
      return;
    }
    if (!files || files.length === 0) {
      alert("첨부파일을 최소 1개 이상 선택해야 상품 등록이 가능합니다.");
      return;
    }

    const body = {
      name: form.name,
      categoryCode: Number(form.categoryCode),
      description: form.description,
      startPrice: Number(form.startPrice),
      finalPrice: null,
      instantPrice: form.instantPrice ? Number(form.instantPrice) : null,
      startTime: form.startTime + ":00",
      endTime: form.endTime + ":00",
      status: "REGISTRATION",
      buyerNo: null,
    };

    try {
      // 1) 상품 등록(JSON) - ✅ 여기만 토큰 사용
      const createResp = await axios.post("http://localhost:8080/product/", body, {
        headers: { Authorization: authHeader },
      });

      const renewed1 =
        createResp.headers["access-token"] || createResp.headers["Access-Token"];
      if (renewed1) setAccessToken(renewed1);

      const productNo =
        createResp.data?.productNo ??
        createResp.data?.product_no ??
        createResp.data?.productId ??
        createResp.data?.product_id ??
        null;

      if (!productNo) {
        alert("상품은 등록됐는데 productNo 응답이 없어서 첨부 업로드를 못합니다. 서버 응답을 확인하세요.");
        return;
      }

      // 2) 첨부 업로드(multipart) - ✅ 여기만 토큰 사용
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const uploadResp = await axios.post(
        `http://localhost:8080/product/${productNo}/attachments`,
        fd,
        { headers: { Authorization: authHeader } }
      );

      const renewed2 =
        uploadResp.headers["access-token"] || uploadResp.headers["Access-Token"];
      if (renewed2) setAccessToken(renewed2);

      navigate("/product/done", {
        state: {
          message: "상품과 첨부가 정상적으로 등록되었습니다.",
          productNo,
        },
      });
    } catch (err) {
      const status = err.response?.status;
      console.error("등록 실패", err.response || err);

      if (status === 401) alert("토큰 만료/로그인 필요: 다시 로그인 해주세요");
      else alert("상품 등록/첨부 업로드 실패");
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

        {/* 카테고리 2단 */}
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

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 120 }}>이미지</div>
          <input type="file" multiple onChange={changeFiles} required />
          <div style={{ fontSize: 12, color: "#777" }}>선택된 파일: {files.length}개</div>
        </div>

        <button type="submit" style={{ padding: "10px 14px" }}>
          상품 등록
        </button>
      </form>
    </div>
  );
}
