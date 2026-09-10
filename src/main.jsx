import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const ACCESS = import.meta.env.VITE_SITE_ACCESS_PASSWORD || "";

const icon = { dashboard:"⌂", chapters:"☷", characters:"♙", world:"◈", timeline:"◷", notes:"✎", canon:"◆", ai:"✦", admin:"♛" };
const moduleNames = { characters:"Nhân vật", world:"Thế giới", timeline:"Dòng thời gian", notes:"Hộp thư đến", canon:"Canon" };

function Gate({ onPass }) {
  const [p,setP]=useState(""); const [err,setErr]=useState("");
  return <div className="center"><div className="card gate"><div className="logo">✦</div><h1>StoryForge</h1><p>Writing Studio Online</p><input autoFocus type="password" placeholder="Mật khẩu truy cập" value={p} onChange={e=>{setP(e.target.value);setErr("")}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();p===ACCESS&&ACCESS?onPass():setErr("Mật khẩu không đúng")}}}/><button onClick={()=>p===ACCESS&&ACCESS?onPass():setErr("Mật khẩu không đúng")}>Vào StoryForge</button>{err&&<b className="err">{err}</b>}</div></div>
}

function Auth({ onUser }) {
  const [mode,setMode]=useState("login"),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[name,setName]=useState(""),[msg,setMsg]=useState(""),[loading,setLoading]=useState(false);
  const submit=async()=>{ if(!supabase){setMsg("Chưa cấu hình Supabase.");return} if(!email||!pass){setMsg("Vui lòng nhập email và mật khẩu.");return} if(mode==="signup"&&!name.trim()){setMsg("Vui lòng nhập tên hiển thị.");return} setLoading(true);setMsg(""); try{ if(mode==="login"){const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass});if(error)throw error;if(data.user)await onUser(data.user)}else{const {data,error}=await supabase.auth.signUp({email:email.trim(),password:pass,options:{data:{display_name:name.trim()}}});if(error)throw error;if(data.user&&data.session)await onUser(data.user);else{setMsg("Đăng ký thành công. Tài khoản đang chờ Admin duyệt.");setMode("login")}}}catch(e){setMsg(e?.message||"Có lỗi xảy ra.")}finally{setLoading(false)} };
  return <div className="center"><div className="card auth"><div className="logo">✦</div><h1>StoryForge</h1><h2>{mode==="login"?"Đăng nhập":"Xin quyền truy cập"}</h2>{mode==="signup"&&<input placeholder="Tên hiển thị" value={name} onChange={e=>setName(e.target.value)}/>}<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Mật khẩu" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/><button disabled={loading} onClick={submit}>{loading?"Đang xử lý…":mode==="login"?"Đăng nhập":"Đăng ký"}</button>{msg&&<p className="msg">{msg}</p>}<button className="ghost" onClick={()=>{setMsg("");setMode(mode==="login"?"signup":"login")}}>{mode==="login"?"Chưa có tài khoản? Đăng ký":"Đã có tài khoản? Đăng nhập"}</button></div></div>
}

async function getProfile(user){
  if(!supabase||!user)return null;
  const r=await supabase.rpc("get_my_profile");
  if(r.data)return r.data;
  if(r.error)console.error("PROFILE RPC ERROR:",r.error);
  const fallback=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
  return fallback.data||null;
}

