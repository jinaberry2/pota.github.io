document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const postId = Number(params.get('id'));

    // '최근' 탭을 위한 조회 기록
    function recordRecentView(id) {
        if (!id) return;
        let recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];
        recentViews = recentViews.filter(view => view.id !== id);
        recentViews.unshift({ id: id, timestamp: Date.now() });
        if (recentViews.length > 50) {
            recentViews = recentViews.slice(0, 50);
        }
        localStorage.setItem('recentViews', JSON.stringify(recentViews));
    }
    recordRecentView(postId);

    // 포스트 데이터 불러오기
    let allPosts = JSON.parse(localStorage.getItem('myPosts')) || [];
    let deletedPosts = JSON.parse(localStorage.getItem('deletedPosts')) || [];

    let post = allPosts.find(p => p.id === postId);
    let isDeletedPost = false;
    if (!post) {
        post = deletedPosts.find(p => p.id === postId);
        isDeletedPost = true;
    }

    if (!post) {
        document.body.innerHTML = '<h1>글을 찾을 수 없습니다.</h1><a href="index.html">목록으로 돌아가기</a>';
        return;
    }

    // 포스트 내용 채우기
    document.title = post.title;
    document.getElementById('header-title').textContent = post.title;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = `글쓴이: ${post.author}`;
    document.getElementById('post-body').innerHTML = post.content;

    // ===== ✅ 상단 헤더 스크롤 기능 (수정) =====
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
    // =============================================

    // 하단 바 버튼 기능
    const likeBtn = document.getElementById('like-btn');
    const prevBtn = document.getElementById('prev-post-btn');
    const nextBtn = document.getElementById('next-post-btn');

    function updateLikeButton() {
        likeBtn.classList.toggle('active', post.liked);
    }

    likeBtn.addEventListener('click', () => {
        if (isDeletedPost) {
            alert('삭제된 글의 좋아요 상태는 변경할 수 없습니다.');
            return;
        }
        post.liked = !post.liked;
        updateLikeButton();
        const originalIndex = allPosts.findIndex(p => p.id === postId);
        if (originalIndex > -1) {
            allPosts[originalIndex].liked = post.liked;
            localStorage.setItem('myPosts', JSON.stringify(allPosts));
        }
    });

    if (isDeletedPost) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        const sortedPosts = allPosts.slice().reverse();
        const currentPostIndex = sortedPosts.findIndex(p => p.id === postId);

        prevBtn.disabled = currentPostIndex <= 0;
        if (!prevBtn.disabled) {
            prevBtn.addEventListener('click', () => {
                window.location.href = `post.html?id=${sortedPosts[currentPostIndex - 1].id}`;
            });
        }

        nextBtn.disabled = currentPostIndex >= sortedPosts.length - 1;
        if (!nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                window.location.href = `post.html?id=${sortedPosts[currentPostIndex + 1].id}`;
            });
        }
    }

    updateLikeButton();

    // 사이드 패널 기능
    const listBtn = document.getElementById('list-btn');
    const sidePanel = document.getElementById('side-panel');
    const panelOverlay = document.getElementById('side-panel-overlay');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const panelPostList = document.getElementById('panel-post-list');

    function openSidePanel() {
        renderPurchasedList();
        sidePanel.classList.add('visible');
        panelOverlay.classList.add('visible');
    }

    function closeSidePanel() {
        sidePanel.classList.remove('visible');
        panelOverlay.classList.remove('visible');
    }

    function renderPurchasedList() {
        const purchasedPosts = (JSON.parse(localStorage.getItem('myPosts')) || []).slice().reverse();
        panelPostList.innerHTML = '';

        if (purchasedPosts.length === 0) {
            panelPostList.innerHTML = '<p style="padding: 1rem; text-align: center;">구매한 포스트가 없습니다.</p>';
            return;
        }

        purchasedPosts.forEach((p, index) => {
            const itemLink = document.createElement('a');
            itemLink.href = `post.html?id=${p.id}`;
            itemLink.className = 'panel-post-item';
            if (p.id === postId) {
                itemLink.classList.add('active');
            }
            itemLink.innerHTML = `
                <span class="panel-post-number">${purchasedPosts.length - index}</span>
                <span class="panel-post-title">${p.title}</span>
            `;
            panelPostList.appendChild(itemLink);
        });
    }

    listBtn.addEventListener('click', openSidePanel);
    closePanelBtn.addEventListener('click', closeSidePanel);
    panelOverlay.addEventListener('click', closeSidePanel);
});
