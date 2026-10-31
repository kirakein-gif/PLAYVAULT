(function () {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-fullscreen]')];
  const canvas = document.getElementById('game');
  let busy = false;
  function message(text) {
    document.getElementById('notice').textContent = text;
    document.getElementById('rotation-note').textContent = text;
  }
  function refresh() {
    const active = !!document.fullscreenElement;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '화면 해제' : button.closest('#rotate') ? '가로 전체 화면' : '전체 화면';
    }
  }
  async function toggle() {
    if (busy) return;
    busy = true;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        try { await screen.orientation?.unlock?.(); } catch { /* No lock to release. */ }
      } else if (typeof document.documentElement.requestFullscreen !== 'function' || document.fullscreenEnabled === false) {
        message('전체 화면 미지원: 기기를 가로로 돌리거나 홈 화면에 추가해 실행해 주세요.');
      } else {
        // Called directly by a click, while transient user activation is available.
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        try {
          if (typeof screen.orientation?.lock === 'function') await screen.orientation.lock('landscape');
          else message('전체 화면입니다. 기기를 가로로 돌려 주세요.');
        } catch {
          message('전체 화면입니다. 가로 고정이 지원되지 않으면 기기를 직접 돌려 주세요.');
        }
      }
    } catch {
      message('전체 화면에 들어갈 수 없습니다. 브라우저 설정을 확인하거나 가로로 돌려 주세요.');
    } finally {
      busy = false; refresh();
      if (!matchMedia('(orientation:portrait) and (pointer:coarse)').matches) canvas.focus({ preventScroll: true });
    }
  }
  buttons.forEach(button => {
    let handledTouch = false;
    button.addEventListener('pointerdown', () => { handledTouch = false; });
    button.addEventListener('pointerup', event => {
      if (event.pointerType !== 'touch') return;
      event.preventDefault(); handledTouch = true; toggle();
    });
    button.addEventListener('click', event => {
      // Touch pointerup is a user activation even while another finger holds
      // the joystick. Avoid toggling a second time on its compatibility click.
      if (handledTouch && event.detail !== 0) { handledTouch = false; return; }
      handledTouch = false; toggle();
    });
  });
  document.addEventListener('fullscreenchange', refresh);
  refresh();
})();