function App(){
  const [gate,setGate]=useState(sessionStorage.getItem("sf_gate")==="1"),[user,setUser]=useState(null),[prof,setProf]=useState(null),[ready,setReady]=useState(false),[checking,setChecking]=useState(false);
  const loadUserProfile=async u=>{if(!u){setUser(null);setProf(null);setChecking(false);return}setUser(u);setChecking(true);setProf(await getProfile(u));setChecking(false)};
  useEffect(()=>{if(!supabase){setReady(true);return}let alive=true;supabase.auth.getSession().then(async({data:{session}})=>{if(!alive)return;if(session?.user)await loadUserProfile(session.user);setReady(true)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(!alive)return;if(s?.user)setTimeout(()=>alive&&loadUserProfile(s.user),0);else{setUser(null);setProf(null);setChecking(false)}});return()=>{alive=false;subscription.unsubscribe()}},[]);
  if(!ready)return <Loading text="Đang tải StoryForge…"/>;
  if(!gate)return <Gate onPass={()=>{sessionStorage.setItem("sf_gate","1");setGate(true)}}/>;
  if(!user)return <Auth onUser={loadUserProfile}/>;
  if(checking)return <Loading text="Đang kiểm tra tài khoản…" sub="Đang kết nối dữ liệu StoryForge."/>;
  if(!prof)return <div className="center"><div className="card"><div className="logo">⚠</div><h2>Không đọc được hồ sơ</h2><p>StoryForge chưa đọc được hồ sơ trong Supabase.</p><button onClick={()=>location.reload()}>Thử lại</button><button className="ghost" onClick={()=>supabase.auth.signOut()}>Đăng xuất</button></div></div>;
  if(prof.status!=="approved"&&!prof.is_admin)return <Pending/>;
  return <Studio user={user} prof={prof}/>;
}
function Loading({text,sub}){return <div className="center"><div className="card"><div className="logo">✦</div><h2>{text}</h2>{sub&&<p>{sub}</p>}</div></div>}
function Pending(){return <div className="center"><div className="card"><div className="logo">⏳</div><h1>Đang chờ Admin duyệt</h1><p>Tài khoản đã đăng ký. Khi Admin duyệt, mày có thể vào StoryForge.</p><button onClick={()=>supabase.auth.signOut()}>Đăng xuất</button></div></div>}

function Studio({user,prof}){
  const [stories,setStories]=useState([]),[story,setStory]=useState(null),[chapters,setChapters]=useState([]),[chapter,setChapter]=useState(null),[tab,setTab]=useState("dashboard"),[refresh,setRefresh]=useState(0);
  const [storyModal,setStoryModal]=useState(false),[storyForm,setStoryForm]=useState({title:"",genre:"Giả tưởng",description:""}),[busy,setBusy]=useState(false);
  const reloadStories=async()=>{const {data,error}=await supabase.from("stories").select("*").order("updated_at",{ascending:false});if(error)console.error(error);else setStories(data||[])};
  const reloadChapters=async id=>{if(!id){setChapters([]);return}const {data,error}=await supabase.from("chapters").select("*").eq("story_id",id).order("number");if(error)console.error(error);else setChapters(data||[])};
  useEffect(()=>{reloadStories()},[refresh]);
  useEffect(()=>{reloadChapters(story?.id)},[story?.id,refresh]);
  const createStory=async()=>{if(!storyForm.title.trim())return;setBusy(true);const {data,error}=await supabase.from("stories").insert({title:storyForm.title.trim(),owner_id:user.id,genre:storyForm.genre,description:storyForm.description.trim()}).select().single();setBusy(false);if(error){alert(error.message);return}setStoryModal(false);setStoryForm({title:"",genre:"Giả tưởng",description:""});setStory(data);setTab("chapters");setRefresh(x=>x+1)};
  const updateStory=async patch=>{if(!story)return;const {data,error}=await supabase.from("stories").update(patch).eq("id",story.id).select().single();if(error){alert(error.message);return}setStory(data);setStories(s=>s.map(x=>x.id===data.id?data:x))};
  const deleteStory=async s=>{if(!confirm(`Xóa truyện “${s.title}” và toàn bộ dữ liệu liên quan?`))return;const {error}=await supabase.from("stories").delete().eq("id",s.id);if(error){alert(error.message);return}if(story?.id===s.id){setStory(null);setChapter(null);setTab("dashboard")}setRefresh(x=>x+1)};
  const createChapter=async()=>{if(!story)return;const n=chapters.length?Math.max(...chapters.map(c=>c.number))+1:1;const {data,error}=await supabase.from("chapters").insert({story_id:story.id,number:n,title:`Chương ${n}`,content:""}).select().single();if(error){alert(error.message);return}setChapters(c=>[...c,data].sort((a,b)=>a.number-b.number));setChapter(data);setTab("editor")};
  const deleteChapter=async c=>{if(!confirm(`Xóa ${c.title}?`))return;const {error}=await supabase.from("chapters").delete().eq("id",c.id);if(error){alert(error.message);return}if(chapter?.id===c.id)setChapter(null);setRefresh(x=>x+1)};
  const openStory=s=>{setStory(s);setChapter(null);setTab("chapters")};
  const logout=()=>supabase.auth.signOut();
  const go=id=>{setTab(id);if(id!=="editor"&&id!=="chapters")setChapter(null)};
  return <div className="app"><aside><div className="brand"><span>✦</span><div><strong>StoryForge</strong><small>Online Writing Studio</small></div></div><nav>{[["dashboard","Tổng quan"],["chapters","Chương"],["characters","Nhân vật"],["world","Thế giới"],["timeline","Dòng thời gian"],["notes","Hộp thư đến"],["canon","Canon"],["ai","Trợ lý AI"]].map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>go(id)}><span>{icon[id]}</span>{label}</button>)}{prof.is_admin&&<button className={tab==="admin"?"active":""} onClick={()=>go("admin")}><span>{icon.admin}</span>Quản trị</button>}</nav><div className="account"><b>{prof.is_admin?"Admin":prof.display_name||user.email}</b><small>{user.email}</small><button onClick={logout}>Đăng xuất</button></div></aside><main><header><div><span className="eyebrow">WRITING STUDIO ONLINE</span><h1>{story?story.title:"Ý tưởng bắt đầu từ đây."}</h1></div>{story&&<div className="headerActions"><button className="ghost" onClick={()=>{setStory(null);setChapter(null);setTab("dashboard")}}>← Danh sách truyện</button><button className="soft" onClick={()=>setStoryModal(true)}>＋ Truyện mới</button></div>}</header>{tab==="dashboard"&&<Dashboard stories={stories} onNew={()=>setStoryModal(true)} onOpen={openStory} onDelete={deleteStory}/>} {tab==="chapters"&&<Chapters story={story} chapters={chapters} onNew={createChapter} onOpen={c=>{setChapter(c);setTab("editor")}} onDelete={deleteChapter} onEditTitle={async(c,t)=>{const {data,error}=await supabase.from("chapters").update({title:t.trim()||c.title}).eq("id",c.id).select().single();if(!error){setChapters(cs=>cs.map(x=>x.id===c.id?data:x));if(chapter?.id===c.id)setChapter(data)}}}/>} {tab==="editor"&&<Editor story={story} chapter={chapter} setChapter={setChapter} setChapters={setChapters}/>} {moduleNames[tab]&&<DataModule story={story} type={tab}/>} {tab==="ai"&&<AI story={story} chapter={chapter}/>} {tab==="admin"&&prof.is_admin&&<Admin/>}</main>{storyModal&&<StoryModal form={storyForm} setForm={setStoryForm} onClose={()=>setStoryModal(false)} onSave={createStory} busy={busy}/>}</div>
}

