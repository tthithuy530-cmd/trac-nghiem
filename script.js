'use strict';

const questions = [
  {
    topic: 'KHÁI NIỆM NHÓM', sourceSection: 'I.1 · Khái niệm nhóm & Làm việc nhóm',
    question: 'Một nhóm làm việc được hình thành từ ít nhất bao nhiêu người?',
    answers: ['1 người', '2 người', '3 người', '5 người'], correct: 1,
    explanation: 'Một nhóm có từ 2 người trở lên, cùng phối hợp để đạt mục tiêu chung.',
    phone: 'Một người thì chưa thành nhóm. Từ 2 người trở lên nhé, mình chọn B!', votes: [3, 90, 5, 2]
  },
  {
    topic: 'LẮNG NGHE ĐỒNG ĐỘI', sourceSection: 'I.4 · Các nguyên tắc cơ bản khi làm việc nhóm',
    question: 'Khi một bạn đang phát biểu, chúng ta nên làm gì?',
    answers: ['Ngắt lời ngay', 'Nói chuyện riêng', 'Lắng nghe và tôn trọng', 'Bỏ đi chỗ khác'], correct: 2,
    explanation: 'Lắng nghe và tôn trọng giúp các thành viên hiểu nhau và phối hợp tốt hơn.',
    phone: 'Ai cũng muốn được lắng nghe khi nói. Hãy chọn C: Lắng nghe và tôn trọng!', votes: [3, 4, 91, 2]
  },
  {
    topic: 'CHIA VIỆC HỢP LÝ', sourceSection: 'I.4 · Vai trò & Trách nhiệm; III.1 · Phân công nhiệm vụ',
    question: 'Để làm việc nhóm hiệu quả, nên chia việc như thế nào?',
    answers: ['Phù hợp với khả năng từng người', 'Giao hết cho một người', 'Ai thích thì làm', 'Không cần chia việc'], correct: 0,
    explanation: 'Chia việc đúng người, đúng việc giúp mỗi thành viên phát huy khả năng của mình.',
    phone: 'Mỗi người có một điểm mạnh. Giao việc phù hợp với khả năng là hợp lý nhất, chọn A nhé!', votes: [89, 4, 5, 2]
  },
  {
    topic: 'CÓ TRÁCH NHIỆM', sourceSection: 'I.4 · Tinh thần cam kết & Trách nhiệm',
    question: 'Khi đã nhận nhiệm vụ trong nhóm, bạn nên làm gì?',
    answers: ['Chờ người khác làm hộ', 'Bỏ quên nhiệm vụ', 'Chỉ làm khi bị nhắc', 'Hoàn thành đúng thời hạn'], correct: 3,
    explanation: 'Hoàn thành nhiệm vụ đúng hạn là cách thể hiện trách nhiệm với cả nhóm.',
    phone: 'Đã nhận việc thì mình cần có trách nhiệm hoàn thành đúng hạn. Chọn D!', votes: [4, 2, 6, 88]
  },
  {
    topic: 'CÙNG NHAU GIẢI QUYẾT', sourceSection: 'II.5.3 · Các cách giải quyết xung đột',
    question: 'Khi có ý kiến khác nhau, các thành viên nên làm gì?',
    answers: ['Cãi nhau để giành phần thắng', 'Bình tĩnh trao đổi để tìm giải pháp', 'Chê bai người có ý kiến khác', 'Từ chối làm việc cùng nhau'], correct: 1,
    explanation: 'Bình tĩnh trao đổi và cùng tìm giải pháp giúp nhóm giải quyết bất đồng mà vẫn giữ tinh thần đoàn kết.',
    phone: 'Cùng bình tĩnh trao đổi sẽ dễ tìm được cách giải quyết hơn. Mình chọn B!', votes: [5, 90, 3, 2]
  }
];
const $ = id => document.getElementById(id);
let phase = 'intro', current = 0, selected = null, seconds = 30, timer = null, revealTimer = null;
let earnedRewards = [], soundEnabled = true, audioContext = null, used = new Set(), expired = new Set(), helpUsedThisQuestion = false, eliminated = [];
const letters = ['A', 'B', 'C', 'D'];
let answerOrders = questions.map(() => [0, 1, 2, 3]);
function newAnswerOrders() {
  answerOrders = questions.map((_, questionIndex) => {
    const previous = answerOrders[questionIndex];
    const order = [0, 1, 2, 3];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // The next play must not show exactly the same A/B/C/D positions.
    if (order.every((value, i) => value === previous[i])) {
      [order[0], order[1]] = [order[1], order[0]];
    }
    return order;
  });
}
function getPresentedQuestion(index) {
  const q = questions[index];
  const order = answerOrders[index];
  const correct = order.indexOf(q.correct);
  const originalLetter = letters[q.correct];
  return {
    ...q,
    answers: order.map(i => q.answers[i]),
    votes: order.map(i => q.votes[i]),
    correct,
    phone: q.phone.replace(new RegExp('\\b' + originalLetter + '\\b', 'g'), letters[correct])
  };
}
function renderJourney() {
  $('journeySteps').replaceChildren(...questions.map((q, index) => {
    const step = document.createElement('div');
    step.id = `step${index + 1}`;
    step.className = `prize-step${index === questions.length - 1 ? ' jackpot' : ''}`;
    step.innerHTML = `<span class="step-index">${String(index + 1).padStart(2, '0')}</span><div><small>${q.topic}</small><strong>👏 🍭 🍿 Quà bí mật</strong></div><span class="step-star">${index === questions.length - 1 ? '♛' : '◆'}</span>`;
    return step;
  }).reverse());
}
const rewards = [
  { icon: '👏', name: 'Một tràng vỗ tay', description: 'Cả khán phòng đang dành những tràng pháo tay cho bạn!' },
  { icon: '🍭', name: 'Một kẹo mút', description: 'Một chút ngọt ngào cho câu trả lời xuất sắc của bạn!' },
  { icon: '🍿', name: 'Một gói bim bim', description: 'Giòn tan niềm vui! Một gói bim bim dành tặng bạn.' }
];
let wheelRotation = 0, spinFrame = null, pendingReward = null;

