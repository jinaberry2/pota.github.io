document.addEventListener('DOMContentLoaded', () => {
    const addImageUrlBtn = document.getElementById('add-image-url-btn');
    const addImageFileBtn = document.getElementById('add-image-file-btn');
    const imageFileInput = document.getElementById('image-file-input');
    const postContentDiv = document.getElementById('post-content');
    const writeForm = document.getElementById('write-form');

    addImageUrlBtn.addEventListener('click', () => {
        const url = prompt('추가할 이미지의 주소(URL)를 입력하세요:');
        if (url) {
            postContentDiv.innerHTML += `<img src="${url}" alt="사용자 이미지" style="max-width: 100%;">`;
        }
    });

    addImageFileBtn.addEventListener('click', () => {
        imageFileInput.click();
    });

    imageFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) { return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            postContentDiv.innerHTML += `<img src="${e.target.result}" alt="업로드된 이미지" style="max-width: 100%;">`;
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    });

    writeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('post-title').value;
        const author = document.getElementById('post-author').value;
        const content = postContentDiv.innerHTML;

        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const firstImage = tempDiv.querySelector('img');
        const thumbnail = firstImage ? firstImage.src : '';

        const posts = JSON.parse(localStorage.getItem('myPosts')) || [];

        const newPost = {
            id: Date.now(),
            title: title,
            author: author,
            tag: '성인',
            thumbnail: thumbnail,
            content: content,
            liked: false
            // likeCount 속성 제거
        };

        posts.push(newPost);
        localStorage.setItem('myPosts', JSON.stringify(posts));

        alert('글이 성공적으로 등록되었습니다!');
        window.location.href = 'index.html';
    });
});