function Dashboard({stories,onNew,onOpen,onDelete}){return <section><div className="hero"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Viết, lưu và tiếp tục ở bất kỳ đâu.</h2><p>Dữ liệu nằm trên cloud, không phụ thuộc máy tính đang bật.</p></div><button onClick={onNew}>＋ Tạo truyện mới</button></div><div className="sectionTitle"><h2>Truyện của bạn</h2><span>{stories.length} truyện</span></div>{!stories.length?<div className="empty"><div className="emptyIcon">✦</div><h3>Chưa có truyện nào</h3><p>Tạo truyện đầu tiên để bắt đầu xây dựng thế giới của mày.</p><button onClick={onNew}>Tạo truyện đầu tiên</button></div>:<div className="grid">{stories.map(s=><article className="story" key={s.id}><div className="storyTop"><span className="pill">{s.genre||"Chưa phân loại"}</span><button className="iconBtn" title="Xóa" onClick={()=>onDelete(s)}>⋯</button></div><h3>{s.title}</h3><p>{s.description||"Chưa có mô tả."}</p><button onClick={()=>onOpen(s)}>Mở truyện →</button></article>)}</div>}</section>}

function StoryModal({form,setForm,onClose,onSave,busy}){return <Modal title="Tạo truyện mới" onClose={onClose}><label>Tên truyện<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ví dụ: Việt Nam Quỷ Dị"/></label><label>Thể loại<select value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})}><option>Giả tưởng</option><option>Quỷ dị / Kinh dị</option><option>Trinh thám</option><option>Võ thuật</option><option>Khoa học viễn tưởng</option><option>Lãng mạn</option><option>Khác</option></select></label><label>Mô tả<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ý tưởng chính của truyện…"/></label><div className="modalActions"><button className="ghost" onClick={onClose}>Hủy</button><button disabled={busy||!form.title.trim()} onClick={onSave}>{busy?"Đang tạo…":"Tạo truyện"}</button></div></Modal>}