// Rejection sampling gives all three prizes equal probability without modulo bias.
function randomRewardIndex() {
  const value = new Uint32Array(1);
  do { window.crypto.getRandomValues(value); } while (value[0] === 4294967295);
  return value[0] % rewards.length;
}
function rewardAtPointer(rotation) {
  const angle = ((-rotation % 360) + 360) % 360;
  return Math.floor(angle / 120);
}
function openRewardWheel() {
  phase = 'rewarding'; pendingReward = randomRewardIndex();
  $('rewardConfetti').replaceChildren();
  $('actionButton').disabled = true;
  $('rewardDialog').classList.remove('revealed');
  $('rewardTitle').textContent = 'Đúng rồi! Quay nhận quà thôi.';
  $('rewardSubtitle').textContent = 'Ba phần quà · Cơ hội bằng nhau · Một bất ngờ dành cho bạn';
  $('rewardResultIcon').textContent = '✦';
  $('rewardResultName').textContent = 'May mắn đang chuyển động…';
  $('rewardDescription').textContent = 'Dõi theo kim vàng để xem phần quà nào sẽ gọi tên bạn.';
  $('claimReward').disabled = true; $('claimReward').textContent = 'ĐANG QUAY…';
  $('spinProgress').style.width = '0%';
  $('spinPercent').textContent = '0%';
  $('rewardDialog').showModal();
  const jitter = (Math.random() - .5) * 50;
  const target = (360 - (pendingReward * 120 + 60 + jitter) + 360) % 360;
  const initial = wheelRotation;
  const distance = 360 * 6 + ((target - initial % 360 + 360) % 360);
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1000 : 6500;
  let start = null, lastSector = -1;
  function frame(timestamp) {
    start ??= timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    wheelRotation = initial + distance * eased;
    $('prizeWheel').style.transform = `rotate(${wheelRotation}deg)`;
    const sector = rewardAtPointer(wheelRotation);
    document.querySelectorAll('.reward-chip').forEach((chip, index) => chip.classList.toggle('under-pointer', sector === index));
    $('pointerPreview').textContent = `${rewards[sector].icon} ${rewards[sector].name}`;
    $('spinProgress').style.width = `${Math.round(progress * 100)}%`;
    $('spinPercent').textContent = `${Math.round(progress * 100)}%`;
    if (sector !== lastSector) { tone(1050, 0, .045, 'triangle', .035); lastSector = sector; }
    if (progress < 1) { spinFrame = requestAnimationFrame(frame); return; }
    spinFrame = null;
    finishRewardSpin();
  }
  spinFrame = requestAnimationFrame(frame);
}
function finishRewardSpin() {
  const reward = rewards[pendingReward];
  earnedRewards.push(reward);
  phase = 'rewarded';
  $('rewardDialog').classList.add('revealed');
  $('rewardTitle').textContent = 'Phần quà đã gọi tên bạn!';
  $('rewardSubtitle').textContent = `PHẦN THƯỞNG CÂU ${current + 1} · ĐÃ MỞ KHÓA`;
  $('rewardResultIcon').textContent = reward.icon;
  $('rewardResultName').textContent = reward.name;
  $('rewardDescription').textContent = reward.description;
  $('claimReward').disabled = false; $('claimReward').textContent = 'NHẬN QUÀ CỦA TÔI ✦';
  $(`step${current + 1}`).querySelector('strong').textContent = `${reward.icon} ${reward.name}`;
  $('winnings').textContent = earnedRewards.map(item => item.icon).join('  ');
  $('winnings').setAttribute('aria-label', earnedRewards.map(item => item.name).join(', '));
  playSound('correct'); if (pendingReward === 0) playApplause();
  celebrate(); $('claimReward').focus({ preventScroll: true });
}
function claimReward() {
  if (phase !== 'rewarded') return;
  $('rewardDialog').close();
  const reward = rewards[pendingReward];
  $('actionButton').disabled = false;
  if (current === questions.length - 1) {
    phase = 'won'; $('progress').textContent = `HOÀN THÀNH ${questions.length} / ${questions.length}`;
    $('questionNumber').textContent = '✦ CHÚC MỪNG NHÀ VÔ ĐỊCH ✦';
    feedback(`Xuất sắc! Bạn đã chinh phục cả ${questions.length} câu hỏi. Bộ quà của bạn: ${earnedRewards.map(item => `${item.icon} ${item.name}`).join(' + ')}.`, 'success');
    $('actionButton').innerHTML = 'CHƠI LẠI <span>↻</span>';
  } else {
    phase = 'between'; feedback(`Bạn nhận được ${reward.icon} ${reward.name}! Sẵn sàng chinh phục câu tiếp theo?`, 'success');
    $('actionButton').innerHTML = 'CÂU TIẾP THEO <span>→</span>';
  }
  pendingReward = null;
  $('actionButton').focus({ preventScroll: true });
}
$('claimReward').addEventListener('click', claimReward);
$('rewardDialog').addEventListener('cancel', event => { event.preventDefault(); claimReward(); });

