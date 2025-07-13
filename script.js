// script.js
document.addEventListener('DOMContentLoaded', () => {
    let currentTab = 'purchased';
    let searchTerm = '';
    let allPosts = [];
    let pollingInterval; // 주기적으로 확인할 타이머 변수

    const postListContainer = document.getElementById('post-list-container');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('search-input');

    const GITHUB_USER = "jinaberry2";
    const GITHUB_REPO = "jinaberry2.github.io";
    const GITHUB_BRANCH = "main";
    const POSTS_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/posts.json`;

    function getDeletedPosts() { return JSON.parse(localStorage.getItem('deletedPosts')) || []; }
    function saveDeletedPosts(posts) { localStorage.setItem('deletedPosts', JSON.stringify(posts)); }

    function deletePost(postIdToDelete) {
        if (!confirm('정말로 이 포스트를 삭제하시겠습니까?\n(참고: 이 기기의 삭제 목록으로만 이동됩니다.)')) return;
        const postToDelete = allPosts.find(p => p.id === postIdToDelete);
        if (!postToDelete) return;
        const deletedPosts = getDeletedPosts();
        deletedPosts.unshift(postToDelete);
        saveDeletedPosts(deletedPosts);
        alert('이 기기에서 글이 삭제 목록으로 이동되었습니다.');
        renderPosts();
    }

    // 화면에 글 목록을 그려주는 함수 (수정 없음)
    function renderPosts() {
        let postsToRender = [];
        const deletedPosts = getDeletedPosts();
        const localDeletedIds = new Set(deletedPosts.map(p => p.id));
        const purchasedPosts = allPosts.filter(p => !localDeletedIds.has(p.id));

        if (currentTab === 'purchased') { postsToRender = purchasedPosts; }
        else if (currentTab === 'liked') { postsToRender = purchasedPosts.filter(post => post.liked); }
        else if (currentTab === 'recent') {
            const recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];
            const combinedPosts = [...allPosts, ...deletedPosts];
            postsToRender = recentViews.map(view => combinedPosts.find(p => p.id === view.id)).filter(Boolean);
        } else if (currentTab === 'deleted') { postsToRender = deletedPosts; }

        if (searchTerm) {
            postsToRender = postsToRender.filter(p => p.title.toLowerCase().includes(searchTerm) || p.author.toLowerCase().includes(searchTerm));
        }

        postListContainer.innerHTML = '';
        const sortedPosts = (currentTab === 'purchased') ? postsToRender.slice().reverse() : postsToRender;

        if (sortedPosts.length === 0) {
            postListContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">표시할 글이 없습니다.</p>';
            return;
        }

        sortedPosts.forEach(post => {
            const linkElement = document.createElement('a');
            linkElement.href = `post.html?id=${post.id}`;
            linkElement.className = 'post-item-link';
            const thumbnailHTML = post.thumbnail ? `<img src="${post.thumbnail}" alt="썸네일" class="thumbnail">` : '';
            const deleteButtonHTML = currentTab !== 'deleted' ? `<button class="delete-btn" data-id="${post.id}">&times;</button>` : '';
            linkElement.innerHTML = `
                <div class="post-item">
                    <div class="thumbnail-container">${thumbnailHTML}</div>
                    <div class="post-info">
                        <h3>${post.title}</h3>
                        <p>${post.author} · 영구 열람</p>
                        ${post.tag ? `<span class="tag">${post.tag}</span>` : ''}
                    </div>
                    ${deleteButtonHTML}
                </div>`;
            if (currentTab !== 'deleted') {
                linkElement.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    deletePost(Number(e.currentTarget.dataset.id));
                });
            }
            postListContainer.appendChild(linkElement);
        });
    }

    // 데이터를 불러오고 화면을 그리는 함수
    async function loadAndRenderPosts() {
        try {
            const response = await fetch(`${POSTS_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('데이터 파일을 찾을 수 없습니다.');
            const data = await response.json();

            // ✅ 새로 불러온 글의 개수가 기존보다 많아졌다면, 타이머를 멈추고 화면을 새로 그림
            if (data.length > allPosts.length) {
                console.log("새로운 글 발견! 목록을 업데이트합니다.");
                clearInterval(pollingInterval); // 타이머 중지
                allPosts = data;
                renderPosts();
            } else if (allPosts.length === 0) {
                // 첫 로딩 시에는 무조건 그림
                allPosts = data;
                renderPosts();
            }
        } catch (error) {
            console.error('포스트 로딩 실패:', error);
            postListContainer.innerHTML = '<p style="text-align:center; color:red;">글 목록을 불러오는 데 실패했습니다.</p>';
            clearInterval(pollingInterval); // 오류 발생 시에도 타이머 중지
        }
    }

    // --- 이벤트 리스너 설정 (수정 없음) ---
    tabButtons.forEach(button => { /* ... 이전과 동일 ... */ });
    searchInput.addEventListener('input', (e) => { /* ... 이전과 동일 ... */ });

    // --- 최종 실행 로직 ---
    postListContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">글 목록을 불러오는 중...</p>';

    // ✅ 페이지 주소에 ?new=true 신호가 있는지 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('new')) {
        console.log("새로운 글이 등록되었습니다. 업데이트를 확인합니다...");
        // 2초 간격으로 최대 10번(20초)까지 최신 글 목록을 계속 확인
        let attempts = 0;
        pollingInterval = setInterval(() => {
            attempts++;
            console.log(`업데이트 확인 중... (${attempts}번째)`);
            loadAndRenderPosts();
            if (attempts >= 10) {
                clearInterval(pollingInterval);
                console.log("업데이트 확인을 중단합니다.");
            }
        }, 2000);
    }

    // 처음 페이지를 열었을 때 한번은 무조건 글 목록을 불러옴
    loadAndRenderPosts();
});