function Chapters({story,chapters,onNew,onOpen,onDelete,onEditTitle}){const [editing,setEditing]=useState(null),[title,setTitle]=useState("");if(!story)return <EmptySelect text="Chọn một truyện trước để quản lý chương."/>;return <section><div className="row"><div><span className="eyebrow">{story.genre}</span><h2>Danh sách chương</h2><p className="muted">{chapters.length} chương · dữ liệu lưu trên cloud</p></div><button onClick={onNew}>＋ Chương mới</button></div>{chapters.map(c=><div className="chapter" key={c.id}><div className="chapterMain" onClick={()=>onOpen(c)}><span className="chapterNo">{String(c.number).padStart(2,"0")}</span><div><b>{c.title}</b><small>{c.word_count||0} từ · cập nhật {new Date(c.updated_at||c.created_at).toLocaleString("vi-VN")}</small></div></div><div className="chapterActions">{editing===c.id?<><input className="smallInput" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(onEditTitle(c,title),setEditing(null))}/><button onClick={()=>{onEditTitle(c,title);setEditing(null)}}>Lưu</button></>:<><button className="soft" onClick={()=>{setEditing(c.id);setTitle(c.title)}}>Sửa tên</button><button className="danger" onClick={()=>onDelete(c)}>Xóa</button></>}</div></div>)}{!chapters.length&&<div className="empty"><div className="emptyIcon">☷</div><h3>Chưa có chương</h3><p>Tạo chương đầu tiên rồi bắt đầu viết.</p><button onClick={onNew}>＋ Chương mới</button></div>}</section>}

function Editor({story,chapter,setChapter,setChapters}){
  const [draft,setDraft]=useState(chapter?.content||"");
  const [title,setTitle]=useState(chapter?.title||"");
  const [status,setStatus]=useState("Đã lưu");
  const [wordCount,setWordCount]=useState(chapter?.word_count||0);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    setDraft(chapter?.content||"");
    setTitle(chapter?.title||"");
    setWordCount(chapter?.word_count||0);
    setStatus("Đã lưu");
  },[chapter?.id]);

  const saveNow=async()=>{
    if(!chapter||!story||saving)return;
    setSaving(true);
    setStatus("Đang lưu…");
    const wc=draft.trim()?draft.trim().split(/\s+/).length:0;
    const cleanTitle=title.trim()||chapter.title||`Chương ${chapter.number}`;
    const {data,error}=await supabase.from("chapters")
      .update({content:draft,word_count:wc,title:cleanTitle})
      .eq("id",chapter.id).select().single();
    if(error){
      console.error(error);
      setStatus("Lỗi lưu");
      setSaving(false);
      return;
    }
    setWordCount(wc);
    setTitle(data.title);
    setChapter(data);
    setChapters(cs=>cs.map(c=>c.id===data.id?data:c));
    await supabase.from("stories").update({updated_at:new Date().toISOString()}).eq("id",story.id);
    setStatus("Đã lưu cloud");
    setSaving(false);
  };

  useEffect(()=>{
    if(!chapter)return;
    const t=setTimeout(saveNow,800);
    return()=>clearTimeout(t);
  },[draft,title,chapter?.id]);

  if(!chapter)return <EmptySelect text="Chọn một chương để bắt đầu viết."/>;
  return <section className="editorPage">
    <div className="editorHead">
      <div>
        <span className="eyebrow">{story?.title}</span>
        <input className="chapterTitleInput" value={title} onChange={e=>setTitle(e.target.value)} onBlur={saveNow}/>
        <div className="editorMeta"><span>{wordCount} từ</span><span>•</span><span className={status.includes("Lỗi")?"bad":"ok"}>● {status}</span></div>
      </div>
      <div className="headerActions">
        <button className="soft" disabled={saving} onClick={saveNow}>{saving?"Đang lưu…":"Lưu ngay"}</button>
        <button className="ghost" onClick={()=>setChapter(null)}>← Danh sách chương</button>
      </div>
    </div>
    <div className="editorLayout">
      <div className="paper"><textarea value={draft} onChange={e=>setDraft(e.target.value)} onBlur={saveNow} placeholder="Bắt đầu viết chương ở đây…" spellCheck="true"/></div>
      <aside className="editorSide">
        <div className="sideCard"><h3>✦ Trợ lý AI</h3><p>AI sẽ hỗ trợ ý tưởng, logic và nhân vật mà không tự ý sửa bản thảo.</p><button className="soft" onClick={()=>alert("AI API sẽ được nối vào server ở bước AI riêng.")}>Gợi ý cho đoạn này</button></div>
        <div className="sideCard"><h3>Thông tin chương</h3><div className="stat"><span>Số từ</span><b>{wordCount}</b></div><div className="stat"><span>Lưu trữ</span><b>Supabase Cloud</b></div><div className="stat"><span>Trạng thái</span><b>{status}</b></div></div>
      </aside>
    </div>
  </section>
}

