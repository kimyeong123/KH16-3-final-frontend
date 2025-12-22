import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
// ✅ swal 유틸리티 임포트
import { swalInfo, swalError, swalConfirm } from "../../utils/swal";

export default function ProductAdd() {
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  // --- [수정] 현재 시간 기반 초기값 설정 (최초 1회만 계산) ---
  const initialTimes = useMemo(() => {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? "오후" : "오전";
    const displayH = String(h % 12 || 12).padStart(2, '0');

    // 마감 시간 (+1시간)
    const afterOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const endDayStr = afterOneHour.getFullYear() + '-' + String(afterOneHour.getMonth() + 1).padStart(2, '0') + '-' + String(afterOneHour.getDate()).padStart(2, '0');
    let eh = afterOneHour.getHours();
    const eampm = eh >= 12 ? "오후" : "오전";
    const edisplayH = String(eh % 12 || 12).padStart(2, '0');
    const em = String(afterOneHour.getMinutes()).padStart(2, '0');

    return { todayStr, ampm, displayH, m, endDayStr, eampm, edisplayH, em };
  }, []);

  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
  });

  const [startDate, setStartDate] = useState(initialTimes.todayStr);
  const [startAmPm, setStartAmPm] = useState(initialTimes.ampm);
  const [startHour, setStartHour] = useState(initialTimes.displayH); 
  const [startMin, setStartMin] = useState(initialTimes.m);  

  const [endDate, setEndDate] = useState(initialTimes.endDayStr);
  const [endAmPm, setEndAmPm] = useState(initialTimes.eampm);
  const [endHour, setEndHour] = useState(initialTimes.edisplayH);
  const [endMin, setEndMin] = useState(initialTimes.em);

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");

  const categoryPath = useMemo(() => {
    const p = parents.find(p => String(p.categoryCode) === String(parentCode));
    const c = children.find(c => String(c.categoryCode) === String(childCode));
    return p && c ? `${p.name} > ${c.name}` : null;
  }, [parentCode, childCode, parents, children]);

  useEffect(() => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  useEffect(() => {
    axios.get("http://localhost:8080/category/top").then((resp) => setParents(resp.data || []));
  }, []);

  useEffect(() => {
    if (!parentCode) { setChildren([]); setChildCode(""); return; }
    axios.get(`http://localhost:8080/category/${parentCode}/children`).then((resp) => setChildren(resp.data || []));
  }, [parentCode]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, categoryCode: childCode ? String(childCode) : "" }));
  }, [childCode]);

  const changeFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔥 [수정] 입력 방해 요소(padStart) 제거
  const handleTimeInput = (value, max, setter) => {
    let val = value.replace(/[^0-9]/g, "");
    if (val === "") { setter(""); return; }
    if (Number(val) > max) val = String(max);
    setter(val.slice(0, 2));
  };

  const formatISO = (date, ampm, hour, min) => {
    let h = parseInt(hour || 0);
    if (ampm === "오후" && h < 12) h += 12;
    if (ampm === "오전" && h === 12) h = 0;
    return `${date}T${String(h).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}:00`;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return await swalInfo("물품 제목을 입력해 주세요.");
    if (!form.categoryCode) return await swalInfo("카테고리를 선택해 주세요.");
    if (!form.startPrice) return await swalInfo("시작가격을 입력해 주세요.");
    if (files.length === 0) return await swalInfo("사진을 1장 이상 등록해 주세요.");

    // 최종 전송 시에만 자릿수 맞춰줌
    const startTime = formatISO(startDate, startAmPm, startHour, startMin);
    const endTime = formatISO(endDate, endAmPm, endHour, endMin);
    
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const checkNow = new Date();

    if (startObj < new Date(checkNow.getTime() - 1000 * 60)) { 
      return await swalError("날짜 오류", "시작 시간은 현재 시간 이후여야 합니다.");
    }

    if (endObj <= startObj) {
      return await swalError("날짜 오류", "마감 시간은 시작 시간보다 늦어야 합니다.");
    }

    const ok = await swalConfirm("물품 등록", "입력하신 정보로 물품을 등록하시겠습니까?");
    if (!ok) return;

    const body = {
      ...form,
      categoryCode: Number(form.categoryCode),
      startPrice: Number(form.startPrice),
      instantPrice: form.instantPrice ? Number(form.instantPrice) : null,
      startTime,
      endTime,
      status: "REGISTRATION",
    };

    try {
      const resp = await axios.post("http://localhost:8080/product/", body, { headers: { Authorization: authHeader } });
      const pNo = resp.data?.productNo || resp.data?.product_no;
      if (pNo) {
        const fd = new FormData();
        files.forEach(f => fd.append("files", f));
        await axios.post(`http://localhost:8080/product/${pNo}/attachments`, fd, { headers: { Authorization: authHeader } });
        navigate("/product/done", { state: { productNo: pNo } });
      }
    } catch (err) { 
      await swalError("등록 실패", "서버 통신 중 오류가 발생했습니다.");
    }
  };

  const styles = {
    container: { maxWidth: "1100px", margin: "40px auto", padding: "0 20px", color: "#333" },
    title: { fontSize: "28px", fontWeight: "bold", borderBottom: "2px solid #333", paddingBottom: "15px", marginBottom: "30px" },
    section: { display: "flex", borderTop: "1px solid #ddd", padding: "30px 0" },
    left: { width: "200px", color: "#e63946", fontWeight: "bold", fontSize: "17px" },
    right: { flex: 1 },
    row: { display: "flex", alignItems: "center", marginBottom: "15px" },
    label: { width: "130px", fontSize: "14px", fontWeight: "bold", color: "#555" },
    input: { padding: "8px 10px", border: "1px solid #ccc", outline: "none", fontSize: "14px" },
    timeInput: { width: "50px", textAlign: "center", padding: "8px 5px", border: "1px solid #ccc", fontSize: "14px" },
    path: { marginTop: "12px", padding: "8px", background: "#fff5f5", color: "#e63946", fontSize: "13px", border: "1px solid #ffcccc", fontWeight: "bold" },
    imgHeader: { fontSize: "14px", fontWeight: "bold", marginBottom: "10px" },
    uploadBox: { border: "1px solid #ccc", background: "#f9f9f9", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" },
    fileBtn: { marginTop: "10px", padding: "6px 15px", background: "#fff", border: "1px solid #ccc", cursor: "pointer", fontSize: "13px" },
    thumbContainer: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" },
    thumbWrapper: { width: "100px", height: "100px", position: "relative", border: "1px solid #eee" },
    closeBtn: { position: "absolute", top: "-5px", right: "-5px", background: "#333", color: "#fff", border: "none", width: "20px", height: "20px", cursor: "pointer", borderRadius: "50%", fontSize: "12px" }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>온라인 물품등록</h2>

      <form onSubmit={submit}>
        <div style={styles.section}>
          <div style={styles.left}>01. 물품정보</div>
          <div style={styles.right}>
            <div style={styles.row}>
              <div style={styles.label}>물품제목</div>
              <input name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={{ ...styles.input, flex: 1 }} placeholder="물품 제목을 입력해 주세요" />
            </div>
            <div style={{ ...styles.row, alignItems: "flex-start" }}>
              <div style={styles.label}>카테고리</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select size={7} value={parentCode} onChange={(e) => setParentCode(e.target.value)} style={{ ...styles.input, flex: 1, height: "160px" }}>
                    {parents.map(p => <option key={p.categoryCode} value={p.categoryCode}>{p.name}</option>)}
                  </select>
                  <select size={7} value={childCode} onChange={(e) => setChildCode(e.target.value)} disabled={!parentCode} style={{ ...styles.input, flex: 1, height: "160px" }}>
                    {children.map(c => <option key={c.categoryCode} value={c.categoryCode}>{c.name}</option>)}
                  </select>
                </div>
                {categoryPath && <div style={styles.path}>선택된 카테고리: {categoryPath}</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.left}>02. 경매설정</div>
          <div style={styles.right}>
            <div style={styles.row}>
              <div style={styles.label}>시작가</div>
              <input name="startPrice" type="number" value={form.startPrice} onChange={(e) => setForm({...form, startPrice: e.target.value})} style={{ ...styles.input, width: "160px" }} /> 원
            </div>
            <div style={styles.row}>
              <div style={styles.label}>즉시구매가</div>
              <input name="instantPrice" type="number" value={form.instantPrice} onChange={(e) => setForm({...form, instantPrice: e.target.value})} placeholder="선택사항" style={{ ...styles.input, width: "160px" }} /> 원
            </div>
            
            <div style={styles.row}>
              <div style={styles.label}>시작일시</div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
              <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} style={{ ...styles.input, marginLeft: "8px" }}>
                <option value="오전">오전</option><option value="오후">오후</option>
              </select>
              <div style={{display:"flex", alignItems:"center", marginLeft:"5px"}}>
                <input type="text" value={startHour} onChange={(e) => handleTimeInput(e.target.value, 12, setStartHour)} style={styles.timeInput} />
                <span style={{margin:"0 3px"}}>시</span>
                <input type="text" value={startMin} onChange={(e) => handleTimeInput(e.target.value, 59, setStartMin)} style={styles.timeInput} />
                <span style={{margin:"0 3px"}}>분</span>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.label}>마감일시</div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
              <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} style={{ ...styles.input, marginLeft: "8px" }}>
                <option value="오전">오전</option><option value="오후">오후</option>
              </select>
              <div style={{display:"flex", alignItems:"center", marginLeft:"5px"}}>
                <input type="text" value={endHour} onChange={(e) => handleTimeInput(e.target.value, 12, setEndHour)} style={styles.timeInput} />
                <span style={{margin:"0 3px"}}>시</span>
                <input type="text" value={endMin} onChange={(e) => handleTimeInput(e.target.value, 59, setEndMin)} style={styles.timeInput} />
                <span style={{margin:"0 3px"}}>분</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.left}>03. 상세설명</div>
          <div style={styles.right}>
            <textarea name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="물품 상태 및 특징을 상세히 입력하세요" style={{ ...styles.input, width: "100%", height: "180px", resize: "none" }} />
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.left}>04. 이미지등록</div>
          <div style={styles.right}>
            <div style={styles.imgHeader}>물품이미지 <span style={{fontWeight:"normal", color:"#888", fontSize:"12px"}}>최소 1장 ~ 최대 15장까지 등록 가능합니다.</span></div>
            <div style={styles.uploadBox} onClick={() => fileInputRef.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault(); changeFiles({target: {files: e.dataTransfer.files}})}}>
               <div style={{textAlign:"center"}}>
                  <img src="https://img.icons8.com/ios/50/000000/camera--v1.png" alt="camera" style={{opacity:0.3, marginBottom:"10px"}} />
                  <div style={{color:"#aaa", fontSize:"13px"}}>업로드할 파일을 여기에 놓습니다.</div>
               </div>
            </div>
            <button type="button" style={styles.fileBtn} onClick={() => fileInputRef.current.click()}>파일첨부</button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={changeFiles} style={{ display: "none" }} />
            <div style={styles.thumbContainer}>
              {previews.map((p, idx) => (
                <div key={idx} style={styles.thumbWrapper}>
                  <img src={p.url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} style={styles.closeBtn}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", borderTop: "2px solid #333", padding: "40px 0", marginBottom: "80px" }}>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "12px 60px", marginRight: "12px", background: "#fff", border: "1px solid #333", cursor: "pointer", fontWeight: "bold" }}>취소</button>
          <button type="submit" style={{ padding: "12px 80px", background: "#333", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}>물품 등록하기</button>
        </div>
      </form>
    </div>
  );
}