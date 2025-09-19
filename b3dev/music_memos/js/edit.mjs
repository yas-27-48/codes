import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");
const id = new URLSearchParams(location.search).get('id');
const form = document.getElementById('editForm');

(async () => {
  const item = await pb.collection('music_memos').getOne(id);

  form.title.value = item.title;
  form.artist.value = item.artist;
  form.genre.value = item.genre;
  form.url.value = item.url;
  form.comment.value = item.comment;
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const updated = {
    title: formData.get('title'),
    artist: formData.get('artist'),
    genre: formData.get('genre'),
    url: formData.get('url'),
    comment: formData.get('comment'),
  };

  await pb.collection('music_memos').update(id, updated);
  alert('更新しました');
  location.href = 'list.html';
});
