// write.js
document.addEventListener('DOMContentLoaded', () => {
    const writeForm = document.getElementById('write-form');
    const postContentDiv = document.getElementById('post-content');

    // 이미지 추가 관련 버튼 (수정 없음)
    const addImageUrlBtn = document.getElementById('add-image-url-btn');
    const addImageFileBtn = document.getElementById('add-image-file-btn');
    const imageFileInput = document.getElementById('image-file-input');
    addImageUrlBtn.addEventListener('click', () => { const url = prompt('추가할 이미지의 주소(URL)를 입력하세요:'); if (url) postContentDiv.innerHTML += `<img src="${url}" alt="사용자 이미지" style="max-width: 100%;">`; });
    addImageFileBtn.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => postContentDiv.innerHTML += `<img src="${e.target.result}" alt="업로드된 이미지" style="max-width: 100%;">`; reader.readAsDataURL(file); event.target.value = ''; });

    // 폼 제출 이벤트
    writeForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const submitButton = writeForm.querySelector('button[type="submit"]');
        const title = document.getElementById('post-title').value;
        const author = document.getElementById('post-author').value;
        const content = postContentDiv.innerHTML;
        if (!title.trim() || !content.trim()) { alert('제목과 내용을 모두 입력해주세요.'); return; }

        submitButton.disabled = true;
        submitButton.textContent = '등록 중...';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const thumbnail = tempDiv.querySelector('img')?.src || '';
        const newPost = { id: Date.now(), title, author, tag: '성인', thumbnail, content, liked: false };

        try {
            const response = await fetch('/.netlify/functions/add-post', {
                method: 'POST',
                body: JSON.stringify(newPost)
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || '알 수 없는 서버 오류');
            }
            const result = await response.json();
            alert(result.message);

            // ✅ 성공 시, 그냥 이동하는 대신 ?new=true 신호를 붙여서 이동!
            window.location.href = 'index.html?new=true';

        } catch (error) {
            console.error('글 등록 오류:', error);
            alert(`글 등록 중 오류가 발생했습니다: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = '등록하기';
        }
    });
});