function DataModule({story,type}){const [items,setItems]=useState([]),[loading,setLoading]=useState(false),[modal,setModal]=useState(false),[editing,setEditing]=useState(null);const cfg={characters:{table:"characters",title:"Nhân vật",singular:"nhân vật",fields:["name","role","age","personality","appearance","relationships","notes"]},world:{table:"world_entries",title:"Thế giới",singular:"mục thế giới",fields:["name","category","description","rules","notes"]},timeline:{table:"timeline_events",title:"Dòng thời gian",singular:"sự kiện",fields:["date_label","title","description","characters"]},notes:{table:"notes",title:"Hộp thư đến",singular:"ghi chú",fields:["title","content","category","status"]},canon:{table:"canon_items",title:"Canon",singular:"mục canon",fields:["key","value","source","locked"]}}[type];const [form,setForm]=useState({});const load=async()=>{if(!story){setItems([]);return}setLoading(true);let q=supabase.from(cfg.table).select("*").eq("story_id",story.id).order("created_at",{ascending:false});if(type==="timeline")q=q.order("sort_order",{ascending:true});const {data,error}=await q;if(error)console.error(error);else setItems(data||[]);setLoading(false)};useEffect(()=>{load()},[story?.id,type]);if(!story)return <EmptySelect text={`Chọn một truyện để quản lý ${cfg.title.toLowerCase()}.`}/>;const openNew=()=>{const base={};cfg.fields.forEach(f=>base[f]=f==="locked"?false:f==="category"?"Chưa phân loại":f==="status"?"Inbox":"");setForm(base);setEditing(null);setModal(true)};const openEdit=i=>{setForm({...i});setEditing(i);setModal(true)};const save=async()=>{if(!String(form[cfg.fields[0]]||"").trim()){alert("Hãy nhập tên hoặc tiêu đề.");return}const payload={...form,story_id:story.id};delete payload.id;delete payload.created_at;delete payload.updated_at;let r=editing?await supabase.from(cfg.table).update(payload).eq("id",editing.id).select().single():await supabase.from(cfg.table).insert(payload).select().single();if(r.error){alert(r.error.message);return}setModal(false);load()};const del=async i=>{if(!confirm("Xóa mục này?"))return;const {error}=await supabase.from(cfg.table).delete().eq("id",i.id);if(error)alert(error.message);else load()};return <section><div className="row"><div><span className="eyebrow">{story.title}</span><h2>{cfg.title}</h2><p className="muted">Kho dữ liệu của truyện · {items.length} mục</p></div><button onClick={openNew}>＋ Thêm {cfg.singular}</button></div>{loading?<div className="empty">Đang tải…</div>:!items.length?<div className="empty"><div className="emptyIcon">{icon[type]}</div><h3>Chưa có {cfg.singular}</h3><p>Thêm dữ liệu để StoryForge xây dựng bộ nhớ cho truyện.</p><button onClick={openNew}>＋ Thêm mới</button></div>:<div className="dataGrid">{items.map(i=><article className="dataCard" key={i.id}><div className="dataTop"><span className="pill">{i.category||i.status||i.role||type}</span><div><button className="iconBtn" onClick={()=>openEdit(i)}>✎</button><button className="iconBtn dangerText" onClick={()=>del(i)}>×</button></div></div><h3>{i.name||i.title||i.key||"Không có tiêu đề"}</h3>{i.role&&<p><b>Vai trò:</b> {i.role}</p>}{i.age&&<p><b>Tuổi:</b> {i.age}</p>}{i.date_label&&<p><b>Thời điểm:</b> {i.date_label}</p>}<p className="clamp">{i.description||i.content||i.value||i.personality||i.notes||"Chưa có nội dung."}</p></article>)}</div>}{modal&&<DataModal cfg={cfg} type={type} form={form} setForm={setForm} editing={editing} onClose={()=>setModal(false)} onSave={save}/>}</section>}

