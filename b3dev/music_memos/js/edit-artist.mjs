import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const urlParams = new URLSearchParams(window.location.search);
const artistId = urlParams.get('id');

if (!artistId) {
  alert("アーティストIDが指定されていません。");
  window.location.href = "artist-list.html";
}

const form = document.getElementById('editArtistForm');
const cancelButton = document.getElementById('cancelButton');
const artistNameDisplay = document.getElementById('artistNameDisplay');
const artistNameInput = document.getElementById('artistName');
const songCheckboxesDiv = document.getElementById('songCheckboxes');

async function loadArtist() {
  try {
    const artist = await pb.collection('artist_lists').getOne(artistId, {
      expand: 'songs',
    });

    artistNameDisplay.textContent = artist.name;
    artistNameInput.value = artist.name;

    const allSongs = await pb.collection('music_memos').getFullList({
      sort: 'title',
    });

    const selectedSongIds = (artist.songs || []).map(song => (
      typeof song === 'string' ? song : song.id
    ));

    allSongs.forEach(song => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '8px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'songs';
      checkbox.value = song.id;
      if (selectedSongIds.includes(song.id)) {
        checkbox.checked = true;
      }

      label.appendChild(checkbox);
      label.append(` ${song.title}`);
      songCheckboxesDiv.appendChild(label);
    });
  } catch (error) {
    console.error(error);
    alert('アーティスト情報の読み込みに失敗しました。');
    window.location.href = "artist-list.html";
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = artistNameInput.value.trim();
  const selectedCheckboxes = document.querySelectorAll('input[name="songs"]:checked');
  const selectedSongIds = Array.from(selectedCheckboxes).map(cb => cb.value);

  if (!name) {
    alert('アーティスト名は必須です。');
    return;
  }

  try {
    await pb.collection('artist_lists').update(artistId, {
      name: name,
      songs: selectedSongIds,
    });
    alert('アーティスト情報を更新しました。');
    window.location.href = 'artist-list.html';
  } catch (error) {
    console.error(error);
    alert('更新に失敗しました。');
  }
});

cancelButton.addEventListener('click', () => {
  window.location.href = 'artist-list.html';
});

window.addEventListener('DOMContentLoaded', loadArtist);