// Web Audio creates the soundtrack locally, including when opened with file://.
function initAudio() {
  try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); if (audioContext.state === 'suspended') audioContext.resume().catch(() => {}); } catch (_) { /* Gameplay remains available without audio support. */ }
}
function tone(frequency, start, duration, type = 'sine', volume = .1) {
  if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + start);
  gain.gain.setValueAtTime(0, audioContext.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + start + .02);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + start + duration);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + start); oscillator.stop(audioContext.currentTime + start + duration + .03);
}
function playSound(kind) {
  initAudio();
  if (kind === 'correct') [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => { tone(n, i * .13, .65, 'triangle', .13); tone(n / 2, i * .13, .65, 'sine', .08); });
  else if (kind === 'wrong') { [220, 196, 146.83, 110].forEach((n, i) => tone(n, i * .18, .45, 'sawtooth', .045)); }
  else if (kind === 'lock') [196, 207.65, 196, 207.65, 261.63].forEach((n, i) => tone(n, i * .2, .2, 'triangle', .08));
  else if (kind === 'start') [261.63, 392, 523.25, 783.99].forEach((n, i) => tone(n, i * .11, .35, 'triangle'));
  else if (kind === 'tick') tone(880, 0, .07, 'sine', .04);
  else tone(660, 0, .1, 'sine', .06);
}
// Layered bursts of filtered noise simulate a crowd clapping without audio files.
function playApplause() {
  if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
  const duration = .13;
  const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const now = audioContext.currentTime + .25;
  for (let i = 0; i < 48; i++) {
    const start = now + i * .065 + Math.random() * .07;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = .8 + Math.random() * .5;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1100 + Math.random() * 1700; filter.Q.value = .7;
    const gain = audioContext.createGain();
    const volume = (.12 + Math.random() * .12) * Math.min(1, (48 - i) / 12);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.linearRampToValueAtTime(volume, start + .004);
    gain.gain.exponentialRampToValueAtTime(.001, start + .12);
    source.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(start); source.stop(start + .16);
  }
}
function feedback(text, type = '') { $('feedback').textContent = text; $('feedback').className = `feedback ${type}`; }
function updateTimer() {
  $('timerText').textContent = seconds;
  $('timer').setAttribute('aria-label', `Còn ${seconds} giây`);
  $('timerRing').style.strokeDashoffset = 106.82 * (1 - seconds / 30);
  $('timer').classList.toggle('urgent', seconds <= 10);
}
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (phase !== 'playing' || $('helpDialog').open) return;
    seconds--; updateTimer();
    if (seconds > 0 && seconds <= 5) playSound('tick');
    if (seconds <= 0) { clearInterval(timer); phase = 'revealing'; selected = null; reveal(true); }
  }, 1000);
}
function updateLifelines() {
  ['fifty', 'audience', 'phone'].forEach(id => {
    $(id).disabled = phase !== 'playing' || used.has(id) || expired.has(id);
    $(id).classList.toggle('used', used.has(id));
    $(id).classList.toggle('expired', expired.has(id));
  });
  $('helpCount').textContent = `${3 - used.size - expired.size}/3`;
}
function renderQuestion() {
  const q = getPresentedQuestion(current); phase = 'playing'; selected = null; seconds = 30; eliminated = [];
  $('progress').textContent = `CÂU HỎI ${current + 1} / ${questions.length}`;
  $('questionNumber').textContent = `CÂU ${String(current + 1).padStart(2, '0')} · ${q.topic}`;
  $('question').textContent = q.question;
  $('questionPrize').textContent = '👏 🍭 🍿 Quà ngẫu nhiên';
  $('answers').replaceChildren(...q.answers.map((answer, index) => {
    const button = document.createElement('button'); button.className = 'answer';
    button.innerHTML = `<span class="letter">${letters[index]}</span><span>${answer}</span><span class="answer-icon" aria-hidden="true"></span>`;
    button.setAttribute('aria-pressed', 'false'); button.addEventListener('click', () => selectAnswer(index)); return button;
  }));
  questions.forEach((_, index) => $(`step${index + 1}`).classList.toggle('active', current === index));
  $('actionButton').innerHTML = 'CHỐT ĐÁP ÁN <span>→</span>'; $('actionButton').disabled = true;
  feedback('Chọn một đáp án, sau đó nhấn “Chốt đáp án”.');
  updateTimer(); updateLifelines(); startTimer();
}
function selectAnswer(index) {
  if (phase !== 'playing' || eliminated.includes(index) || $('helpDialog').open) return;
  selected = index; playSound('select');
  [...$('answers').children].forEach((button, i) => { button.classList.toggle('selected', i === index); button.setAttribute('aria-pressed', String(i === index)); });
  $('actionButton').disabled = false;
  feedback(`Bạn chọn ${letters[index]}. Đây có phải đáp án cuối cùng của bạn?`);
}
function lockAnswer() {
  if (phase !== 'playing' || selected === null) return;
  phase = 'revealing'; clearInterval(timer); updateLifelines();
  [...$('answers').children].forEach(button => { button.disabled = true; });
  $('answers').children[selected].classList.add('locking');
  $('actionButton').disabled = true; feedback('Đã chốt đáp án… Cùng chờ kết quả!'); playSound('lock');
  revealTimer = setTimeout(() => reveal(false), 1600);
}
function reveal(timedOut) {
  const q = getPresentedQuestion(current), correct = selected === q.correct && !timedOut;
  [...$('answers').children].forEach((button, i) => {
    button.disabled = true; button.classList.remove('locking', 'selected');
    if (i === q.correct) { button.classList.add('correct'); button.classList.remove('eliminated'); button.querySelector('.answer-icon').textContent = '✓'; }
    if (i === selected && !correct) { button.classList.add('wrong'); button.querySelector('.answer-icon').textContent = '✕'; }
  });
  updateLifelines(); $('actionButton').disabled = false;
  if (correct) {
    $(`step${current + 1}`).classList.add('done'); $(`step${current + 1}`).querySelector('.step-star').textContent = '✓';
    playSound('correct');
    feedback(`Chính xác! ${q.explanation} Vòng quay may mắn đang bắt đầu…`, 'success');
    openRewardWheel();
  } else {
    phase = 'lost'; playSound('wrong'); $('questionNumber').textContent = timedOut ? 'THỜI GIAN ĐÃ KẾT THÚC' : 'HẸN BẠN Ở THỬ THÁCH TIẾP THEO';
    feedback(`${timedOut ? 'Hết giờ!' : 'Rất tiếc, chưa chính xác!'} ${q.explanation} ${earnedRewards.length ? 'Bạn vẫn giữ được phần quà đã nhận!' : 'Hãy thử lại để mở khóa vòng quay quà tặng nhé!'}`, 'error');
    $('actionButton').innerHTML = 'THỬ LẠI <span>↻</span>';
  }
  if (!correct) $('actionButton').focus({ preventScroll: true });
}
function resetGame() {
  clearInterval(timer); clearTimeout(revealTimer); cancelAnimationFrame(spinFrame); spinFrame = null;
  if ($('rewardDialog').open) $('rewardDialog').close();
  current = 0; earnedRewards = []; pendingReward = null; used.clear(); expired.clear(); helpUsedThisQuestion = false;
  newAnswerOrders();
  $('confetti').replaceChildren(); $('winnings').textContent = 'Đang chờ bạn';
  $('winnings').removeAttribute('aria-label');
  renderJourney();
  playSound('start'); renderQuestion();
}
$('actionButton').addEventListener('click', () => {
  if (phase === 'intro' || phase === 'won' || phase === 'lost') resetGame();
  else if (phase === 'playing') lockAnswer();
  else if (phase === 'between') {
    if (!helpUsedThisQuestion && expired.size < 2) {
      const toExpire = ['fifty', 'audience', 'phone'].find(id => !used.has(id) && !expired.has(id));
      if (toExpire) expired.add(toExpire);
    }
    helpUsedThisQuestion = false;
    current++; playSound('start'); renderQuestion();
  }
});
$('soundButton').addEventListener('click', () => {
  soundEnabled = !soundEnabled; initAudio();
  $('soundButton').innerHTML = `${soundEnabled ? '♫' : '♪'} <span>Âm thanh ${soundEnabled ? 'bật' : 'tắt'}</span>`;
  $('soundButton').setAttribute('aria-label', soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh');
  $('soundButton').setAttribute('aria-pressed', String(soundEnabled));
  if (soundEnabled) playSound('select');
});
function useHelp(id) {
  if (phase !== 'playing' || used.has(id) || expired.has(id)) return;
  helpUsedThisQuestion = true;
  used.add(id); updateLifelines(); playSound('select');
  const q = getPresentedQuestion(current);
  if (id === 'fifty') {
    eliminated = q.answers.map((_, i) => i).filter(i => i !== q.correct).sort(() => Math.random() - .5).slice(0, 2);
    eliminated.forEach(i => { const button = $('answers').children[i]; button.classList.add('eliminated'); button.disabled = true; button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
    if (eliminated.includes(selected)) { selected = null; $('actionButton').disabled = true; }
    feedback('50:50 đã loại bỏ hai đáp án sai. Hãy tin vào lựa chọn của bạn!');
  } else {
    $('helpTitle').textContent = id === 'audience' ? 'Khán giả nói gì?' : 'Kết nối người thân';
    if (id === 'audience') {
      const votes = q.votes.map((v, i) => eliminated.includes(i) ? 0 : v);
      const total = votes.reduce((a, b) => a + b, 0);
      const normalized = votes.map(v => Math.floor(v * 100 / total)); normalized[q.correct] += 100 - normalized.reduce((a, b) => a + b, 0);
      $('helpContent').innerHTML = '<p>Kết quả bình chọn mô phỏng từ khán giả tại trường quay.</p>' + normalized.map((v, i) => `<div class="audience-row"><span>${letters[i]}</span><div class="audience-track"><div class="audience-bar" style="width:${v}%"></div></div><strong>${v}%</strong></div>`).join('');
    } else $('helpContent').innerHTML = `<p>☎ &nbsp; Đã kết nối với người thân (mô phỏng)</p><p>“${q.phone}”</p>`;
    $('helpDialog').showModal();
  }
}
['fifty', 'audience', 'phone'].forEach(id => $(id).addEventListener('click', () => useHelp(id)));
[$('closeDialog'), $('continueButton')].forEach(button => button.addEventListener('click', () => $('helpDialog').close()));
document.addEventListener('keydown', event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || $('helpDialog').open) return;
  const index = letters.indexOf(event.key.toUpperCase());
  if (index !== -1 && phase === 'playing') { event.preventDefault(); selectAnswer(index); }
  if (event.key === 'Enter' && phase === 'playing' && selected !== null) { event.preventDefault(); lockAnswer(); }
});
function celebrate() {
  const colors = ['#f5c76b', '#a69bff', '#3fe5a0', '#f8f2d7', '#76bbff'];
  for (let i = 0; i < 75; i++) {
    const piece = document.createElement('i'); piece.className = 'confetti';
    piece.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * .8}s;animation-duration:${2.3 + Math.random() * 2}s;--drift:${Math.random() * 250 - 125}px;transform:rotate(${Math.random() * 360}deg)`;
    ($('rewardDialog').open ? $('rewardConfetti') : $('confetti')).appendChild(piece); setTimeout(() => piece.remove(), 5500);
  }
}
renderJourney();
for (let i = 0; i < 45; i++) {
  const star = document.createElement('i'); star.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 85}%;animation-delay:-${Math.random() * 5}s;opacity:${Math.random() * .5 + .15}`; $('stars').appendChild(star);
}
