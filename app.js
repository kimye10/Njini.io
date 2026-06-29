/* =========================================================================
   app.js — 렌더링 로직
   data.js(window.INTRANET_DATA)의 내용을 화면에 그립니다.
   일반적으로 이 파일은 수정할 필요가 없습니다.
   ========================================================================= */
(function () {
  "use strict";

  // 안전한 텍스트 삽입(XSS 방지): innerHTML 대신 textContent 사용을 기본으로 함
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // 패널에 "내용 없음/오류" 상태를 표시
  function showState(container, message) {
    container.setAttribute("aria-busy", "false");
    container.replaceChildren();
    const box = el("li", "state", message);
    container.appendChild(box);
  }

  // 이름 → 이니셜(아바타용). 한글이면 첫 글자, 영문이면 단어 앞글자.
  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (/[가-힣]/.test(name)) return name.trim().slice(0, 1);
    return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }

  // --- 1) 헤더: 오늘 날짜 ---
  function renderDate() {
    const t = document.getElementById("today");
    if (!t) return;
    const now = new Date();
    t.textContent = now.toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });
  }

  // --- 2) 헤더: 로그인 사용자 ---
  // Cloudflare Access는 인증된 사용자의 이메일을 헤더로 전달합니다.
  // 순수 정적 사이트(JS)에서는 헤더를 직접 못 읽으므로, Access의
  // /cdn-cgi/access/get-identity 엔드포인트로 사용자 정보를 조회합니다.
  // (Access가 붙어 있지 않은 로컬/미리보기에서는 조용히 '게스트' 처리)
  async function renderUser() {
    const chip = document.getElementById("user-chip");
    if (!chip) return;
    try {
      const res = await fetch("/cdn-cgi/access/get-identity", { credentials: "include" });
      if (!res.ok) throw new Error("no identity");
      const me = await res.json();
      chip.textContent = me.email || me.name || "사용자";
    } catch (_e) {
      // Access 미적용 환경: 자리만 차지하지 않도록 숨김
      chip.textContent = "게스트 미리보기";
      chip.style.opacity = "0.7";
    }
  }

  // --- 3) 공지사항 ---
  function renderAnnouncements(items) {
    const ul = document.getElementById("announcements");
    if (!ul) return;
    ul.setAttribute("aria-busy", "false");
    if (!Array.isArray(items) || items.length === 0) {
      return showState(ul, "등록된 공지가 없습니다.");
    }
    ul.replaceChildren();
    items.forEach((a) => {
      const li = el("li", "feed__item");
      const top = el("div", "feed__top");
      top.appendChild(el("span", "feed__date", a.date || ""));
      const tagClass = a.tag === "안내" ? "tag tag--info" : "tag";
      top.appendChild(el("span", tagClass, a.tag || "공지"));
      li.appendChild(top);
      li.appendChild(el("p", "feed__title", a.title || ""));
      if (a.body) li.appendChild(el("p", "feed__body", a.body));
      ul.appendChild(li);
    });
  }

  // --- 4) 바로가기 ---
  function renderLinks(links) {
    const nav = document.getElementById("quick-links");
    if (!nav) return;
    if (!Array.isArray(links) || links.length === 0) {
      nav.appendChild(el("div", "state", "등록된 바로가기가 없습니다."));
      return;
    }
    links.forEach((l) => {
      const a = el("a", "link-card");
      a.href = l.url || "#";
      // 내부 시스템이 아닌 외부 링크면 새 탭 + 보안 속성
      if (/^https?:\/\//.test(l.url || "") && !l.url.includes(location.host)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.appendChild(el("span", "link-card__name", l.name || "링크"));
      if (l.desc) a.appendChild(el("span", "link-card__desc", l.desc));
      nav.appendChild(a);
    });
  }

  // --- 5) 구성원 ---
  function renderDirectory(people) {
    const ul = document.getElementById("directory");
    if (!ul) return;
    if (!Array.isArray(people) || people.length === 0) {
      return showState(ul, "등록된 구성원이 없습니다.");
    }
    people.forEach((p) => {
      const li = el("li", "dir-row");
      li.appendChild(el("span", "avatar", initials(p.name)));
      const info = el("div", "dir-info");
      info.appendChild(el("span", "dir-name", p.name || ""));
      info.appendChild(el("span", "dir-meta", p.role || ""));
      li.appendChild(info);
      if (p.ext) li.appendChild(el("span", "dir-ext", "내선 " + p.ext));
      ul.appendChild(li);
    });
  }

  // --- 6) 시스템 현황 ---
  function renderSystems(systems) {
    const ul = document.getElementById("systems");
    if (!ul) return;
    if (!Array.isArray(systems) || systems.length === 0) {
      return showState(ul, "표시할 시스템이 없습니다.");
    }
    const dotClass = { ok: "dot--ok", warn: "dot--warn", down: "dot--down" };
    systems.forEach((s) => {
      const li = el("li", "sys-row");
      li.appendChild(el("span", "dot " + (dotClass[s.status] || "dot--warn")));
      li.appendChild(el("span", "sys-name", s.name || ""));
      li.appendChild(el("span", "sys-status", s.note || ""));
      ul.appendChild(li);
    });
  }

  // --- 부팅 ---
  function boot() {
    const data = window.INTRANET_DATA;
    renderDate();
    renderUser();

    // data.js 로드 실패에 대한 방어 (파일 오타/누락 시 화면이 빈 채로 멈추지 않도록)
    if (!data || typeof data !== "object") {
      const ul = document.getElementById("announcements");
      if (ul) showState(ul, "콘텐츠(data.js)를 불러오지 못했습니다. 파일을 확인해 주세요.");
      return;
    }

    renderAnnouncements(data.announcements);
    renderLinks(data.quickLinks);
    renderDirectory(data.directory);
    renderSystems(data.systems);

    const footer = document.getElementById("footer-note");
    if (footer && data.footerNote) footer.textContent = data.footerNote;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