function DataModal({cfg,type,form,setForm,editing,onClose,onSave}){const labels={name:"Tên",role:"Vai trò",age:"Tuổi",personality:"Tính cách",appearance:"Ngoại hình",relationships:"Quan hệ",notes:"Ghi chú",category:"Phân loại",description:"Mô tả",rules:"Quy tắc",date_label:"Mốc thời gian",title:"Tiêu đề",characters:"Nhân vật liên quan",content:"Nội dung",status:"Trạng thái",key:"Tên canon",value:"Giá trị canon",source:"Nguồn / lý do",locked:"Khóa canon"};return <Modal title={editing?`Sửa ${cfg.singular}`:`Thêm ${cfg.singular}`} onClose={onClose}><div className="formGrid">{cfg.fields.map(f=><label key={f}>{labels[f]||f}{f==="locked"?<input type="checkbox" checked={!!form[f]} onChange={e=>setForm({...form,[f]:e.target.checked})}/>:f==="status"?<select value={form[f]||"Inbox"} onChange={e=>setForm({...form,[f]:e.target.value})}><option>Inbox</option><option>Đã xử lý</option><option>Đưa vào Canon</option></select>:f==="category"?<input value={form[f]||""} onChange={e=>setForm({...form,[f]:e.target.value})}/>:<textarea rows={f==="name"||f==="title"||f==="key"||f==="age"?2:4} value={form[f]??""} onChange={e=>setForm({...form,[f]:e.target.value})} placeholder={labels[f]}/>}</label>)}</div><div className="modalActions"><button className="ghost" onClick={onClose}>Hủy</button><button onClick={onSave}>{editing?"Lưu thay đổi":"Thêm vào truyện"}</button></div></Modal>}

function AI({story,chapter}){const [prompt,setPrompt]=useState("");const [messages,setMessages]=useState([{role:"assistant",text:"Tao có thể hỗ trợ mày lên ý tưởng, kiểm tra logic và phát triển nhân vật. AI API thật sẽ được nối ở bước server để giữ API key an toàn."}]);const send=()=>{if(!prompt.trim())return;setMessages(m=>[...m,{role:"user",text:prompt.trim()},{role:"assistant",text:"Đã nhận yêu cầu. Khi kết nối AI server, trợ lý sẽ đọc Canon, nhân vật, thế giới và chương hiện tại trước khi trả lời."}]);setPrompt("")};return <section><div className="aiHeader"><div><span className="eyebrow">STORYFORGE AI</span><h2>Trợ lý AI</h2><p className="muted">{story?`Đang làm việc với: ${story.title}`:"Chọn truyện để AI có ngữ cảnh cụ thể."}</p></div></div><div className="aiWorkspace"><div className="chat">{messages.map((m,i)=><div className={`bubble ${m.role}`} key={i}>{m.text}</div>)}<div className="promptRow"><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ví dụ: kiểm tra logic của chương này…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}/><button onClick={send}>Gửi ↑</button></div></div><div className="aiInfo"><h3>Nguyên tắc AI</h3><ul><li>Không tự ý thay đổi Canon.</li><li>Không tự ý giết/thêm nhân vật lớn.</li><li>Phát hiện mâu thuẫn trước khi đề xuất.</li><li>Ưu tiên gợi ý, không chiếm quyền viết.</li></ul></div></div></section>}

function Admin(){const [users,setUsers]=useState([]);const load=async()=>{const {data,error}=await supabase.from("profiles").select("*").order("created_at");if(error)console.error(error);else setUsers(data||[])};useEffect(()=>{load()},[]);const act=async(id,status)=>{const {error}=await supabase.rpc("admin_set_user_status",{target_id:id,new_status:status});if(error)alert(error.message);else load()};return <section><div className="row"><div><span className="eyebrow">ADMIN</span><h2>Quản trị người dùng</h2><p className="muted">Duyệt hoặc từ chối tài khoản truy cập StoryForge.</p></div></div>{users.map(u=><div className="userRow" key={u.id}><div><b>{u.display_name||"User"}</b><small>{u.email}</small></div><div><span className={`status ${u.status}`}>{u.status}</span>{!u.is_admin&&<><button onClick={()=>act(u.id,"approved")}>Duyệt</button><button className="danger" onClick={()=>act(u.id,"rejected")}>Từ chối</button></>}</div></div>)}</section>}

function EmptySelect({text}){return <div className="empty"><div className="emptyIcon">✦</div><h3>Chưa chọn truyện</h3><p>{text}</p></div>}
function Modal({title,onClose,children}){return <div className="modalBack" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modalHead"><h2>{title}</h2><button className="iconBtn" onClick={onClose}>×</button></div>{children}</div></div>}

createRoot(document.getElementById("root")).render(<App/>);
