// ===== ✅ 이 부분을 전부 삭제하세요 =====
    const header = document.getElementById('floating-header');
    
    if (document.body.scrollHeight <= window.innerHeight + 50) {
        header.classList.add('visible');
    } else {
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY || currentScrollY <= 50) {
                header.classList.add('visible');
            } else {
                header.classList.remove('visible');
            }
            lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // 페이지 로드 시 즉시 실행하여 헤더 표시
    }
    // =====================================
