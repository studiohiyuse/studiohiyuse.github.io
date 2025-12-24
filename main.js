document.addEventListener("DOMContentLoaded", () => {
  // HTML にフラグを付けて、CSS 側で「JS 有効時だけアニメ」制御
  document.documentElement.classList.add("js-ready");

  // ==============================
  // HERO スライダー（動画対応版）
  // ==============================
  const heroSlides = Array.from(document.querySelectorAll(".hero-bg__slide"));
  let heroIndex = 0;
  const FAST_INTERVAL = 150; // パラパラ速度
  const NORMAL_INTERVAL = 3000; // 以降のゆっくり
  const FAST_DURATION = 1500; // 何秒パラパラさせるか
  let sliderTimer;

  // スライドに含まれる video を制御するヘルパー
  const playSlideVideo = (slide) => {
    const video = slide.querySelector("video");
    if (!video) return;
    try {
      video.currentTime = 0;   // 頭出し
      video.play();            // 再生
    } catch (e) {
      // スマホなどで再生できない場合は黙って無視
      console.warn("Video play error:", e);
    }
  };

  const pauseSlideVideo = (slide) => {
    const video = slide.querySelector("video");
    if (!video) return;
    try {
      video.pause();           // 停止（ループさせない）
    } catch (e) {
      console.warn("Video pause error:", e);
    }
  };

  // スライド切り替え共通処理
  const switchToIndex = (nextIndex) => {
    if (!heroSlides.length) return;

    const currentSlide = heroSlides[heroIndex];
    const nextSlide = heroSlides[nextIndex];

    // いま表示中のスライドの動画を止める
    pauseSlideVideo(currentSlide);

    // クラス付け替え
    currentSlide.classList.remove("is-active");
    nextSlide.classList.add("is-active");

    // 次のスライドの動画を頭から再生
    playSlideVideo(nextSlide);

    heroIndex = nextIndex;
  };

  if (heroSlides.length > 1) {
    // 最初の1枚目（is-active が付いているスライド）の動画を再生
    playSlideVideo(heroSlides[heroIndex]);

    const switchFast = () => {
      const next = (heroIndex + 1) % heroSlides.length;
      switchToIndex(next);
    };

    const switchNormal = () => {
      const next = (heroIndex + 1) % heroSlides.length;
      switchToIndex(next);
    };

    // 最初：パラパラ
    sliderTimer = setInterval(switchFast, FAST_INTERVAL);

    // 一定時間後：ゆっくり
    setTimeout(() => {
      clearInterval(sliderTimer);
      sliderTimer = setInterval(switchNormal, NORMAL_INTERVAL);
    }, FAST_DURATION);
  }

  // ==============================
  // オーバーレイメニュー
  // ==============================
  const navTrigger = document.getElementById("navTrigger");
  const overlayNav = document.getElementById("overlayNav");
  const overlayClose = document.getElementById("overlayClose");

  function openNav() {
    if (!overlayNav) return;
    overlayNav.classList.add("is-open");
    overlayNav.setAttribute("aria-hidden", "false");
  }

  function closeNav() {
    if (!overlayNav) return;
    overlayNav.classList.remove("is-open");
    overlayNav.setAttribute("aria-hidden", "true");
  }

  if (navTrigger) navTrigger.addEventListener("click", openNav);
  if (overlayClose) overlayClose.addEventListener("click", closeNav);

  // メニュー内リンクで自動クローズ
  if (overlayNav) {
    overlayNav.addEventListener("click", (e) => {
      if (e.target.matches(".overlay-nav__list a")) {
        closeNav();
      }
    });
  }

  // ==============================
  // TOP ボタン
  // ==============================
  const toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==============================
  // セクション フェードイン
  // ==============================
  const sections = Array.from(document.querySelectorAll(".section"));

  if (sections.length > 0 && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const index = sections.indexOf(el);

          const baseDelay = 0.2; // 全体のワンテンポ
          const perSection = 0.12; // セクションごとの差
          const cssDelay = baseDelay + perSection * index;

          el.style.transitionDelay = `${cssDelay}s`;

          // 少し遅らせてクラス付与（ファーストビューでもふわっと出るように）
          setTimeout(() => {
            el.classList.add("is-visible");
          }, 50);

          sectionObserver.unobserve(el);
        });
      },
      {
        threshold: 0.25,
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  } else {
    // 古いブラウザ用：全部即表示
    sections.forEach((el) => el.classList.add("is-visible"));
  }

  // ==============================
  // TEAM メンバーポップイン（順番に）
  // ==============================
  const teamGrid = document.querySelector("#team .team-grid");

  if (teamGrid) {
    const members = Array.from(teamGrid.querySelectorAll(".team-member"));

    // 共通：全部表示する関数（保険用）
    const revealAllMembers = () => {
      members.forEach((m) => m.classList.add("is-visible"));
    };

    // PC / タブレットのみ IntersectionObserver で順番ポップイン
    const canUseObserver =
      "IntersectionObserver" in window && window.innerWidth > 768;

    if (canUseObserver) {
      const teamObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            members.forEach((m, i) => {
              const baseDelay = 0.2;
              const perMember = 0.1;
              m.style.transitionDelay = `${baseDelay + perMember * i}s`;
              m.classList.add("is-visible");
            });

            teamObserver.disconnect();
          });
        },
        {
          threshold: 0.3,
        }
      );

      teamObserver.observe(teamGrid);

      // 数秒後に強制表示
      setTimeout(revealAllMembers, 8000);
    } else {
      // スマホ / タブレット：親セクションもメンバーもアニメなしで即表示
      const teamSection = document.getElementById("team");
      if (teamSection) {
        teamSection.classList.add("is-visible");
      }
      revealAllMembers();
    }
  }
});

// ==============================
// HERO フェードアウト
// ==============================
const hero = document.querySelector(".hero");

if (hero) {
  const fadeHeroOnScroll = () => {
    const scrollY = window.scrollY;
    const fadeStart = 0;
    const fadeEnd = window.innerHeight * 0.5; // 画面高さの%で完全に消える

    let opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
    opacity = Math.max(0, Math.min(1, opacity)); // 0〜1に収める

    hero.style.opacity = opacity;
  };

  window.addEventListener("scroll", () => {
    requestAnimationFrame(fadeHeroOnScroll);
  });
}
