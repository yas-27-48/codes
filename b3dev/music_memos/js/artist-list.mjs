import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");
const artistListEl = document.getElementById('artistList');
const toggleSortBtn = document.getElementById('toggleSortBtn');

let sortOrder = '-created';

toggleSortBtn.addEventListener('click', () => {
  sortOrder = sortOrder === '-created' ? 'created' : '-created';
  toggleSortBtn.textContent = sortOrder === '-created'
    ? ' 並び順を切り替え（現在：新しい順）'
    : ' 並び順を切り替え（現在：古い順）';
  loadArtistList();
});

async function loadArtistList() {
  artistListEl.innerHTML = "<p>読み込み中...</p>";

  try {
    // artist_lists から全アーティスト情報を取得（リレーション expand）
    const artists = await pb.collection('artist_lists').getFullList({
      sort: sortOrder,
      expand: 'songs', // ← リレーションの展開
    });

    if (artists.length === 0) {
      artistListEl.innerHTML = "<p>アーティストが登録されていません。</p>";
      return;
    }

    artistListEl.innerHTML = '';

    artists.forEach(artist => {
      const artistName = artist.name || '名前なしアーティスト';

      const artistSection = document.createElement('section');
      artistSection.className = 'artist-section';

      // アーティストタイトルと編集ボタン
      const artistTitleWrapper = document.createElement('div');
      artistTitleWrapper.className = 'artist-title-wrapper';

      const artistTitle = document.createElement('h2');
      artistTitle.textContent = artistName;

      const editBtn = document.createElement('button');
      editBtn.textContent = '編集';
      editBtn.className = 'edit-artist-button';
      editBtn.onclick = () => {
        location.href = `edit-artist.html?id=${artist.id}`;
      };

      artistTitleWrapper.appendChild(artistTitle);
      artistTitleWrapper.appendChild(editBtn);

      artistSection.appendChild(artistTitleWrapper);

      const songs = artist.expand?.songs || [];

      if (songs.length === 0) {
        const p = document.createElement('p');
        p.textContent = '登録されている曲はありません。';
        artistSection.appendChild(p);
      } else {
        const ul = document.createElement('ul');
        ul.className = 'song-list';

        songs.forEach(song => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${song.title}</strong>
            <a href="detail.html?id=${song.id}" class="detail-link">▶ 詳細</a> |
            <a href="edit.html?id=${song.id}" class="edit-link">✏ 編集</a>
          `;
          ul.appendChild(li);
        });

        artistSection.appendChild(ul);
      }

      artistListEl.appendChild(artistSection);
    });

  } catch (error) {
    console.error('取得エラー:', error);
    artistListEl.innerHTML = '<p>データの取得に失敗しました。</p>';
  }
}

window.addEventListener('DOMContentLoaded', loadArtistList);
