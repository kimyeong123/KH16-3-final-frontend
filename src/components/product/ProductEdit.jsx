import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate, useParams } from "react-router-dom";
// ✅ swal 유틸리티 임포트
import { swalInfo, swalError, swalConfirm } from "../../utils/swal";

export default function ProductEdit() {
  const { productNo } = useParams();
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  const authHeader = useMemo(() => {
    if (!accessToken) return "";
    return accessToken.startsWith("Bearer ") ? accessToken : "Bearer " + accessToken;
  }, [accessToken]);

  const [form, setForm] = useState({
    name: "",
    categoryCode: "",
    description: "",
    startPrice: "",
    instantPrice: "",
    status: "",
    finalPrice: 0,
    buyerNo: null
  });

  const [startDate, setStartDate] = useState("");
  const [startAmPm, setStartAmPm] = useState("오전");
  const [startHour, setStartHour] = useState("09");
  const [startMin, setStartMin] = useState("00");

  const [endDate, setEndDate] = useState("");
  const [endAmPm, setEndAmPm] = useState("오후");
  const [endHour, setEndHour] = useState("06");
  const [endMin, setEndMin] = useState("00");

  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const categoryPath = useMemo(() => {
    const p = parents.find(p => String(p.categoryCode) === String(parentCode));
    const c = children.find(c => String(c.categoryCode) === String(childCode));
    return p && c ? `${p.name} > ${c.name}` : "카테고리를 선택해 주세요.";
  }, [parentCode, childCode, parents, children]);

  const loadData = async () => {
    try {
      const topResp = await axios.get("http://localhost:8080/category/top");
      setParents(topResp.data || []);

      const detailResp = await axios.get(`http://localhost:8080/product/${productNo}`);
      const data = detailResp.data;
      
      setForm({
        name: data.name,
        categoryCode: data.categoryCode,
        description: data.description,
        startPrice: data.startPrice,
        instantPrice: data.instantPrice || "",
        status: data.status,
        finalPrice: data.finalPrice,
        buyerNo: data.buyerNo
      });

      const parseTime = (isoStr) => {
        if (!isoStr) return { date: "", ampm: "오전", h: "09", m: "00" };
        const d = new Date(isoStr);
        const date = isoStr.split("T")[0];
        let h = d.getHours();
        const ampm = h >= 12 ? "오후" : "오전";
        h = h % 12;
        h = h ? h : 12; 
        return { date, ampm, h: String(h).padStart(2, '0'), m: String(d.getMinutes()).padStart(2, '0') };
      };

      const s = parseTime(data.startTime);
      setStartDate(s.date); setStartAmPm(s.ampm); setStartHour(s.h); setStartMin(s.m);
      const e = parseTime(data.endTime);
      setEndDate(e.date); setEndAmPm(e.ampm); setEndHour(e.h); setEndMin(e.m);

      const attResp = await axios.get(`http://localhost:8080/product/${productNo}/attachments`);
      setExistingFiles(attResp.data || []);
      
      setChildCode(data.categoryCode);
    } catch (err) { console.error("로드 실패", err); }
  };

  useEffect(() => { loadData(); }, [productNo]);

  useEffect(() => {
    if (!parentCode) { setChildren([]); return; }
    axios.get(`http://localhost:8080/category/${parentCode}/children`).then(resp => setChildren(resp.data || []));
  }, [parentCode]);

  useEffect(() => {
    const next = newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setNewPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [newFiles]);

  const handleTimeInput = (value, max, setter) => {
    let val = value.replace(/[^0-9]/g, "");
    if (Number(val) > max) val = String(max);
    setter(val.slice(0, 2));
  };

  const deleteExistingFile = async (attachmentNo) => {
    // ✅ 이미지 삭제도 swalConfirm으로 변경 가능 (선택사항)
    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/product/${productNo}/attachments/${attachmentNo}`, {
        headers: { Authorization: authHeader }
      });
      setExistingFiles(prev => prev.filter(f => f.attachmentNo !== attachmentNo));
    } catch (err) { await swalError("삭제 실패", "이미지 삭제 중 오류가 발생했습니다."); }
  };

  const submit = async (e) => {
    e.preventDefault();

    // ✅ 1. 수정 여부 확인 모달 (예/아니오)
    const isConfirmed = await swalConfirm("수정 확인", "상품 정보를 수정하시겠습니까?");
    if (!isConfirmed) return; // '아니오' 누르면 중단

    const formatISO = (date, ampm, hour, min) => {
      let h = parseInt(hour || 0);
      if (ampm === "오후" && h < 12) h += 12;
      if (ampm === "오전" && h === 12) h = 0;
      return `${date}T${String(h).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}:00`;
    };

    const body = {
      ...form,
      categoryCode: Number(form.categoryCode),
      startTime: formatISO(startDate, startAmPm, startHour, startMin),
      endTime: formatISO(endDate, endAmPm, endHour, endMin),
    };

    try {
      // ✅ 2. 서버 데이터 수정 요청
      await axios.put(`http://localhost:8080/product/${productNo}`, body, { headers: { Authorization: authHeader } });
      
      // 이미지 추가가 있는 경우
      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach(f => fd.append("files", f));
        await axios.post(`http://localhost:8080/product/${productNo}/attachments`, fd, { headers: { Authorization: authHeader } });
      }

      // ✅ 3. 성공 알림 모달 ("수정되었습니다.")
      await swalInfo("수정 완료", "수정되었습니다.");
      
      // ✅ 4. 상세 페이지로 이동 (replace를 통해 히스토리 관리)
      navigate(`/product/detail/${productNo}`, { replace: true });

    } catch (err) { 
      await swalError("수정 실패", "정보 수정 중 오류가 발생했습니다.");
    }
  };

  const styles = {
    container: { maxWidth: "1100px", margin: "40px auto", padding: "0 20px" },
    title: { fontSize: "28px", fontWeight: "bold", borderBottom: "2px solid #333", paddingBottom: "15px", marginBottom: "30px", textAlign: "center" },
    section: { display: "flex", borderTop: "1px solid #ddd", padding: "30px 0" },
    left: { width: "200px", color: "#e63946", fontWeight: "bold", fontSize: "17px" },
    right: { flex: 1 },
    row: { display: "flex", alignItems: "center", marginBottom: "15px" },
    label: { width: "130px", fontSize: "14px", fontWeight: "bold", color: "#555" },
    input: { padding: "8px 10px", border: "1px solid #ccc", outline: "none", fontSize: "14px" },
    timeInput: { width: "50px", textAlign: "center", padding: "8px 5px", border: "1px solid #ccc" },
    path: { marginTop: "12px", padding: "8px", background: "#fff5f5", color: "#e63946", fontSize: "13px", border: "1px solid #ffcccc", fontWeight: "bold" },
    uploadBox: { border: "1px solid #ccc", background: "#f9f9f9", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    fileBtn: { marginTop: "10px", padding: "6px 15px", background: "#fff", border: "1px solid #ccc", cursor: "pointer", fontSize: "13px" },
    thumbWrapper: { width: "130px", height: "100px", position: "relative", border: "1px solid #ddd" },
    closeBtn: { position: "absolute", top: 0, right: 0, background: "#333", color: "#fff", border: "none", width: "20px", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>상품 수정</h2>
      <form onSubmit={submit}>
        {/* 01. 물품정보 */}
        <div style={styles.section}>
          <div style={styles.left}>01. 물품정보</div>
          <div style={styles.right}>
            <div style={styles.row}>
              <div style={styles.label}>물품제목</div>
              <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} style={{ ...styles.input, flex: 1 }} />
            </div>
            <div style={{ ...styles.row, alignItems: "flex-start" }}>
              <div style={styles.label}>카테고리</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select size={7} value={parentCode} onChange={(e) => setParentCode(e.target.value)} style={{ ...styles.input, flex: 1, height: "140px" }}>
                    {parents.map(p => <option key={p.categoryCode} value={p.categoryCode}>{p.name}</option>)}
                  </select>
                  <select size={7} value={childCode} onChange={(e) => setChildCode(e.target.value)} style={{ ...styles.input, flex: 1, height: "140px" }}>
                    {children.map(c => <option key={c.categoryCode} value={c.categoryCode}>{c.name}</option>)}
                  </select>
                </div>
                <div style={styles.path}>선택된 카테고리: {categoryPath}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 02. 경매설정 */}
        <div style={styles.section}>
          <div style={styles.left}>02. 경매설정</div>
          <div style={styles.right}>
            <div style={styles.row}>
              <div style={styles.label}>시작가</div>
              <input type="number" value={form.startPrice} onChange={(e)=>setForm({...form, startPrice: e.target.value})} style={{ ...styles.input, width: "160px" }} /> 원
            </div>
            <div style={styles.row}>
              <div style={styles.label}>즉시구매가</div>
              <input type="number" value={form.instantPrice} onChange={(e)=>setForm({...form, instantPrice: e.target.value})} style={{ ...styles.input, width: "160px" }} /> 원
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

        {/* 03. 상세설명 */}
        <div style={styles.section}>
          <div style={styles.left}>03. 상세설명</div>
          <div style={styles.right}>
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} style={{ ...styles.input, width: "100%", height: "200px", resize: "none" }} />
          </div>
        </div>

        {/* 04. 이미지수정 */}
        <div style={styles.section}>
          <div style={styles.left}>04. 이미지수정</div>
          <div style={styles.right}>
            <div style={{fontWeight:"bold", fontSize:"14px", marginBottom:"10px"}}>등록된 이미지 ({existingFiles.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "30px" }}>
              {existingFiles.map((file) => (
                <div key={file.attachmentNo} style={styles.thumbWrapper}>
                  <img src={`http://localhost:8080/attachment/${file.attachmentNo}`} alt="existing" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => deleteExistingFile(file.attachmentNo)} style={styles.closeBtn}>×</button>
                </div>
              ))}
            </div>
            <div style={{fontWeight:"bold", fontSize:"14px", marginBottom:"10px"}}>이미지 추가 등록</div>
            <div style={styles.uploadBox} onClick={() => fileInputRef.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault(); setNewFiles([...newFiles, ...e.dataTransfer.files])}}>
               <div style={{textAlign:"center", color:"#aaa"}}>📷 업로드할 파일을 여기에 놓거나 클릭하세요.</div>
            </div>
            <button type="button" style={styles.fileBtn} onClick={() => fileInputRef.current.click()}>파일첨부</button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e)=>setNewFiles([...newFiles, ...e.target.files])} style={{ display: "none" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
              {newPreviews.map((p, idx) => (
                <div key={idx} style={{...styles.thumbWrapper, opacity: 0.7}}>
                  <img src={p.url} alt="new-preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => setNewFiles(newFiles.filter((_, i) => i !== idx))} style={styles.closeBtn}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ textAlign: "center", borderTop: "2px solid #333", padding: "40px 0", marginBottom: "80px" }}>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "12px 60px", marginRight: "12px", background: "#fff", border: "1px solid #333", cursor: "pointer", fontWeight: "bold" }}>취소</button>
          <button type="submit" style={{ padding: "12px 80px", background: "#333", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}>수정 저장</button>
        </div>
      </form>
    </div>
  );
}