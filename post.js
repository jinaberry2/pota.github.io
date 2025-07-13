document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const postId = Number(params.get('id'));

    // ===== 문제 해결: '최근' 탭 기록 기능 추가 =====
    function recordRecentView(id) {
        if (!id) return;
        let recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];
        // 기존에 있던 기록은 삭제 (최신으로 올리기 위함)
        recentViews = recentViews.filter(view => view.id !== id);
        // 새로운 기록을 맨 앞에 추가
        recentViews.unshift({ id: id, timestamp: Date.now() });
        // 최근 본 글 목록은 최대 50개까지만 저장
        if (recentViews.length > 50) {
            recentViews = recentViews.slice(0, 50);
        }
        localStorage.setItem('recentViews', JSON.stringify(recentViews));
    }
    recordRecentView(postId);
    // =============================================

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

    // 기본 포스트 내용 채우기
    document.title = post.title;
    document.getElementById('header-title').textContent = post.title;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = `글쓴이: ${post.author}`;
    document.getElementById('post-body').innerHTML = post.content;

    // 상단 바 스크롤 이벤트
    const header = document.getElementById('floating-header');
    let lastScrollY = window.scrollY;
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY < lastScrollY || currentScrollY < 50) {
            header.classList.add('visible');
        } else {
            header.classList.remove('visible');
        }
        lastScrollY = currentScrollY;
    }
    
    if (document.body.scrollHeight <= window.innerHeight + 150) {
        header.classList.add('visible');
    } else {
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }
    
    // 하단 바 버튼
    const likeBtn = document.getElementById('like-btn');
    const prevBtn = document.getElementById('prev-post-btn');
    const nextBtn = document.getElementById('next-post-btn');
    
    // 좋아요 버튼 기능
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
        if(originalIndex > -1) {
            allPosts[originalIndex].liked = post.liked;
            localStorage.setItem('myPosts', JSON.stringify(allPosts));
        }
    });

    // 이전/다음 버튼 기능
    if (isDeletedPost) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        const sortedPosts = allPosts.slice().reverse();
        const currentPostIndex = sortedPosts.findIndex(p => p.id === postId);

        if (currentPostIndex > 0) {
            prevBtn.disabled = false;
            prevBtn.addEventListener('click', () => window.location.href = `post.html?id=${sortedPosts[currentPostIndex - 1].id}`);
        } else {
            prevBtn.disabled = true;
        }

        if (currentPostIndex < sortedPosts.length - 1) {
            nextBtn.disabled = false;
            nextBtn.addEventListener('click', () => window.location.href = `post.html?id=${sortedPosts[currentPostIndex + 1].id}`);
        } else {
            nextBtn.disabled = true;
        }
    }

    updateLikeButton();

    // ===== 문제 해결: 사이드 패널 기능 =====
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

            const itemHtml = `
                <span class="panel-post-number">${purchasedPosts.length - index}</span>
                <span class="panel-post-title">${p.title}</span>
            `;
            itemLink.innerHTML = itemHtml;
            panelPostList.appendChild(itemLink);
        });
    }

    listBtn.addEventListener('click', openSidePanel);
    closePanelBtn.addEventListener('click', closeSidePanel);
    panelOverlay.addEventListener('click', closeSidePanel);
    // =============================================
});
