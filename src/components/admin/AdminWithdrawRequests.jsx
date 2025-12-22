import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";

export default function AdminWithdrawRequests() {
  const [accessToken] = useAtom(accessTokenState);

  const [list, setList] = useState([]);
  const [pageVO, setPageVO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  const [filter, setFilter] = useState("REQUEST");
  const [page, setPage] = useState(1);
  const size = 10;

  const authHeader = useMemo(() => {
    if (!accessToken) return null;
    const t = String(accessToken).trim();
    const auth = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
    return { Authorization: auth };
  }, [accessToken]);

  const withdrawStatusText = (status) => {
    const s = String(status ?? "").toUpperCase();
    if (s === "REQUEST") return "요청 중";
    if (s === "DONE") return "승인";
    if (s === "REJECT") return "거절";
    return status ?? "-";
  };

  const withdrawStatusClass = (status) => {
    const s = String(status ?? "").toUpperCase();
    const base = "badge fw-semibold";
    if (s === "REQUEST") return `${base} text-bg-warning`;
    if (s === "DONE") return `${base} text-bg-success`;
    if (s === "REJECT") return `${base} text-bg-danger`;
    return `${base} text-bg-secondary`;
  };

  const loadWithdrawList = useCallback(
    async (targetPage = 1) => {
      if (!authHeader) return alert("로그인이 필요합니다");

      try {
        setLoading(true);

        const resp = await axios.get("/admin/withdraw", {
          headers: authHeader,
          params: { status: filter, page: targetPage, size },
        });

        setPageVO(resp.data);
        setList(resp.data?.list || []);
        setPage(targetPage);
      } catch (e) {
        console.error(e);
        alert("출금 요청 목록 조회 실패");
      } finally {
        setLoading(false);
      }
    },
    [authHeader, filter]
  );

  useEffect(() => {
    if (authHeader) loadWithdrawList(1);
  }, [authHeader, filter, loadWithdrawList]);

  const changeFilter = (next) => setFilter(next);

  const approve = async (withdrawNo) => {
    if (!authHeader) return alert("로그인이 필요합니다");
    if (!window.confirm("승인 처리할까요?")) return;

    try {
      setActingId(withdrawNo);
      await axios.post(`/admin/withdraw/${withdrawNo}/approve`, null, {
        headers: authHeader,
      });
      await loadWithdrawList(page);
    } catch (e) {
      console.error(e);
      alert("승인 실패");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (withdrawNo) => {
    if (!authHeader) return alert("로그인이 필요합니다");

    const rejectReason = window.prompt("거절 사유를 입력하세요", "");
    if (rejectReason === null) return;
    if (!rejectReason.trim()) return alert("거절 사유를 입력해야 합니다.");

    try {
      setActingId(withdrawNo);
      await axios.post(
        `/admin/withdraw/${withdrawNo}/reject`,
        { rejectReason: rejectReason.trim() },
        { headers: authHeader }
      );
      await loadWithdrawList(page);
    } catch (e) {
      console.error(e);
      alert("거절 실패");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="container-fluid py-1 px-1">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1 fw-bold">출금 요청 관리</h4>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => loadWithdrawList(page)}
          disabled={loading || !authHeader}
        >
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          type="button"
          className={`btn btn-sm ${
            filter === "REQUEST" ? "btn-warning" : "btn-outline-warning"
          }`}
          onClick={() => changeFilter("REQUEST")}
          disabled={loading}
        >
          요청 중
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            filter === "DONE" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={() => changeFilter("DONE")}
          disabled={loading}
        >
          승인
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            filter === "REJECT" ? "btn-danger" : "btn-outline-danger"
          }`}
          onClick={() => changeFilter("REJECT")}
          disabled={loading}
        >
          거절
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm mb-0 align-middle text-nowrap">
            <thead className="table-light">
              <tr>
                <th>신청일</th>
                <th>회원번호</th>
                <th>금액</th>
                <th>은행</th>
                <th>계좌번호</th>
                <th>예금주</th>
                <th>상태</th>
                <th>처리</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-muted p-3">
                    표시할 출금 요청이 없습니다.
                  </td>
                </tr>
              ) : (
                list.map((w) => {
                  const s = String(w.status ?? "").toUpperCase();
                  const disabled = actingId === w.withdrawNo;

                  return (
                    <tr key={w.withdrawNo}>
                      <td>
                        {w.createdTime
                          ? new Date(w.createdTime).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "-"}
                      </td>

                      <td>{w.memberNo ?? "-"}</td>

                      <td className="fw-semibold">
                        {Number(w.amount ?? 0).toLocaleString()}원
                      </td>

                      <td>{w.bankName ?? "-"}</td>
                      <td>{w.accountNumber ?? "-"}</td>
                      <td>{w.accountHolder ?? "-"}</td>

                      <td>
                        <span className={withdrawStatusClass(w.status)}>
                          {withdrawStatusText(w.status)}
                        </span>
                      </td>

                      <td className="text-end">
                        {s === "REQUEST" ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => approve(w.withdrawNo)}
                              disabled={disabled}
                            >
                              승인
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => reject(w.withdrawNo)}
                              disabled={disabled}
                            >
                              거절
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">처리 완료</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {authHeader && pageVO && (
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-1 p-3 border-top">
            <button
              className="btn btn-outline-secondary btn-sm px-2"
              disabled={pageVO.firstBlock || loading}
              onClick={() => loadWithdrawList(pageVO.prevPage)}
            >
              «
            </button>

            <div className="d-flex gap-1">
              {Array.from(
                { length: pageVO.blockFinish - pageVO.blockStart + 1 },
                (_, i) => pageVO.blockStart + i
              ).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${
                    p === page ? "btn-primary" : "btn-outline-primary"
                  }`}
                  disabled={loading}
                  onClick={() => loadWithdrawList(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="btn btn-outline-secondary btn-sm px-2"
              disabled={pageVO.lastBlock || loading}
              onClick={() => loadWithdrawList(pageVO.nextPage)}
            >
              »
            </button>
          </div>
        )}
      </div>

      <div className="text-muted small mt-2">
        * 상태가 <b>요청 중</b> 인 건만 승인/거절 버튼이 활성화됩니다.
      </div>
    </div>
  );
}
