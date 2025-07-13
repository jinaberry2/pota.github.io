// post.js
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const postId = Number(params.get('id'));

    // =================================================================
    // ✅ 아래 정보를 본인의 정보로 정확하게 수정해주세요!
    // =================================================================
    const GITHUB_USER = "jinaberry2";
    const GITHUB_REPO = "jinaberry2.github.io";
    const GITHUB_BRANCH = "main";
    // =================================================================

    const POSTS_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/posts.json`;

    function recordRecentView(id) {
        if (!id) return;
        let recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];
        recentViews = recentViews.filter(view => view.id !== id);
        recentViews.unshift({ id, timestamp: Date.now() });
        if (recentViews.length > 50) recentViews = recentViews.slice(0, 50);
        localStorage.setItem('recentViews', JSON.stringify(recentViews));
    }
    recordRecentView(postId);
    
    function renderPost(post, allPosts) {
        document.title = post.title;
        document.getElementById('header-title').textContent = post.title;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-author').textContent = `글쓴이: ${post.author}`;
        document.getElementById('post-body').innerHTML = post.content;
        
        const isDeletedPost = (JSON.parse(localStorage.getItem('deletedPosts')) || []).some(p => p.id === post.id);
        setupButtons(post, allPosts, isDeletedPost);
        setupSidePanel(post, allPosts);
    }

    function setupButtons(post, allPosts, isDeletedPost) {
        const likeBtn = document.getElementById('like-btn');
        const prevBtn = document.getElementById('prev-post-btn');
        const nextBtn = document.getElementById('next-post-btn');

        likeBtn.classList.toggle('active', post.liked);
        likeBtn.onclick = () => alert('GitHub 연동 모드에서는 좋아요 상태를 변경할 수 없습니다.');

        if (isDeletedPost) {
            prevBtn.disabled = true; nextBtn.disabled = true;
        } else {
            const sortedPosts = allPosts.filter(p => !(JSON.parse(localStorage.getItem('deletedPosts')) || []).some(dp => dp.id === p.id)).slice().reverse();
            const currentPostIndex = sortedPosts.findIndex(p => p.id === postId);
            
            prevBtn.disabled = currentPostIndex <= 0;
            if (!prevBtn.disabled) prevBtn.onclick = () => window.location.href = `post.html?id=${sortedPosts[currentPostIndex - 1].id}`;
            
            nextBtn.disabled = currentPostIndex >= sortedPosts.length - 1;
            if (!nextBtn.disabled) nextBtn.onclick = () => window.location.href = `post.html?id=${sortedPosts[currentPostIndex + 1].id}`;
        }
    }

    function setupSidePanel(currentPost, allPosts) {
        const listBtn = document.getElementById('list-btn');
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        const closePanelBtn = document.getElementById('close-panel-btn');
        const panelPostList = document.getElementById('panel-post-list');

        function openSidePanel() {
            const deletedIds = new Set((JSON.parse(localStorage.getItem('deletedPosts')) || []).map(p => p.id));
            const purchasedPosts = allPosts.filter(p => !deletedIds.has(p.id)).slice().reverse();
            panelPostList.innerHTML = '';
            purchasedPosts.forEach((p, index) => {
                const itemLink = document.createElement('a');
                itemLink.href = `post.html?id=${p.id}`;
                itemLink.className = 'panel-post-item';
                if (p.id === currentPost.id) itemLink.classList.add('active');
                itemLink.innerHTML = `<span class="panel-post-number">${purchasedPosts.length - index}</span><span class="panel-post-title">${p.title}</span>`;
                panelPostList.appendChild(itemLink);
            });
            sidePanel.classList.add('visible');
            panelOverlay.classList.add('visible');
        }
        
        listBtn.addEventListener('click', openSidePanel);
        closePanelBtn.addEventListener('click', () => { sidePanel.classList.remove('visible'); panelOverlay.classList.remove('visible'); });
        panelOverlay.addEventListener('click', () => { sidePanel.classList.remove('visible'); panelOverlay.classList.remove('visible'); });
    }
    
    fetch(`${POSTS_URL}?t=${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) throw new Error('데이터 파일을 찾을 수 없습니다.');
            return response.json();
        })
        .then(allPostsData => {
            let post = allPostsData.find(p => p.id === postId);
            if (!post) {
                const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts')) || [];
                post = deletedPosts.find(p => p.id === postId);
            }
            if (post) renderPost(post, allPostsData);
            else document.body.innerHTML = '<h1>글을 찾을 수 없습니다.</h1><a href="index.html">목록으로 돌아가기</a>';
        })
        .catch(error => {
            console.error('포스트 로딩 실패:', error);
            document.body.innerHTML = '<h1>글을 불러오는 중 오류가 발생했습니다.</h1><a href="index.html">목록으로 돌아가기</a>';
        });
});
