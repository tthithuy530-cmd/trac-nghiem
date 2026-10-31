/* Three-language interface for the quiz. No third-party dependencies. */
(() => {
'use strict';
const originalQuestions = questions.map(q => ({...q, answers:[...q.answers]}));
const originalRewards = rewards.map(r => ({...r}));
const questionLocales = {
 en: [
  {topic:'TEAM BASICS', sourceSection:'I.1 · Teams and teamwork',question:'What is the minimum number of people needed to form a team?',answers:['1 person','2 people','3 people','5 people'],explanation:'A team consists of at least 2 people working together toward a shared goal.',phone:'One person is not a team. Two or more people—choose B!'},
  {topic:'LISTEN TO TEAMMATES',sourceSection:'I.4 · Core principles of teamwork',question:'What should we do when a teammate is speaking?',answers:['Interrupt immediately','Chat with someone else','Listen and show respect','Walk away'],explanation:'Listening respectfully helps team members understand one another and cooperate.',phone:'Everyone wants to be heard. Choose C: Listen and show respect!'},
  {topic:'SHARE TASKS FAIRLY',sourceSection:'I.4 · Roles and responsibilities; III.1 · Assigning tasks',question:'How should tasks be assigned for effective teamwork?',answers:['Match tasks to each person’s strengths','Give everything to one person','Let everyone do whatever they want','Do not divide the work'],explanation:'Matching tasks to strengths allows everyone to contribute effectively.',phone:'We all have different strengths. Assigning suitable tasks is best—choose A!'},
  {topic:'TAKE RESPONSIBILITY',sourceSection:'I.4 · Commitment and responsibility',question:'What should you do after accepting a team task?',answers:['Wait for someone else to do it','Forget about it','Only do it when reminded','Complete it on time'],explanation:'Finishing your task on time shows responsibility to the entire team.',phone:'When you accept a task, complete it on time. Choose D!'},
  {topic:'SOLVE PROBLEMS TOGETHER',sourceSection:'II.5.3 · Resolving conflicts',question:'What should team members do when opinions differ?',answers:['Argue to win','Discuss calmly and find a solution','Criticize opposing opinions','Refuse to work together'],explanation:'Calm discussion helps resolve differences and keeps the team united.',phone:'Talking calmly helps us find a solution. Choose B!'}
 ],
 ko: [
  {topic:'팀의 개념',sourceSection:'I.1 · 팀의 개념과 팀워크',question:'팀은 최소 몇 명으로 구성될까요?',answers:['1명','2명','3명','5명'],explanation:'팀은 공동의 목표를 향해 협력하는 두 명 이상의 사람으로 구성됩니다.',phone:'한 명으로는 팀이 되지 않아요. 두 명 이상이니 B를 선택하세요!'},
  {topic:'동료의 말 경청하기',sourceSection:'I.4 · 팀워크의 기본 원칙',question:'팀원이 발표하고 있을 때 어떻게 해야 할까요?',answers:['즉시 말을 끊는다','다른 사람과 잡담한다','경청하고 존중한다','자리를 떠난다'],explanation:'경청과 존중은 팀원들이 서로 이해하고 협력하는 데 도움이 됩니다.',phone:'누구나 자신의 말을 들어 주길 바라죠. C, 경청하고 존중하기!'},
  {topic:'적절한 업무 분담',sourceSection:'I.4 · 역할과 책임; III.1 · 업무 분담',question:'효율적인 팀워크를 위해 업무는 어떻게 나눠야 할까요?',answers:['각자의 능력에 맞게 분담한다','한 사람에게 모두 맡긴다','하고 싶은 일만 한다','업무를 나누지 않는다'],explanation:'각자의 강점에 맞게 업무를 배분하면 모두가 역량을 발휘할 수 있습니다.',phone:'사람마다 강점이 달라요. 능력에 맞게 분담하는 A가 정답이에요!'},
  {topic:'책임감 갖기',sourceSection:'I.4 · 책임감과 약속',question:'팀에서 맡은 업무가 있다면 어떻게 해야 할까요?',answers:['다른 사람이 하기를 기다린다','잊어버린다','재촉할 때만 한다','기한 내에 완료한다'],explanation:'기한 내에 업무를 마치는 것은 팀 전체에 대한 책임감을 보여 줍니다.',phone:'맡은 일은 제때 끝내야죠. D를 선택하세요!'},
  {topic:'함께 문제 해결하기',sourceSection:'II.5.3 · 갈등 해결 방법',question:'팀원들의 의견이 다를 때는 어떻게 해야 할까요?',answers:['이기려고 다툰다','차분히 대화하며 해결책을 찾는다','다른 의견을 비난한다','협력을 거부한다'],explanation:'차분히 대화하며 해결책을 찾으면 팀의 화합을 지킬 수 있습니다.',phone:'침착하게 대화하면 해결책을 찾기 쉬워요. B를 선택하세요!'}
 ]
};
const rewardLocales = {
 en:[['A round of applause','The whole audience is cheering for you!'],['A lollipop','A sweet treat for your excellent answer!'],['A bag of snacks','Crunchy happiness! A snack just for you.']],
 ko:[['박수갈채','관객 모두가 여러분에게 박수를 보내고 있어요!'],['막대사탕','멋진 정답에 달콤한 선물을 드려요!'],['과자 한 봉지','바삭한 즐거움! 과자 한 봉지를 선물합니다.']]
};
// Every entry contains the original Vietnamese, an English translation, and a Korean translation.
const phrases = [
 ['Ngôn ngữ','Language','언어'],
 ['AI LÀ TRIỆU PHÚ','WHO WANTS TO BE A MILLIONAIRE','백만장자 퀴즈'],
 ['SÂN KHẤU TRỰC TIẾP','LIVE STAGE','라이브 무대'],
 ['Âm thanh bật','Sound on','소리 켜짐'],['Âm thanh tắt','Sound off','소리 꺼짐'],
 ['TRI THỨC TẠO NÊN TRIỆU PHÚ','KNOWLEDGE MAKES MILLIONAIRES','지식으로 꿈을 이루세요'],
 ['AI LÀ','WHO WANTS TO BE A','누가'],['TRIỆU PHÚ','MILLIONAIRE','백만장자인가'],
 ['Một lựa chọn.','One choice.','한 번의 선택.'],['Một bước tới vinh quang.','One step closer to glory.','영광을 향한 한 걸음.'],
 ['Kỹ năng làm việc nhóm · 5 câu hỏi để khẳng định bản lĩnh của bạn.','Teamwork skills · 5 questions to prove yourself.','팀워크 역량 · 다섯 문제로 실력을 증명하세요.'],
 ['MANG GHẾ NÓNG ĐẾN ĐIỆN THOẠI','PLAY ON YOUR PHONE','휴대폰으로도 즐겨 보세요'],
 ['Quét mã.','Scan the code.','QR 코드를 스캔하고'],['Sẵn sàng tỏa sáng.','Get ready to shine.','빛날 준비를 하세요.'],
 ['Mở camera điện thoại, quét mã QR và chạm vào liên kết để vào chơi ngay.','Open your phone camera, scan the QR code and tap the link to play.','휴대폰 카메라로 QR 코드를 스캔하고 링크를 눌러 바로 시작하세요.'],
 ['Mở trò chơi','Open game','게임 열기'],['Tải mã QR','Download QR','QR 다운로드'],['QUÉT ĐỂ CHƠI','SCAN TO PLAY','스캔하여 플레이'],
 ['THỬ THÁCH 5 CÂU HỎI','5-QUESTION CHALLENGE','5문제 도전'],
 ['PHẦN THƯỞNG','REWARD','보상'],['👏 🍭 🍿 Quà bí mật','👏 🍭 🍿 Mystery prize','👏 🍭 🍿 깜짝 선물'],
 ['BẠN ĐÃ SẴN SÀNG?','ARE YOU READY?','준비됐나요?'],
 ['Chinh phục ghế nóng,','Take the hot seat,','도전의 자리에 앉아'],['đánh thức bản lĩnh triệu phú.','show your champion spirit.','챔피언의 실력을 보여 주세요.'],
 ['Kiến thức','Knowledge','지식'],['Bản lĩnh','Courage','용기'],['Tự tin','Confidence','자신감'],['Chiến thắng','Victory','승리'],
 ['5 câu hỏi · 30 giây mỗi câu · Bạn có thể làm được!','5 questions · 30 seconds each · You can do it!','5문제 · 문제당 30초 · 할 수 있어요!'],
 ['chọn đáp án','select an answer','정답 선택'],['xác nhận','confirm','확인'],
 ['BẮT ĐẦU CHƠI','START GAME','게임 시작'],
 ['HÀNH TRÌNH TRIỆU PHÚ','MILLIONAIRE JOURNEY','백만장자 도전기'],
 ['Năm câu hỏi. Năm cơ hội nhận quà.','Five questions. Five chances to win.','다섯 문제, 다섯 번의 선물 기회.'],
 ['BỘ SƯU TẬP QUÀ','YOUR PRIZE COLLECTION','받은 선물 모음'],['Đang chờ bạn','Waiting for you','당신을 기다려요'],
 ['QUYỀN TRỢ GIÚP','LIFELINES','도움 요청'],
 ['Khán giả','Audience','관객'],['Gọi người thân','Phone a friend','지인에게 전화'],
 ['Mỗi quyền trợ giúp được sử dụng một lần.','Each lifeline can be used once.','도움 요청은 각각 한 번만 사용할 수 있어요.'],
 ['Đáp án cuối cùng của bạn là gì?','Is that your final answer?','최종 답은 무엇인가요?'],
 ['HÃY ĐỂ KIẾN THỨC LÊN TIẾNG.','LET KNOWLEDGE SPEAK.','지식으로 답하세요.'],
 ['SÂN CHƠI KIẾN THỨC','KNOWLEDGE ARENA','지식의 무대'],['PHIÊN BẢN TRẢI NGHIỆM','DEMO EDITION','체험판'],
 ['Trả lời đúng · Quay may mắn · Nhận quà bất ngờ!','Answer right · Spin the wheel · Win a surprise!','정답 맞히기 · 행운의 룰렛 · 깜짝 선물!'],
 ['TIẾP TỤC CHƠI','CONTINUE','계속하기'],['Vòng quay quà tặng','Prize wheel','선물 룰렛'],
 ['Ba phần quà · Cơ hội bằng nhau','Three prizes · Equal chances','세 가지 선물 · 동일한 확률'],
 ['VỖ TAY','APPLAUSE','박수'],['Tỏa sáng bản lĩnh','Show your talent','실력을 뽐내세요'],
 ['KẸO MÚT','LOLLIPOP','막대사탕'],['Ngọt ngào chiến thắng','Sweet victory','달콤한 승리'],
 ['BIM BIM','SNACKS','과자'],['Giòn tan niềm vui','Crunchy delight','바삭한 즐거움'],
 ['KIM ĐANG CHỈ VÀO','POINTER IS ON','화살표가 가리키는 선물'],
 ['Tràng vỗ tay','Applause','박수갈채'],['Một kẹo mút','A lollipop','막대사탕 하나'],['Một gói bim bim','A bag of snacks','과자 한 봉지'],
 ['1 / 3 cơ hội','1 / 3 chance','1 / 3 확률'],
 ['May mắn đang chuyển động…','Luck is spinning…','행운의 룰렛이 돌아가요…'],
 ['Dõi theo kim vàng để xem phần quà nào sẽ gọi tên bạn.','Watch the golden pointer to see which prize you win.','황금 화살표가 어떤 선물을 가리킬지 지켜보세요.'],
 ['ĐANG QUAY…','SPINNING…','돌아가는 중…'],
 ['Mỗi câu đúng được quay một lần. Phần quà có thể trùng nhau.','One spin for each correct answer. Prizes may repeat.','정답 하나당 한 번 돌릴 수 있으며 같은 선물이 나올 수 있어요.'],
 ['Quà ngẫu nhiên','Random prize','무작위 선물'],
 ['CHỐT ĐÁP ÁN','FINAL ANSWER','최종 답 선택'],
 ['THỬ LẠI','TRY AGAIN','다시 도전'],['CHƠI LẠI','PLAY AGAIN','다시 플레이'],
 ['CÂU TIẾP THEO','NEXT QUESTION','다음 문제'],['NHẬN QUÀ CỦA TÔI','CLAIM MY PRIZE','선물 받기'],
 ['Đúng rồi! Quay nhận quà thôi.','Correct! Spin to win a prize.','정답이에요! 룰렛을 돌려 선물을 받으세요.'],
 ['Ba phần quà · Cơ hội bằng nhau · Một bất ngờ dành cho bạn','Three prizes · Equal chances · One surprise for you','세 가지 선물 · 동일한 확률 · 깜짝 선물'],
 ['Phần quà đã gọi tên bạn!','You have won a prize!','선물을 획득했어요!'],
 ['THỜI GIAN ĐÃ KẾT THÚC','TIME IS UP','시간 종료'],
 ['HẸN BẠN Ở THỬ THÁCH TIẾP THEO','SEE YOU AT THE NEXT CHALLENGE','다음 도전에서 만나요'],
 ['Khán giả nói gì?','What does the audience think?','관객의 선택은?'],
 ['Kết nối người thân','Phone a friend','지인에게 전화'],
 ['Kết quả bình chọn mô phỏng từ khán giả tại trường quay.','Simulated voting results from the studio audience.','스튜디오 관객의 모의 투표 결과입니다.'],
 ['Còn','Remaining','남은 시간'],
 ['giây','seconds','초']
];
const byVi = new Map(phrases.map(p => [p[0],p]));
const byAny = new Map();
phrases.forEach(p=>p.forEach(v=>byAny.set(v,p)));
let lang = 'vi';
function translateText(value) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const exact = byAny.get(trimmed);
  if (exact) return value.replace(trimmed,exact[lang==='en'?1:lang==='ko'?2:0]);
  let m;
  const idx = lang === 'en' ? 1 : lang === 'ko' ? 2 : 0;
  const patterns = [
    [/^CÂU HỎI (\d+) \/ (\d+)$/, (_,a,b)=>[_,`QUESTION ${a} / ${b}`,`문제 ${a} / ${b}`][idx]],
    [/^CÂU (\d+) · (.+)$/, (_,n,t)=>idx===1?`QUESTION ${n} · ${t}`:idx===2?`문제 ${n} · ${t}`:_],
    [/^HOÀN THÀNH (\d+) \/ (\d+)$/, (_,a,b)=>idx===1?`COMPLETED ${a} / ${b}`:idx===2?`완료 ${a} / ${b}`:_],
    [/^✦ CHÚC MỪNG NHÀ VÔ ĐỊCH ✦$/,()=>idx===1?'✦ CONGRATULATIONS, CHAMPION ✦':idx===2?'✦ 우승을 축하합니다 ✦':'✦ CHÚC MỪNG NHÀ VÔ ĐỊCH ✦'],
    [/^PHẦN THƯỞNG CÂU (\d+) · ĐÃ MỞ KHÓA$/,(_,n)=>idx===1?`QUESTION ${n} REWARD · UNLOCKED`:idx===2?`문제 ${n} 보상 · 잠금 해제`:_],
    [/^Chọn một đáp án, sau đó nhấn “Chốt đáp án”.$/,()=>idx===1?'Choose an answer, then press “Final answer”.':idx===2?'답을 고른 다음 “최종 답 선택”을 누르세요.':'Chọn một đáp án, sau đó nhấn “Chốt đáp án”.'],
    [/^Bạn chọn ([A-D])\. Đây có phải đáp án cuối cùng của bạn\?$/,(_,a)=>idx===1?`You chose ${a}. Is that your final answer?`:idx===2?`${a}를 선택했어요. 최종 답인가요?`:_],
    [/^Đã chốt đáp án… Cùng chờ kết quả!$/,()=>idx===1?'Answer locked… Awaiting the result!':idx===2?'답을 확정했어요… 결과를 확인해 보세요!':'Đã chốt đáp án… Cùng chờ kết quả!'],
    [/^50:50 đã loại bỏ hai đáp án sai\. Hãy tin vào lựa chọn của bạn!$/,()=>idx===1?'50:50 removed two wrong answers. Trust your choice!':idx===2?'50:50으로 오답 두 개를 제거했어요. 자신 있게 선택하세요!':'50:50 đã loại bỏ hai đáp án sai. Hãy tin vào lựa chọn của bạn!']
  ];
  for (const [re,fn] of patterns) if ((m=trimmed.match(re))) return value.replace(trimmed,fn(...m));
  return value;
}
function walk(node) {
  if (node.nodeType===3) {
    if (!node.parentElement || ['SCRIPT','STYLE','OPTION'].includes(node.parentElement.tagName)) return;
    const value=translateText(node.nodeValue);
    if(value!==node.nodeValue) node.nodeValue=value;
  } else if(node.nodeType===1) {
    if(['SCRIPT','STYLE','SELECT'].includes(node.tagName))return;
    for (const child of [...node.childNodes]) walk(child);
  }
}
function localizedFeedback() {
  const f=document.getElementById('feedback');
  if (!f || lang==='vi')return;
  const q=originalQuestions[current];
  const translated=questions[current];
  let s=f.textContent;
  if(s.startsWith('Chính xác!')) s=lang==='en'?`Correct! ${translated.explanation} The prize wheel is starting…`:`정답이에요! ${translated.explanation} 행운의 룰렛이 시작됩니다…`;
  else if(s.startsWith('Hết giờ!')||s.startsWith('Rất tiếc'))s=(lang==='en'?(s.startsWith('Hết giờ!')?'Time is up! ':'Not quite! '):(s.startsWith('Hết giờ!')?'시간이 끝났어요! ':'아쉽지만 오답이에요! '))+translated.explanation;
  else if(s.startsWith('Bạn nhận được'))s=lang==='en'?'Prize received! Ready for the next question?':'선물을 받았어요! 다음 문제에 도전할 준비가 됐나요?';
  else if(s.startsWith('Xuất sắc!'))s=lang==='en'?'Amazing! You completed all five questions. Congratulations!':'훌륭해요! 다섯 문제를 모두 풀었어요. 축하합니다!';
  if(s!==f.textContent) f.textContent=s;
}
function redraw() {
 const qi=getPresentedQuestion(current);
 const qElement=document.getElementById('question');
 if(phase!=='intro' && qElement) {
   qElement.textContent=qi.question;
   document.querySelectorAll('#answers .answer').forEach((b,i)=>{const span=b.querySelectorAll('span')[1];if(span && qi.answers[i])span.textContent=qi.answers[i]});
 }
 originalQuestions.forEach((_,i)=> {
   const element=document.querySelector(`#step${i+1} small`);
   if(element) element.textContent=questions[i].topic;
   const strong=document.querySelector(`#step${i+1} strong`);
   if(strong && !document.querySelector(`#step${i+1}`).classList.contains('done'))strong.textContent=lang==='en'?'👏 🍭 🍿 Mystery prize':lang==='ko'?'👏 🍭 🍿 깜짝 선물':'👏 🍭 🍿 Quà bí mật';
 });
 if(phase==='playing'||phase==='between'||phase==='rewarding'||phase==='rewarded') {
   const n=document.getElementById('questionNumber');
   if(n&&phase==='playing')n.textContent=lang==='en'?`QUESTION ${String(current+1).padStart(2,'0')} · ${qi.topic}`:lang==='ko'?`문제 ${String(current+1).padStart(2,'0')} · ${qi.topic}`:`CÂU ${String(current+1).padStart(2,'0')} · ${qi.topic}`;
 }
 localizedFeedback();
 document.title=lang==='en'?'Who Wants to Be a Millionaire — Take the Hot Seat':lang==='ko'?'백만장자 퀴즈 — 도전의 자리':'Ai là triệu phú — Ghế nóng đang chờ';
 document.documentElement.lang=lang;
 walk(document.body);
 const labels={vi:'Tiếng Việt',en:'English',ko:'한국어'};
 const currentName=document.getElementById('languageCurrentName');
 if(currentName)currentName.textContent=labels[lang];
 document.querySelectorAll('.language-option').forEach(button=>{
   const active=button.dataset.lang===lang;
   button.classList.toggle('is-selected',active);
   button.setAttribute('aria-checked',String(active));
 });
}
function setLanguage(next) {
 if(!['vi','en','ko'].includes(next))return;
 lang=next;
 questions.forEach((q,i)=>Object.assign(q, next==='vi'?originalQuestions[i]:questionLocales[next][i],{answers:[...(next==='vi'?originalQuestions[i].answers:questionLocales[next][i].answers)]}));
 rewards.forEach((r,i)=>{const names=next==='vi'?[originalRewards[i].name,originalRewards[i].description]:rewardLocales[next][i];r.name=names[0];r.description=names[1]});
 try {localStorage.setItem('quiz-language',lang)}catch(_){}
 redraw();
}
const picker=document.getElementById('languagePicker');
const toggle=document.getElementById('languageToggle');
const menu=document.getElementById('languageMenu');
const choices=[...menu.querySelectorAll('[data-lang]')];
function closePicker(focus=false){menu.hidden=true;picker.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
function openPicker(){menu.hidden=false;picker.classList.add('is-open');toggle.setAttribute('aria-expanded','true');(choices.find(b=>b.dataset.lang===lang)||choices[0]).focus();}
toggle.addEventListener('click',()=>menu.hidden?openPicker():closePicker(true));
choices.forEach((button,i)=>{
 button.addEventListener('click',()=>{setLanguage(button.dataset.lang);closePicker(true)});
 button.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();choices[(i+(event.key==='ArrowDown'?1:choices.length-1))%choices.length].focus()}});
});
document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))closePicker()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closePicker(true)}});
const observer=new MutationObserver(mutations=>{
 observer.disconnect();
 for(const mutation of mutations) {
  if(mutation.type==='characterData')walk(mutation.target);
  else for(const node of mutation.addedNodes)walk(node);
 }
 localizedFeedback();
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
let initial='vi';try{initial=localStorage.getItem('quiz-language')||'vi'}catch(_){}
setLanguage(initial);
})();