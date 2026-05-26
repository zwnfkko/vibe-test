let n=[{id:1,title:"[공지] 바이브코딩 커뮤니티에 오신 것을 환영합니다!",content:`바이브코딩 커뮤니티에 오신 것을 환영합니다.

이 곳은 바이브코딩 공부·실습 경험을 공유하고 질문을 나누는 공간입니다.

- 공부일지: 학습 내용 기록
- 실습공유: 만든 프로젝트 공유
- 질문/답변: 모르는 것 질문
- 자유토론: 자유롭게 이야기`,category:"notice",author_id:"admin",author_name:"운영자",views:0,likes:0,comment_count:0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}],a=2;const o=async t=>t&&t!=="all"?n.filter(e=>e.category===t):[...n].reverse(),r=async t=>n.find(e=>e.id===t)||null,c=async t=>{{const e={id:a++,...t,views:0,likes:0,comment_count:0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};return n.push(e),e}},d=async(t,e)=>{{const s=n.findIndex(i=>i.id===t);return s<0?null:(n[s]={...n[s],...e,updated_at:new Date().toISOString()},n[s])}},l=async t=>{{const e=n.length;return n=n.filter(s=>s.id!==t),n.length<e}},u=async t=>{{const e=n.find(s=>s.id===t);e&&(e.views+=1);return}},g=async(t,e)=>{{const s=n.find(i=>i.id===t);return s&&(s.likes=(s.likes||0)+1),s?.likes||0}};export{o as a,c,l as d,r as g,u as i,g as t,d as u};
