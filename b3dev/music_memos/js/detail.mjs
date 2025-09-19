import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");
const id = new URLSearchParams(location.search).get('id');
const detailEl = document.getElementById('detail');

(async () => {
  try {
    const item = await pb.collection('music_memos').getOne(id);

    const imageUrl = item.image
      ? `${pb.baseUrl}/api/files/music_memos/${item.id}/${item.image}`
      : null;

    detailEl.innerHTML = `
      <h2>${item.title}</h2>
      <p><strong>アーティスト:</strong> ${item.artist}</p>
      <p><strong>ジャンル:</strong> ${item.genre}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="画像">` : ''}
      ${item.comment ? `<p><strong>コメント:</strong> ${item.comment}</p>` : ''}
      ${item.url ? `<p><strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>` : ''}
    `;
  } catch (e) {
    detailEl.innerHTML = '<p>読み込みエラー</p>';
  }
})();
