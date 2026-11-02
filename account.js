'use strict';

// Firebase modular browser SDK – a static GitHub Pages site needs no API server.
// Anonymous Authentication is invisible to players: the only requested input is a nickname.
const authOverlay = document.getElementById('playerAuth');
const loginForm = document.getElementById('playerForm');
const loginStatus = document.getElementById('playerStatus');
const playerLabel = document.getElementById('playerName');
const rankingRows = document.getElementById('leaderboardRows');
const rankingMessage = document.getElementById('rankingMessage');
const loginName = document.getElementById('loginName');
const loginButton = loginForm.querySelector('button[type="submit"]');
const leaderboardLimit = 50;

document.body.classList.add('login-required');
authOverlay.hidden = false;

const showLogin = () => {
  authOverlay.hidden = false;
  document.body.classList.add('login-required');
};
const hideLogin = () => {
  authOverlay.hidden = true;
  document.body.classList.remove('login-required');
};
const normalizedName = value => String(value || '').trim().replace(/\s+/g, ' ');
const validName = value => value.length >= 2 && value.length <= 32 &&
  /^[\p{L}\p{N} _.\-]+$/u.test(value);

function showRanking(rows, currentUid) {
  const podium = document.getElementById('rankingPodium');
  rankingRows.replaceChildren();
  podium.replaceChildren();

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'ranking-wait';
    empty.textContent = 'Chưa có thành tích nào. Hãy trở thành người đầu tiên ghi danh!';
    podium.append(empty);
    rankingRows.textContent = 'Bảng thành tích đang chờ các nhà vô địch đầu tiên.';
    return;
  }

  // Podium is displayed silver – gold – bronze, while database ranking remains 1..50.
  for (const rank of [2, 1, 3]) {
    const entry = rows[rank - 1];
    if (!entry) continue;
    const stand = document.createElement('div');
    stand.className = 'ranking-stand place-' + rank;
    if (entry.uid === currentUid) stand.classList.add('is-me');
    const crown = document.createElement('span');
    crown.className = 'ranking-crown';
    crown.textContent = rank === 1 ? '♛' : '✦';
    crown.setAttribute('aria-hidden', 'true');
    const medal = document.createElement('span');
    medal.className = 'ranking-medal';
    medal.textContent = String(rank).padStart(2, '0');
    const name = document.createElement('strong');
    name.className = 'ranking-podium-name';
    name.textContent = entry.name;
    name.title = entry.name;
    const score = document.createElement('span');
    score.className = 'ranking-podium-score';
    score.textContent = entry.bestScore + ' / 5 điểm';
    const duration = document.createElement('small');
    duration.className = 'ranking-podium-time';
    duration.textContent = entry.bestDurationSeconds + ' giây';
    const pedestal = document.createElement('span');
    pedestal.className = 'ranking-pedestal';
    pedestal.textContent = String(rank).padStart(2, '0');
    stand.append(crown, medal, name, score, duration, pedestal);
    podium.append(stand);
  }

  rows.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'ranking-row' + (entry.uid === currentUid ? ' is-me' : '');
    const rank = document.createElement('span');
    rank.textContent = String(index + 1).padStart(2, '0');
    const name = document.createElement('strong');
    name.textContent = entry.name;
    const score = document.createElement('span');
    score.textContent = entry.bestScore + '/5';
    const time = document.createElement('small');
    time.textContent = entry.bestDurationSeconds + ' giây';
    item.append(rank, name, score, time);
    rankingRows.append(item);
  });
}

const gameAccount = {
  ready: false,
  uid: null,
  player: null,
  stopLeaderboard: null,
  async save() {
    throw new Error('Firebase chưa được thiết lập');
  }
};
window.TriviaAccount = gameAccount;

const config = window.TRIVIA_FIREBASE_CONFIG || {};
const missing = ['apiKey', 'authDomain', 'projectId', 'appId']
  .filter(key => typeof config[key] !== 'string' || !config[key].trim());

