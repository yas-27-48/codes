import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const memoListEl = document.getElementById('memoList');
const toggleSortBtn = document.getElementById('toggleSortBtn');

let sortOrder = '-created';

// 並び順切り替えボタンの処理
toggleSortBtn.addEventListener('click', () => {
  sortOrder = sortOrder === '-created' ? 'created' : '-created';
  toggleSortBtn.textContent = sortOrder === '-created'
    ? ' 並び順を切り替え（現在：新しい順）'
    : ' 並び順を切り替え（現在：古い順）';
  loadMemoList(sortOrder);
});

// メモ一覧を取得・表示
async function loadMemoList(sortBy = "-created") {
  memoListEl.innerHTML = "<p>読み込み中...</p>";

  try {
    const result = await pb.collection('music_memos').getFullList({ sort: sortBy });

    if (result.length === 0) {
      memoListEl.innerHTML = "<p>まだメモが登録されていません。</p>";
      return;
    }

    memoListEl.innerHTML = '';

    result.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'memo-item';

      const imageUrl = item.image
        ? `${pb.baseUrl}/api/files/music_memos/${item.id}/${item.image}`
        : null;

      const embedHTML = getEmbedPlayerHTML(item.url);

      div.innerHTML = `
        <h2>${item.title}</h2>
        <p><strong>アーティスト:</strong> ${item.artist}</p>
        <p><strong>ジャンル:</strong> ${item.genre}</p>
        ${imageUrl ? `<img src="${imageUrl}" alt="画像">` : ''}
        ${item.comment ? `<p><strong>コメント:</strong> ${item.comment}</p>` : ''}
        ${embedHTML}
        <div class="memo-actions">
          <a class="detail-link" href="detail.html?id=${item.id}">▶ 詳細</a><br>
          <a class="edit-link" href="edit.html?id=${item.id}">✏ 編集</a><br>
          <button class="delete-button" data-id="${item.id}">🗑 削除</button>
        </div>
      `;

      memoListEl.appendChild(div);
    });
  } catch (err) {
    console.error('取得エラー:', err);
    memoListEl.innerHTML = '<p>取得に失敗しました。</p>';
  }
}

// 削除ボタンの処理
memoListEl.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-button')) {
    const id = e.target.dataset.id;
    const ok = confirm('このメモを削除しますか？');
    if (ok) {
      try {
        await pb.collection('music_memos').delete(id);
        alert('削除しました');
        loadMemoList(sortOrder); // 削除後にリロード
      } catch (error) {
        console.error('削除失敗:', error);
        alert('削除に失敗しました');
      }
    }
  }
});

// 🎵 埋め込みプレーヤー生成関数
function getEmbedPlayerHTML(url) {
  if (!url) return '';

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `
      <div class="video-wrapper" style="text-align:center;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          width="300" height="168"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    `;
  }

  const spotifyMatch = url.match(/open\.spotify\.com\/track\/([\w]+)/);
  if (spotifyMatch) {
    const trackId = spotifyMatch[1];
    return `
      <div class="video-wrapper" style="text-align:center;">
        <iframe 
          src="https://open.spotify.com/embed/track/${trackId}" 
          width="300" height="80"
          frameborder="0" 
          allowtransparency="true" 
          allow="encrypted-media"
        ></iframe>
      </div>
    `;
  }

  return `<p><strong>リンク:</strong> <a href="${url}" target="_blank">外部リンクを開く</a></p>`;
}

// 初期表示
window.addEventListener('DOMContentLoaded', () => {
  toggleSortBtn.textContent = ' 並び順を切り替え（現在：新しい順）';
  loadMemoList(sortOrder);
});
