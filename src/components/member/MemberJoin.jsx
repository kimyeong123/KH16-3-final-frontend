import { useNavigate } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { FaEye, FaEyeSlash, FaKey, FaMagnifyingGlass, FaSpinner, FaUser } from "react-icons/fa6";
import { FaToggleOff } from "react-icons/fa";
import { FaToggleOn } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa";
import { RiMailSendFill } from "react-icons/ri";
import { FaEraser } from "react-icons/fa";
import { useCallback, useState } from "react";
import axios from "axios";
import { format, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import ko from "date-fns/locale/ko";
import "./flatly-datepicker.css";
import "./Member.css";
import { Modal, Button } from "react-bootstrap";
import { useMemo } from "react";
import { useRef } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

//다음 우편번호 API
import { useDaumPostcodePopup } from "react-daum-postcode";

registerLocale("ko", ko);

export default function MemberJoin() {
  const navigate = useNavigate();
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberPw2: "",
    memberName: "",
    memberNickname: "",
    memberEmail: "",
    memberBirth: "",
    memberContact: "",
    memberPost: "",
    memberAddress1: "",
    memberAddress2: ""
  });

  const [memberClass, setMemberClass] = useState({
    memberId: "",
    memberPw: "",
    memberPw2: "",
    memberName: "",
    memberNickname: "",
    memberEmail: "",
    memberBirth: "",
    memberContact: "",
    memberPost: "",
    memberAddress1: "",
    memberAddress2: ""
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false); // DatePicker 모달 표시 여부
  //인증번호
  const [certNumber, setCertNumber] = useState("");
  const [certNumberClass, setCertNumberClass] = useState("");
  const [certNumberFeedback, setCertNumberFeedback] = useState("");
  const changeCertNumber = useCallback(e => {
    const replacement = e.target.value.replace(/[^0-9]+/g, "");//숫자가 아닌 항목을 제거한 뒤
    setCertNumber(replacement);//설정
  }, []);
  const [showPassword, setShowPassword] = useState(false);


  // 피드백
  const [memberIdFeedback, setMemberIdFeedback] = useState("");
  const [memberPwFeedback, setMemberPwFeedback] = useState("");
  const [memberNameFeedback, setMemberNameFeedback] = useState("");
  const [memberNicknameFeedback, setMemberNicknameFeedback] = useState("");
  const [memberEmailFeedback, setMemberEmailFeedback] = useState("");
  const [memberContactFeedback, setMemberContactFeedback] = useState("");
  const [memberDuplicateFeedback, setMemberDuplicateFeedback] = useState("");
  const [memberBirthFeedback, setMemberBirthFeedback] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthError, setBirthError] = useState("");


  // 문자열 입력 처리
  const changeStrValue = useCallback(e => {
    const { name, value } = e.target;
    setMember(prev => ({ ...prev, [name]: value }));
  }, []);

  // 날짜 입력 처리 (문자열 변환)
  const changeDateValue = useCallback(date => {
    if (!date) {
      setMember(prev => ({ ...prev, memberBirth: "" }));
      setMemberClass(prev => ({ ...prev, memberBirth: "is-invalid" }));
      return;
    }
    const formatted = format(date, "yyyy-MM-dd");
    setMember(prev => ({ ...prev, memberBirth: formatted }));
    setMemberClass(prev => ({ ...prev, memberBirth: "is-valid" }));
  }, []);

  // 아이디
  const checkMemberId = useCallback(async () => {
    const regex = /^(?=.*[0-9])[a-z][a-z0-9]{4,19}$/;
    const valid = regex.test(member.memberId);

    if (!valid) {
      setMemberClass(prev => ({ ...prev, memberId: "is-invalid" }));
      setMemberIdFeedback("아이디는 영문 소문자로 시작하며 숫자를 포함한 5-20자로 작성하세요");
      return;
    }

    try {
      const { data } = await axios.get(`/member/memberId/${member.memberId}`);
      if (data === true) {
        setMemberClass(prev => ({ ...prev, memberId: "is-valid" }));
        setMemberIdFeedback("");
      } else {
        setMemberClass(prev => ({ ...prev, memberId: "is-invalid" }));
        setMemberIdFeedback("이미 사용중인 아이디입니다");
      }
    } catch (err) {
      setMemberClass(prev => ({ ...prev, memberId: "is-invalid" }));
      setMemberIdFeedback("아이디 확인 실패, 잠시 후 다시 시도하세요");
    }
  }, [member.memberId]);

  // 비밀번호
  const checkMemberPw = useCallback(() => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z0-9!@#$]{8,16}$/;
    const valid = regex.test(member.memberPw);
    setMemberClass(prev => ({ ...prev, memberPw: valid ? "is-valid" : "is-invalid" }));

    if (!member.memberPw) {
      setMemberPwFeedback("비밀번호 확인을 해주세요");
      setMemberClass(prev => ({ ...prev, memberPw2: "is-invalid" }));
    } else {
      const match = member.memberPw === member.memberPw2;
      setMemberClass(prev => ({ ...prev, memberPw2: match ? "is-valid" : "is-invalid" }));
      if (!match) setMemberPwFeedback("비밀번호가 일치하지 않습니다");
      else setMemberPwFeedback("");
    }
  }, [member]);

  // 이름
  const checkMemberName = useCallback(() => {
    const regex = /^[가-힣]{2,5}$|^[a-zA-Z]{2,10}$/;
    if (!member.memberName) {
      setMemberClass(prev => ({ ...prev, memberName: "is-invalid" }));
      setMemberNameFeedback("이름을 입력해주세요");
    } else if (regex.test(member.memberName)) {
      setMemberClass(prev => ({ ...prev, memberName: "is-valid" }));
      setMemberNameFeedback("");
    } else {
      setMemberClass(prev => ({ ...prev, memberName: "is-invalid" }));
      setMemberNameFeedback("올바른 이름 형식이 아닙니다");
    }
  }, [member.memberName]);

  // 닉네임
  const checkMemberNickname = useCallback(async () => {
    const regex = /^[가-힣0-9]{2,10}$/;
    if (!member.memberNickname) {
      setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
      setMemberNicknameFeedback("닉네임을 입력해주세요");
      return;
    }
    if (!regex.test(member.memberNickname)) {
      setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
      setMemberNicknameFeedback("닉네임은 한글/숫자 2~10자로 작성하세요");
      return;
    }

    try {
      const { data } = await axios.get(`/member/memberNickname/${member.memberNickname}`);
      if (data === true) {
        setMemberClass(prev => ({ ...prev, memberNickname: "is-valid" }));
        setMemberNicknameFeedback("");
      } else {
        setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
        setMemberNicknameFeedback("이미 사용중인 닉네임입니다");
      }
    } catch (err) {
      setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
      setMemberNicknameFeedback("닉네임 확인 실패, 잠시 후 다시 시도하세요");
    }
  }, [member.memberNickname]);

  // 이메일
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [isEmailCertified, setIsEmailCertified] = useState(false);
  const [sending, setSending] = useState(null); // null, true, false

  // 이메일 유효성 체크
  const checkMemberEmail = useCallback(() => {
    const full = `${emailId.trim()}@${emailDomain.trim()}`;
    const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/;
    const valid = regex.test(full);

    // 인증 완료 시 email 클래스는 유지
    setMember(prev => ({ ...prev, memberEmail: full }));
    setMemberClass(prev => ({
      ...prev,
      memberEmail: isEmailCertified ? "is-valid" : valid ? "is-valid" : "is-invalid"
    }));
    setMemberEmailFeedback(valid ? "" : "올바른 이메일 형식이 아닙니다");
  }, [emailId, emailDomain, isEmailCertified]);

  // 이메일 전송
  const sendCertEmail = useCallback(async () => {
    checkMemberEmail();

    const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;
    const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/;
    const valid = regex.test(fullEmail);
    if (!valid) return;

    // 이메일 관련 초기화 (인증번호 관련 상태는 초기화하지 않음)
    setCertNumber("");
    setCertNumberClass("");
    setCertNumberFeedback("");

    setSending(true);
    try {
      await axios.post("/cert/send", { certEmail: fullEmail });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }, [emailId, emailDomain]);

  // 인증번호 확인
  const sendCertCheck = useCallback(async () => {
    const fullEmail = `${emailId.trim()}@${emailDomain.trim()}`;
    try {
      const response = await axios.post("/cert/check", {
        certEmail: fullEmail,
        certNumber
      });

      if (response.data.result === true) {
        setIsEmailCertified(true);
        setMemberClass(prev => ({ ...prev, memberEmail: "is-valid" }));
        setCertNumberClass("is-valid");
        setCertNumberFeedback("인증번호 확인이 완료되었습니다.");
      } else {
        setCertNumberClass("is-invalid");
        setCertNumberFeedback(response.data.message || "인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("인증번호 확인 통신 오류:", error);
      setCertNumberClass("is-invalid");
      setCertNumberFeedback("서버와 통신 중 오류가 발생했습니다.");
    }
  }, [emailId, emailDomain, certNumber]);

  //주소
  const open = useDaumPostcodePopup("//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");
  const searchAddress = useCallback(() => {
    open({
      onComplete: (data) => {
        let addr = ''; // 주소 변수
        if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }
        //우편번호(data.zonecode), 기본주소(addr)
        setMember(prev => ({
          ...prev,//나머지 항목은 유지시키고
          memberPost: data.zonecode,//우편번호
          memberAddress1: addr,//기본주소
          memberAddress2: "",//상세주소
        }));
        memberAddress2Ref.current.focus();
      }
    });
  }, []);

  //상세주소 입력창을 제어할 ref 생성
  const memberAddress2Ref = useRef();
  //지우기 버튼에 대한 함수
  // 주소 지우기
  const clearMemberAddress = useCallback(() => {
    setMember(prev => ({
      ...prev,
      memberPost: "",
      memberAddress1: "",
      memberAddress2: ""
    }));
    setMemberClass(prev => ({
      ...prev,
      memberPost: "is-invalid",
      memberAddress1: "is-invalid",
      memberAddress2: "is-invalid"
    }));
  }, []);

  //지우기 버튼이 표시되어야 하는지 판정
  const hasAnyCharacter = useMemo(() => {
    if (member.memberPost.length > 0) return true;
    if (member.memberAddress1.length > 0) return true;
    if (member.memberAddress2.length > 0) return true;
  }, [member]);
  // 주소 검사
  const checkMemberAddress = useCallback(() => {
    const { memberPost, memberAddress1, memberAddress2 } = member;
    const fill = memberPost.length > 0 && memberAddress1.length > 0 && memberAddress2.length > 0;
    const empty = memberPost.length === 0 && memberAddress1.length === 0 && memberAddress2.length === 0;
    const valid = fill || empty;

    setMemberClass(prev => ({
      ...prev,
      memberPost: valid ? "is-valid" : "is-invalid",
      memberAddress1: valid ? "is-valid" : "is-invalid",
      memberAddress2: valid ? "is-valid" : "is-invalid"
    }));
  }, [member]);

  // 연락처 (010-XXXX-XXXX)
  const checkMemberContact = useCallback((e) => {
    let value = e.target.value.replace(/\D/g, ''); // 숫자만
    if (value.length >= 3) value = value.slice(0, 3) + '-' + value.slice(3);
    if (value.length >= 8) value = value.slice(0, 8) + '-' + value.slice(8, 12);
    setMember(prev => ({ ...prev, memberContact: value }));

    const regex = /^010-\d{4}-\d{4}$/;
    const valid = regex.test(value);
    setMemberClass(prev => ({ ...prev, memberContact: valid ? "is-valid" : "is-invalid" }));
    setMemberContactFeedback(valid ? "" : "010-XXXX-XXXX 형식으로 입력하세요");
  }, []);
  //생년월일
  const handleDateChange = (date) => {
    setMember({
      ...member,
      memberBirth: format(date, "yyyy-MM-dd")
    });
    setShowDatePickerModal(false);
    checkDuplicate();
  };


  // 중복 체크
  const checkDuplicate = useCallback(async () => {
    if (!member.memberName || !member.memberBirth || !member.memberContact) return;

    try {
      const { data } = await axios.get("/member/checkDuplicate", {
        params: {
          name: member.memberName,
          birth: member.memberBirth,
          contact: member.memberContact
        }
      });

      if (data === true) {
        setMemberDuplicateFeedback("");
        setShowDuplicateModal(false);
      } else {
        setMemberDuplicateFeedback("이미 가입된 정보가 존재합니다");
        setShowDuplicateModal(true);
      }
    } catch (err) {
      setMemberDuplicateFeedback("중복 확인 실패, 잠시 후 다시 시도하세요");
      setShowDuplicateModal(true);
    }
  }, [member]);

  const memberValid = useMemo(() => {
    if (memberClass.memberId !== "is-valid") return false;
    if (memberClass.memberPw !== "is-valid") return false;
    if (memberClass.memberPw2 !== "is-valid") return false;
    if (memberClass.memberNickname !== "is-valid") return false;
    if (memberClass.memberEmail !== "is-valid") return false;
    if (certNumberClass !== "is-valid") return false;

    if (memberClass.memberBirth === "is-invalid") return false;
    if (memberClass.memberContact === "is-invalid") return false;
    if (memberClass.memberPost === "is-invalid") return false;
    if (memberClass.memberAddress1 === "is-invalid") return false;
    if (memberClass.memberAddress2 === "is-invalid") return false;

    return true;
  }, [memberClass]);

  const sendData = useCallback(async () => {
    if (!memberValid) return;

    try {
      await axios.post("http://localhost:8080/member/register", member);
      navigate("/member/joinfinish");
    } catch (err) {
      console.error("회원 가입 실패", err);
    }
  }, [member, memberValid, navigate]);


  return (
    <>
      <Jumbotron subject="회원 가입" detail="가입에 필요한 정보 입력" />

      <div className="member-container mx-auto mt-5 p-4">

        {/* 아이디 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            <div className="d-inline-flex align-items-center">
              아이디
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
            </div>
          </label>
          <div className="col-sm-9">
            <input
              type="text"
              className={`form-control ${memberClass.memberId}`}
              name="memberId"
              value={member.memberId}
              onChange={changeStrValue}
              onBlur={checkMemberId}
            />
            <div className="valid-feedback">사용 가능한 아이디입니다!</div>
            <div className="invalid-feedback">{memberIdFeedback}</div>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            <div className="d-inline-flex align-items-center">
              비밀번호
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
              {showPassword ? <FaToggleOn className="ms-3 fs-4" onClick={() => setShowPassword(false)} />
                : <FaToggleOff className="ms-3 fs-4" onClick={() => setShowPassword(true)} />}</div>
          </label>
          <div className="col-sm-9">
            <input type={showPassword ? "text" : "password"} className={`form-control ${memberClass.memberPw}`}
              name="memberPw" value={member.memberPw}
              onChange={changeStrValue} onBlur={checkMemberPw} />
            <div className="valid-feedback">사용 가능한 비밀번호 형식입니다</div>
            <div className="invalid-feedback">{memberPwFeedback}</div>
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            <div className="d-inline-flex align-items-center">
              비밀번호 확인
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
            </div>


          </label>
          <div className="col-sm-9">
            <input type={showPassword ? "text" : "password"} className={`form-control ${memberClass.memberPw2}`}
              name="memberPw2" value={member.memberPw2}
              onChange={changeStrValue} onBlur={checkMemberPw} />
            <div className="valid-feedback">비밀번호가 일치합니다</div>
            <div className="invalid-feedback">{memberPwFeedback}</div>
          </div>
        </div>

        {/* 이름 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label ">
            <div className="d-inline-flex align-items-center">
              이름
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
            </div>
          </label>
          <div className="col-sm-9">
            <input type="text" className={`form-control ${memberClass.memberName}`}
              name="memberName" value={member.memberName}
              onChange={changeStrValue} onBlur={() => { checkMemberName(); checkDuplicate(); }} />
            <div className="valid-feedback">올바른 이름 형식입니다</div>
            <div className="invalid-feedback">{memberNameFeedback}</div>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            <div className="d-inline-flex align-items-center">
              닉네임
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
            </div>
          </label>
          <div className="col-sm-9">
            <input type="text" className={`form-control ${memberClass.memberNickname}`}
              name="memberNickname" value={member.memberNickname}
              onChange={changeStrValue} onBlur={checkMemberNickname} />
            <div className="valid-feedback">사용 가능한 닉네임입니다</div>
            <div className="invalid-feedback">{memberNicknameFeedback}</div>
          </div>
        </div>
        {/* 이메일 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            <div className="d-inline-flex align-items-center">
              이메일
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="id-tooltip">필수 입력칸입니다.</Tooltip>}
              >
                <span className="ms-2 d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                  <FaExclamationCircle className="text-secondary" />
                </span>
              </OverlayTrigger>
            </div>
          </label>
          <div className="col-sm-9">
            <div className={`input-group ${memberClass.memberEmail}`}>
              <input
                type="text"
                className="form-control"
                placeholder="아이디"
                value={emailId}
                onChange={e => { setEmailId(e.target.value); checkMemberEmail(true); }}
              />
              <span className="input-group-text">@</span>
              <input
                type="text"
                className="form-control"
                placeholder="도메인"
                value={emailDomain}
                onChange={e => { setEmailDomain(e.target.value); checkMemberEmail(true); }}
              />
              <button
                type="button"
                className="btn btn-primary ms-2 d-inline-flex align-items-center"
                onClick={sendCertEmail}
                disabled={sending === true || memberClass.memberEmail === "is-invalid"}
              >
                {sending === true ? (
                  <FaSpinner className="fa-spin custom-spinner" />
                ) : (
                  <RiMailSendFill />
                )}
                <span className="ms-2 d-none d-sm-inline">
                  {sending === true ? "인증번호 발송중"
                    : (sending === false ? "다시 보내기" : "인증번호 보내기")}
                </span>
              </button>
            </div>
            {(sending === false || isEmailCertified) && (
              <div className="col-sm-9 offset-sm-3 d-flex align-items-center flex-wrap text-nowrap mt-3 ms-4">
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control w-auto me-2 ${certNumberClass}`}
                  placeholder="인증번호 입력"
                  value={certNumber}
                  onChange={changeCertNumber}
                  disabled={isEmailCertified} // 완료되면 입력 막기
                />
                <button
                  type="button"
                  className="btn btn-primary ms-2"
                  onClick={sendCertCheck}
                  disabled={isEmailCertified} // 완료되면 버튼 막기
                >
                  <FaKey />
                  <span className="ms-2 d-none d-sm-inline">인증번호 확인</span>
                </button>

                {certNumberClass === "is-valid" && (
                  <div className="valid-feedback d-block ms-2 text-success">
                    인증번호 확인이 완료되었습니다.
                  </div>
                )}

                <div className="invalid-feedback">{certNumberFeedback}</div>
              </div>
            )}

            <div className="invalid-feedback">{memberEmailFeedback}</div>
          </div>
        </div>

        {/* 주소(우편번호, 기본주소, 상세주소) */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">주소</label>
          <div className="col-sm-9 d-flex align-items-center">
            <input
              type="text"
              name="memberPost"
              className={`form-control ${memberClass.memberPost} w-auto`}
              placeholder="우편번호"
              value={member.memberPost}
              readOnly
            />
            <button
              type="button"
              className="btn btn-primary ms-2"
              onClick={searchAddress}
            >
              <FaMagnifyingGlass />
              <span className="ms-2 d-none d-sm-inline">검색</span>
            </button>
            {hasAnyCharacter && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={clearMemberAddress}
              >
                <FaEraser />
                <span className="ms-2 d-none d-sm-inline">지우기</span>
              </button>
            )}
          </div>
          <div className="col-sm-9 offset-sm-3 mt-2">
            <input
              type="text"
              name="memberAddress1"
              className={`form-control ${memberClass.memberAddress1}`}
              placeholder="기본주소"
              value={member.memberAddress1}
              onChange={changeStrValue}
              readOnly
              onClick={searchAddress}
              onBlur={checkMemberAddress}
            />
          </div>
          <div className="col-sm-9 offset-sm-3 mt-2">
            <input
              type="text"
              name="memberAddress2"
              className={`form-control ${memberClass.memberAddress2}`}
              placeholder="상세주소"
              value={member.memberAddress2}
              onChange={changeStrValue}
              ref={memberAddress2Ref}
              onBlur={checkMemberAddress}
            />
            <div className="invalid-feedback">주소는 모두 작성하셔야 합니다</div>
          </div>
        </div>
        {/* 연락처 */}
        <div className="row mt-4">
          <label className="col-sm-3 col-form-label">
            연락처
          </label>
          <div className="col-sm-9">
            <input type="text" inputMode="tel"
              className={`form-control ${memberClass.memberContact}`}
              name="memberContact" value={member.memberContact}
              onChange={changeStrValue}
              onBlur={(e) => {
                checkMemberContact(e);
                checkDuplicate();
              }}
            />
            <div className="invalid-feedback">11자리 숫자로 입력해주세요</div>
          </div>
        </div>

        {/* 생년월일 */}
        <div className="row mt-4 align-items-center">
          <label className="col-sm-3 col-form-label">생년월일</label>
          <div className="col-sm-9 d-flex gap-2">
            <input
              type="text"
              className={`form-control ${memberClass.memberBirth}`}
              placeholder="날짜를 선택해주세요"
              value={member.memberBirth}
              disabled={true}
              onChange={(e) => {
                setMember({ ...member, memberBirth: e.target.value });
              }}
            />
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowDatePickerModal(true)}
            >
              날짜 선택
            </button>
            <Modal show={showDatePickerModal} onHide={() => setShowDatePickerModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>날짜 선택</Modal.Title>
              </Modal.Header>
              <Modal.Body className="d-flex justify-content-center">
                <DatePicker
                  selected={member.memberBirth ? parse(member.memberBirth, "yyyy-MM-dd", new Date()) : null}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  locale="ko"
                  maxDate={new Date()}
                  inline
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDatePickerModal(false)}>
                  취소
                </Button>
                <Button variant="primary" onClick={() => setShowDatePickerModal(false)}>
                  선택 완료
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
      {/* 중복 피드백 modal */}
      <Modal show={showDuplicateModal} onHide={() => setShowDuplicateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>중복 회원가입 경고</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberDuplicateFeedback || "입력하신 정보로 가입된 계정이 이미 있습니다."}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 가입버튼 */}
      <div className="row mt-5">
        <div className="col text-center">
          <button type="button" className="btn btn-lg btn-success"
            disabled={memberValid === false} onClick={sendData}>
            <FaUser className="me-2" />
            <span>{memberValid === true ? "회원 가입하기" : "필수 항목을 작성해주세요"}</span>
          </button>
        </div>
      </div>




    </>
  );
}