if (missing.length) {
  loginStatus.textContent = 'Chưa cấu hình Firebase (' + missing.join(', ') +
    '). Xem README-DEPLOY.md để kết nối cơ sở dữ liệu.';
  loginButton.disabled = true;
  rankingRows.textContent = 'Đang chờ cấu hình Firebase.';
} else {
  try {
    // Version from the official Firebase CDN guide; no npm or bundler required.
    const [
      { initializeApp },
      { getAuth, setPersistence, browserLocalPersistence, signInAnonymously, signOut },
      {
        getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit,
        onSnapshot, runTransaction, serverTimestamp
      }
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);

    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    await setPersistence(auth, browserLocalPersistence);


    const getIdentity = async (fresh = false) => {
      // Firebase restores persisted anonymous users asynchronously on page reload.
      await auth.authStateReady();
      if (fresh && auth.currentUser) await signOut(auth);
      if (auth.currentUser && !fresh) return auth.currentUser;
      return (await signInAnonymously(auth)).user;
    };
    const leaderboard = () => {
      if (gameAccount.stopLeaderboard) gameAccount.stopLeaderboard();
      rankingRows.textContent = 'Đang tải bảng xếp hạng trực tuyến…';
      document.getElementById('rankingPodium').textContent = 'Đang đồng bộ thành tích…';
      const listing = query(collection(db, 'players'), orderBy('rankValue', 'desc'), limit(leaderboardLimit));
      gameAccount.stopLeaderboard = onSnapshot(listing, snapshot => {
        const entries = snapshot.docs.map(item => item.data())
          .filter(item => item.gamesPlayed > 0)
          .sort((a, b) => b.rankValue - a.rankValue || a.name.localeCompare(b.name, 'vi'));
        showRanking(entries, gameAccount.uid);
      }, error => {
        rankingRows.textContent = 'Không tải được bảng xếp hạng: ' + error.message;
        document.getElementById('rankingPodium').textContent = 'Không thể tải thành tích lúc này.';
      });
    };
    const enter = player => {
      gameAccount.player = player;
      gameAccount.uid = player.uid;
      gameAccount.ready = true;
      playerLabel.textContent = player.name;
      loginStatus.textContent = '';
      rankingMessage.textContent = 'Bảng xếp hạng được cập nhật trực tiếp giữa các thiết bị.';
      hideLogin();
      leaderboard();
    };

    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (loginButton.disabled) return;
      const name = normalizedName(loginName.value);
      if (!validName(name)) {
        loginStatus.textContent = 'Tên phải có 2–32 ký tự (chữ, số, dấu cách, _, -, .).';
        return;
      }
      loginButton.disabled = true;
      loginStatus.textContent = 'Đang kết nối cơ sở dữ liệu…';
      try {
        let user = await getIdentity();
        let ref = doc(db, 'players', user.uid);
        let existing = await getDoc(ref);
        // Changing nickname creates a new anonymous identity, preserving the old ranking.
        if (existing.exists() && existing.data().name !== name) {
          user = await getIdentity(true);
          ref = doc(db, 'players', user.uid);
          existing = await getDoc(ref);
        }
        if (!existing.exists()) {
          await setDoc(ref, {
            uid: user.uid, name, bestScore: 0, bestDurationSeconds: 300,
            rankValue: 0, gamesPlayed: 0,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp()
          });
        }
        const player = (await getDoc(ref)).data();
        if (!player) throw Error('Không thể tạo hồ sơ người chơi.');

        localStorage.setItem('trivia-last-name', name);
        localStorage.setItem('trivia-session-active', '1');
        enter(player);
      } catch (error) {
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
          loginStatus.textContent = 'Firebase Authentication chưa được thiết lập. Vào Firebase Console → Security → Authentication → Get started (nếu có) → Sign-in method → Anonymous → Enable → Save.';
        } else if (error.code === 'auth/unauthorized-domain') {
          loginStatus.textContent = 'Tên miền chưa được cho phép. Vào Firebase Authentication → Settings → Authorized domains để thêm tên miền đang sử dụng.';
        } else {
          loginStatus.textContent = 'Không thể đăng nhập: ' + error.message;
        }
      } finally {
        loginButton.disabled = false;
      }
    });

    gameAccount.save = async (answers, duration) => {
      if (!gameAccount.ready || !gameAccount.uid || !auth.currentUser ||
          auth.currentUser.uid !== gameAccount.uid) {
        rankingMessage.textContent = 'Chưa đăng nhập nên không thể lưu điểm.';
        return;
      }
      if (!Array.isArray(answers) || answers.length !== 5) return;
      // Answers are original (unshuffled) question indexes, not displayed A/B/C/D.
      const answerKey = [1, 2, 0, 3, 1];
      let score = 0;
      for (let i = 0; i < answerKey.length; i++) {
        if (answers[i] === answerKey[i]) score++;
        else break;
      }
      const seconds = Math.min(300, Math.max(0, Math.round(duration)));
      const playerRef = doc(db, 'players', gameAccount.uid);
      const attemptRef = doc(collection(db, 'attempts'));
      rankingMessage.textContent = 'Đang đồng bộ kết quả…';
      try {
        await runTransaction(db, async tx => {
          const snapshot = await tx.get(playerRef);
          if (!snapshot.exists()) throw Error('Không tìm thấy hồ sơ người chơi.');
          const previous = snapshot.data();
          const improved = score > previous.bestScore ||
            (score === previous.bestScore && seconds < previous.bestDurationSeconds);
          const bestScore = improved ? score : previous.bestScore;
          const bestDuration = improved ? seconds : previous.bestDurationSeconds;
          tx.update(playerRef, {
            bestScore, bestDurationSeconds: bestDuration,
            rankValue: bestScore * 1000 + (300 - bestDuration),
            gamesPlayed: previous.gamesPlayed + 1,
            updatedAt: serverTimestamp()
          });
          tx.set(attemptRef, {
            uid: gameAccount.uid,
            score, durationSeconds: seconds,
            createdAt: serverTimestamp()
          });
        });
        rankingMessage.textContent = '✓ Đã lưu ' + score +
          '/5 điểm lên Firebase. Bảng xếp hạng đồng bộ tự động.';
      } catch (error) {
        rankingMessage.textContent = '⚠ Không lưu được điểm: ' + error.message;
        console.warn('Firebase save result:', error);
      }
    };

    document.getElementById('refreshRanking').addEventListener('click', leaderboard);
    document.getElementById('logoutButton').addEventListener('click', async () => {
      if (gameAccount.stopLeaderboard) {
        gameAccount.stopLeaderboard();
        gameAccount.stopLeaderboard = null;
      }
      gameAccount.ready = false;
      gameAccount.uid = null;
      gameAccount.player = null;
      playerLabel.textContent = 'Chưa đăng nhập';
      localStorage.removeItem('trivia-session-active');
      loginName.value = '';
      loginStatus.textContent = '';
      rankingRows.textContent = 'Đăng nhập để xem bảng xếp hạng.';
      showLogin();
      // Keep auth until next nickname submission so a reload doesn't create needless accounts.

    });
    loginName.value = localStorage.getItem('trivia-last-name') || '';
    if (localStorage.getItem('trivia-session-active') === '1') {
      loginStatus.textContent = 'Đang khôi phục phiên chơi…';
      loginButton.disabled = true;
      try {
        await auth.authStateReady();
        const user = auth.currentUser;
        if (user) {
          const profile = await getDoc(doc(db, 'players', user.uid));
          if (profile.exists()) {
            enter(profile.data());
          } else {
            localStorage.removeItem('trivia-session-active');
            loginStatus.textContent = 'Không tìm thấy hồ sơ. Vui lòng nhập tên để tiếp tục.';
          }
        } else {
          localStorage.removeItem('trivia-session-active');
          loginStatus.textContent = 'Phiên đã hết hạn. Vui lòng nhập tên để tiếp tục.';
        }
      } catch (error) {
        loginStatus.textContent = 'Không khôi phục được phiên: ' + error.message;
      } finally {
        loginButton.disabled = false;
      }
    } else {
      loginStatus.textContent = '';
      loginName.focus({preventScroll: true});
    }
  } catch (error) {
    loginStatus.textContent = 'Không tải được Firebase SDK: ' + error.message;
    loginButton.disabled = true;
    rankingRows.textContent = 'Không kết nối được Firebase.';
  }
}
