/*import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

document.getElementById('musicMemoForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    const tagsRaw = formData.get('tags') || '';
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
  
    const imageFile = formData.get('image');
  
    const musicMemo = {
      title: formData.get('title'),
      artist: formData.get('artist'),
      genre: formData.get('genre'),
      url: formData.get('url'),
      comment: formData.get('comment'),
      tags: tags,
      startTime: Number(formData.get('startTime')) || 0,
      imageFileName: imageFile && imageFile.name ? imageFile.name : null
    };
  
    console.log('保存するデータ:', musicMemo);
  
    alert('メモを保存しました（実際の保存処理は未実装です）');
  
    form.reset();
  }
);*/

/*import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

document.getElementById('musicMemoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const tagsRaw = formData.get('tags') || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);

  const imageFile = formData.get('image');

  // 保存するデータ本体
  const musicMemo = {
    title: formData.get('title'),
    artist: formData.get('artist'),
    genre: formData.get('genre'),
    url: formData.get('url'),
    comment: formData.get('comment'),
    tags: tags,
    startTime: Number(formData.get('startTime')) || 0,
  };

  try {
    // 画像ファイルがあれば files 配列にセット、なければ空配列
    const files = imageFile && imageFile.size > 0 ? [imageFile] : [];

    // PocketBaseに保存（'music_memos' はコレクション名に合わせて変更してください）
    const record = await pb.collection('music_memos').create(musicMemo, files.length ? { files: { image: files } } : undefined);

    alert('メモを保存しました！ID: ' + record.id);
    form.reset();

  } catch (error) {
    console.error('保存エラー:', error);
    alert('保存に失敗しました。コンソールを確認してください。');
  }
});*/

import PocketBase from "https://esm.sh/pocketbase";
const pb = new PocketBase("http://127.0.0.1:8090");

document.getElementById('musicMemoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const title = formData.get('title').trim();
  const artist = formData.get('artist').trim();
  const genre = formData.get('genre');
  const url = formData.get('url');
  const comment = formData.get('comment');
  const tags = (formData.get('tags') || '').split(',').map(t => t.trim()).filter(t => t);
  const startTime = Number(formData.get('startTime')) || 0;
  const imageFile = formData.get('image');

  // ✅ 重複チェック
  try {
    const existing = await pb.collection('music_memos').getFirstListItem(
      `title="${title}" && artist="${artist}"`
    );

    if (existing) {
      alert('この曲はすでに登録されています。');
      return;
    }
  } catch (error) {
    if (error.status !== 404) {
      console.error('重複チェックエラー:', error);
      alert('エラーが発生しました。もう一度お試しください。');
      return;
    }
  }

  // ✅ music_memos に追加
  const musicMemo = {
    title,
    artist,
    genre,
    url,
    comment,
    tags,
    startTime,
  };

  try {
    const files = imageFile && imageFile.size > 0 ? [imageFile] : [];

    const createdMemo = await pb.collection('music_memos').create(
      musicMemo,
      files.length ? { files: { image: files } } : undefined
    );

    // ✅ artist_lists に存在するか確認（なければ作成）
    let artistRecord;
    try {
      artistRecord = await pb.collection('artist_lists').getFirstListItem(`name="${artist}"`);
    } catch (err) {
      if (err.status === 404) {
        // アーティストが存在しないので新規作成
        artistRecord = await pb.collection('artist_lists').create({
          name: artist,
          songs: [createdMemo.id],
        });
      } else {
        throw err;
      }
    }

    // ✅ すでにある場合は songs に追記
    if (artistRecord) {
      const currentSongs = Array.isArray(artistRecord.songs) ? artistRecord.songs : [];
      if (!currentSongs.includes(createdMemo.id)) {
        currentSongs.push(createdMemo.id);
        await pb.collection('artist_lists').update(artistRecord.id, {
          songs: currentSongs,
        });
      }
    }

    alert('メモを保存しました！');
    form.reset();

  } catch (err) {
    console.error('保存エラー:', err);
    alert('保存に失敗しました。');
  }
});
