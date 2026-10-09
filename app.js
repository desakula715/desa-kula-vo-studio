const $=id=>document.getElementById(id);
const sample=`Setelah gedung KDMP berdiri...

Pertanyaannya bukan lagi,
siapa yang membangun?

Tetapi...
siapa yang akan mengelola?

Karena sebuah bangunan,
tidak akan berjalan sendiri.

Di balik gedung itu,
ada pengurus,
ada modal,
ada aturan,
dan tentu saja...
ada tanggung jawab.`;
$("sampleBtn").addEventListener("click",()=>{$("script").value=sample;updateCount()});
$("script").addEventListener("input",updateCount);
function updateCount(){$("count").textContent=$("script").value.length.toLocaleString("id-ID")}
$("speed").addEventListener("input",()=>$("speedText").textContent=`${$("speed").value}x`);
let audioUrl=null;
$("generate").addEventListener("click",async()=>{
 const text=$("script").value.trim();
 if(!text){$("status").textContent="Masukkan naskah VO terlebih dahulu.";return}
 if(text.length>4096){$("status").textContent="Maksimal 4.096 karakter per generate. Auto Break menyusul.";return}
 $("generate").disabled=true;$("generate").textContent="⏳ MEMBUAT AUDIO...";$("status").textContent="Menghubungi backend TTS...";
 try{
  const r=await fetch("/api/generate-voice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,style:$("style").value,voice:$("voice").value,speed:Number($("speed").value)})});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||`Permintaan gagal (${r.status}).`)}
  const blob=await r.blob();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);
  $("audio").src=audioUrl;$("download").href=audioUrl;$("download").classList.remove("disabled");$("audioLabel").textContent="Audio siap diputar. Suara dibuat oleh Gemini AI.";$("status").textContent="Berhasil! Dengarkan audio atau download WAV.";
}catch(e){$("status").textContent=`${e.message} Pastikan backend sudah dideploy dan GEMINI_API_KEY diatur di Vercel.`}
 finally{$("generate").disabled=false;$("generate").textContent="🎙️ GENERATE VO"}
});
updateCount();
