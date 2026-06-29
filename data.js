/* =========================================================================
   data.js — 인트라넷 "내용" 파일
   ⚠️ 비개발자(콘텐츠 담당)는 이 파일만 수정하면 됩니다.
   수정 → GitHub에 저장(commit) → Cloudflare가 자동으로 재배포합니다.

   날짜는 "YYYY-MM-DD" 형식으로 적어주세요.
   tag 값은 "공지" | "안내" 중 하나(색상이 달라집니다).
   ========================================================================= */

window.INTRANET_DATA = {
  /* ----- 공지사항 (최신순으로 위에 추가) ----- */
  announcements: [
    {
      date: "2026-06-29",
      tag: "공지",
      title: "본 인트라넷 시범 운영 시작",
      body: "사내 공지·바로가기·구성원 정보를 한곳에서 확인하세요. 개선 의견은 IT 담당자에게 전달 바랍니다.",
    },
    {
      date: "2026-06-24",
      tag: "안내",
      title: "ISNetworld 보험 변경분 업로드 마감",
      body: "Kia Georgia 협력사 자격 갱신 관련 서류는 이번 주 금요일까지 업로드 부탁드립니다.",
    },
    {
      date: "2026-06-18",
      tag: "안내",
      title: "NAS 정기 점검 안내",
      body: "매월 셋째 주 토요일 오전 9–11시 사내 NAS 점검이 진행됩니다. 해당 시간 접속이 제한될 수 있습니다.",
    },
  ],

  /* ----- 바로가기 (사내 시스템/도구 링크) ----- */
  /* url 은 실제 내부 주소로 교체하세요. 예: https://cnyengineering.synology.me */
  quickLinks: [
    { name: "사내 NAS", desc: "문서·도면 저장소", url: "#" },
    { name: "사내 전화(PBX)", desc: "Grandstream UCM", url: "#" },
    { name: "프로젝트 드라이브", desc: "Google Workspace", url: "#" },
    { name: "ISNetworld", desc: "협력사 자격 관리", url: "#" },
    { name: "근태 관리", desc: "출퇴근 기록", url: "#" },
    { name: "HR · 양식함", desc: "휴가/경비 신청서", url: "#" },
  ],

  /* ----- 구성원 디렉터리 ----- */
  directory: [
    { name: "Sarah Kim", role: "Project Manager", ext: "101", email: "#" },
    { name: "구성원 2", role: "Structural Engineer", ext: "102", email: "#" },
    { name: "구성원 3", role: "MEP Engineer", ext: "103", email: "#" },
    { name: "구성원 4", role: "Administration", ext: "104", email: "#" },
  ],

  /* ----- 시스템 현황 (status: "ok" | "warn" | "down") ----- */
  /* 지금은 수동 표시입니다. 자동 모니터링은 README의 "다음 단계" 참고. */
  systems: [
    { name: "사내 NAS",        status: "ok",   note: "정상" },
    { name: "네트워크(Omada)", status: "ok",   note: "정상" },
    { name: "PBX 전화",        status: "ok",   note: "정상" },
    { name: "외부 원격접속",    status: "warn", note: "WebDAV 포트포워딩 대기" },
  ],

  /* ----- 푸터 문구 ----- */
  footerNote: "C&Y Engineering, LLC · 사내 전용 · 문의: IT 담당자",
};
