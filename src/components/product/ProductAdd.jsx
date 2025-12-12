// src/components/product/ProductAdd.jsx
import { useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";

export default function ProductAdd() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useAtom(accessTokenState);

  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    startTime: "",
    endTime: "",
  });

  const [files, setFiles] = useState([]);

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

    if (!accessToken || accessToken.trim().length === 0) {
      alert("로그인이 필요합니다");
      return;
    }

    
    if (!files || files.length === 0) {
      alert("첨부파일을 최소 1개 이상 선택해야 상품 등록이 가능합니다.");
      return;
    }

    const authHeader = accessToken.startsWith("Bearer ")
      ? accessToken
      : "Bearer " + accessToken;

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
      // 1) 상품 등록(JSON)
      const createResp = await axios.post("http://localhost:8080/product/", body, {
        headers: { Authorization: authHeader },
      });

      const renewed1 = createResp.headers["access-token"] || createResp.headers["Access-Token"];
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

      // 2) 첨부 업로드(multipart) - 이제는 무조건 실행(파일 필수라서)
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const uploadResp = await axios.post(
        `http://localhost:8080/product/${productNo}/attachments`,
        fd,
        { headers: { Authorization: authHeader } }
      );

      const renewed2 = uploadResp.headers["access-token"] || uploadResp.headers["Access-Token"];
      if (renewed2) setAccessToken(renewed2);

      // 3) 완료 페이지 이동
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
    <form onSubmit={submit}>
      <input name="name" value={form.name} onChange={changeForm} placeholder="상품명" />
      <input name="categoryCode" value={form.categoryCode} onChange={changeForm} placeholder="카테고리 코드" />
      <input name="startPrice" value={form.startPrice} onChange={changeForm} placeholder="시작가" type="number" />
      <input name="instantPrice" value={form.instantPrice} onChange={changeForm} placeholder="즉시구매가" type="number" />
      <input name="startTime" type="datetime-local" value={form.startTime} onChange={changeForm} />
      <input name="endTime" type="datetime-local" value={form.endTime} onChange={changeForm} />
      <textarea name="description" value={form.description} onChange={changeForm} placeholder="설명" />

  
      <input type="file" multiple onChange={changeFiles} required />

      <button type="submit">상품 등록</button>
    </form>
  );
}
